<?php

namespace App\Services;

use App\Models\User;
use App\Models\TwoFactorCode;
use App\Models\TrustedDevice;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use App\Mail\TwoFactorCodeMail;
use Carbon\Carbon;

class TwoFactorService
{
    const CODE_LENGTH = 6;
    const CODE_EXPIRY_MINUTES = 10;
    const MAX_EMAILS_PER_HOUR = 5;
    const MAX_FAILED_ATTEMPTS = 5;
    const LOCKOUT_MINUTES = 10;

    /**
     * Generate and send a 2FA code to the user's email.
     */
    public function generateAndSendCode(User $user): array
    {
        // Check rate limit for sending emails
        if ($this->hasExceededEmailRateLimit($user->id)) {
            return [
                'success' => false,
                'message' => 'Too many email requests. Please try again later.',
            ];
        }

        // Check if user is locked out
        if ($this->isLockedOut($user->id)) {
            $remainingTime = $this->getRemainingLockoutTime($user->id);
            return [
                'success' => false,
                'message' => "Account temporarily locked. Please try again in {$remainingTime} minutes.",
            ];
        }

        // Generate 6-digit code
        $code = $this->generateCode();

        // Hash the code for secure storage
        $codeHash = Hash::make($code);

        // Invalidate any existing valid codes for this user
        TwoFactorCode::forUser($user->id)
            ->valid()
            ->update(['consumed_at' => now()]);

        // Create new code record
        TwoFactorCode::create([
            'user_id' => $user->id,
            'code_hash' => $codeHash,
            'expires_at' => now()->addMinutes(self::CODE_EXPIRY_MINUTES),
        ]);

        // Send email
        Mail::to($user->email)->send(new TwoFactorCodeMail($code, $user->name));

        // TODO: REMOVE FOR PRODUCTION - Display 2FA code in console for demo/testing
        \Log::info("
=====================================
🔐 2FA CODE FOR DEMO/TESTING
=====================================
User: {$user->name} ({$user->email})
Code: {$code}
Expires in: " . self::CODE_EXPIRY_MINUTES . " minutes
=====================================
        ");

        // Increment email counter
        $this->incrementEmailCounter($user->id);

        return [
            'success' => true,
            'message' => 'Verification code sent to your email.',
            'expires_in_minutes' => self::CODE_EXPIRY_MINUTES,
        ];
    }

    /**
     * Verify a 2FA code.
     */
    public function verifyCode(User $user, string $code): array
    {
        // Check if user is locked out
        if ($this->isLockedOut($user->id)) {
            $remainingTime = $this->getRemainingLockoutTime($user->id);
            return [
                'success' => false,
                'message' => "Account temporarily locked. Please try again in {$remainingTime} minutes.",
            ];
        }

        // Get the latest valid code for this user
        $twoFactorCode = TwoFactorCode::forUser($user->id)
            ->valid()
            ->latest()
            ->first();

        if (!$twoFactorCode) {
            $this->incrementFailedAttempts($user->id);
            return [
                'success' => false,
                'message' => 'Invalid or expired verification code.',
            ];
        }

        // Verify the code
        if (!Hash::check($code, $twoFactorCode->code_hash)) {
            $this->incrementFailedAttempts($user->id);
            
            // Check if we should lock out after this attempt
            if ($this->shouldLockout($user->id)) {
                $this->lockout($user->id);
                return [
                    'success' => false,
                    'message' => 'Too many failed attempts. Account locked for ' . self::LOCKOUT_MINUTES . ' minutes.',
                ];
            }

            return [
                'success' => false,
                'message' => 'Invalid verification code.',
            ];
        }

        // Mark code as consumed
        $twoFactorCode->markAsConsumed();

        // Clear failed attempts
        $this->clearFailedAttempts($user->id);

        return [
            'success' => true,
            'message' => 'Two-factor authentication successful.',
        ];
    }

    /**
     * Generate a random 6-digit code.
     */
    protected function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), self::CODE_LENGTH, '0', STR_PAD_LEFT);
    }

    /**
     * Check if user has exceeded email rate limit.
     */
    protected function hasExceededEmailRateLimit(int $userId): bool
    {
        $key = "2fa_email_count_{$userId}";
        $count = Cache::get($key, 0);
        return $count >= self::MAX_EMAILS_PER_HOUR;
    }

    /**
     * Increment email counter.
     */
    protected function incrementEmailCounter(int $userId): void
    {
        $key = "2fa_email_count_{$userId}";
        $count = Cache::get($key, 0);
        Cache::put($key, $count + 1, now()->addHour());
    }

    /**
     * Check if user is locked out.
     */
    protected function isLockedOut(int $userId): bool
    {
        $key = "2fa_lockout_{$userId}";
        return Cache::has($key);
    }

    /**
     * Get remaining lockout time in minutes.
     */
    protected function getRemainingLockoutTime(int $userId): int
    {
        $key = "2fa_lockout_{$userId}";
        $expiresAt = Cache::get($key);
        
        if (!$expiresAt) {
            return 0;
        }

        $remaining = Carbon::parse($expiresAt)->diffInMinutes(now());
        return max(1, $remaining);
    }

    /**
     * Increment failed attempts counter.
     */
    protected function incrementFailedAttempts(int $userId): void
    {
        $key = "2fa_failed_attempts_{$userId}";
        $attempts = Cache::get($key, 0);
        Cache::put($key, $attempts + 1, now()->addMinutes(self::LOCKOUT_MINUTES));
    }

    /**
     * Check if user should be locked out.
     */
    protected function shouldLockout(int $userId): bool
    {
        $key = "2fa_failed_attempts_{$userId}";
        $attempts = Cache::get($key, 0);
        return $attempts >= self::MAX_FAILED_ATTEMPTS;
    }

    /**
     * Lock out the user.
     */
    protected function lockout(int $userId): void
    {
        $key = "2fa_lockout_{$userId}";
        $expiresAt = now()->addMinutes(self::LOCKOUT_MINUTES);
        Cache::put($key, $expiresAt->toDateTimeString(), $expiresAt);
        
        // Clear failed attempts
        $this->clearFailedAttempts($userId);
    }

    /**
     * Clear failed attempts counter.
     */
    protected function clearFailedAttempts(int $userId): void
    {
        $key = "2fa_failed_attempts_{$userId}";
        Cache::forget($key);
    }

    /**
     * Create a trusted device token.
     */
    public function createTrustedDevice(User $user, Request $request = null): string
    {
        // Generate a unique secure token
        $plainToken = bin2hex(random_bytes(32));
        $hashedToken = hash('sha256', $plainToken);
        
        // Get request data
        $req = $request ?: request();
        $userAgent = $req->header('User-Agent') ?? 'Unknown';
        $ipAddress = $req->ip();
        
        // Create device fingerprint from user agent and other data
        $deviceFingerprint = hash('sha256', $userAgent . $ipAddress);
        
        // Determine device name from user agent
        $deviceName = $this->getDeviceName($userAgent);
        
        // Clean up expired devices for this user
        $user->trustedDevices()->where('expires_at', '<', now())->delete();
        
        // Create trusted device record
        TrustedDevice::create([
            'user_id' => $user->id,
            'device_token' => $hashedToken,
            'device_name' => $deviceName,
            'device_fingerprint' => $deviceFingerprint,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'last_used_at' => now(),
            'expires_at' => now()->addDays(30),
        ]);
        
        return $plainToken; // Return plain token to set in cookie
    }

    /**
     * Check if device is trusted.
     */
    public function isTrustedDevice(User $user, ?string $plainToken, Request $request = null): bool
    {
        if (!$plainToken) {
            return false;
        }

        $hashedToken = hash('sha256', $plainToken);
        $req = $request ?: request();
        
        // Find trusted device
        $trustedDevice = $user->trustedDevices()
            ->where('device_token', $hashedToken)
            ->where('expires_at', '>', now())
            ->first();
        
        if (!$trustedDevice) {
            return false;
        }
        
        // Optional: Verify device fingerprint for extra security
        $userAgent = $req->header('User-Agent') ?? 'Unknown';
        $ipAddress = $req->ip();
        $currentFingerprint = hash('sha256', $userAgent . $ipAddress);
        
        // Update last used timestamp
        $trustedDevice->update(['last_used_at' => now()]);
        
        // Note: We're not strictly checking fingerprint match to allow for IP changes
        // but you can enable this for stricter security
        // if ($trustedDevice->device_fingerprint !== $currentFingerprint) {
        //     return false;
        // }
        
        return true;
    }

    /**
     * Extract device name from user agent.
     */
    protected function getDeviceName(string $userAgent): string
    {
        // Simple device detection
        if (stripos($userAgent, 'iPhone') !== false) {
            return 'iPhone';
        } elseif (stripos($userAgent, 'iPad') !== false) {
            return 'iPad';
        } elseif (stripos($userAgent, 'Android') !== false) {
            return 'Android Device';
        } elseif (stripos($userAgent, 'Windows') !== false) {
            if (stripos($userAgent, 'Chrome') !== false) {
                return 'Chrome on Windows';
            } elseif (stripos($userAgent, 'Firefox') !== false) {
                return 'Firefox on Windows';
            } elseif (stripos($userAgent, 'Edge') !== false) {
                return 'Edge on Windows';
            }
            return 'Windows Device';
        } elseif (stripos($userAgent, 'Macintosh') !== false || stripos($userAgent, 'Mac OS') !== false) {
            if (stripos($userAgent, 'Chrome') !== false) {
                return 'Chrome on Mac';
            } elseif (stripos($userAgent, 'Safari') !== false) {
                return 'Safari on Mac';
            } elseif (stripos($userAgent, 'Firefox') !== false) {
                return 'Firefox on Mac';
            }
            return 'Mac Device';
        } elseif (stripos($userAgent, 'Linux') !== false) {
            return 'Linux Device';
        }
        
        return 'Unknown Device';
    }

    /**
     * Revoke a trusted device.
     */
    public function revokeTrustedDevice(User $user, int $deviceId): bool
    {
        return $user->trustedDevices()->where('id', $deviceId)->delete() > 0;
    }

    /**
     * Revoke all trusted devices for a user.
     */
    public function revokeAllTrustedDevices(User $user): int
    {
        return $user->trustedDevices()->delete();
    }
}
