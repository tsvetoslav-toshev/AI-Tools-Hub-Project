<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TwoFactorService;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;

class TwoFactorController extends Controller
{
    protected TwoFactorService $twoFactorService;

    public function __construct(TwoFactorService $twoFactorService)
    {
        $this->twoFactorService = $twoFactorService;
    }

    /**
     * Send a 2FA code to the authenticated user's email.
     */
    public function sendCode(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $result = $this->twoFactorService->generateAndSendCode($user);

        // Log OTP sent if successful
        if ($result['success']) {
            AuditService::logOtpSent($user, $request);
        }

        $statusCode = $result['success'] ? 200 : 429;

        return response()->json($result, $statusCode);
    }

    /**
     * Verify a 2FA code.
     */
    public function verifyCode(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
            'trust_device' => 'boolean',
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $result = $this->twoFactorService->verifyCode($user, $request->input('code'));

        if (!$result['success']) {
            // Log failed OTP attempt
            AuditService::logOtpFailed($user, $request);
            return response()->json($result, 422);
        }

        // Log successful OTP verification
        AuditService::logOtpVerified($user, $request);

        // Update user's 2FA verification timestamp (for API stateless authentication)
        $user->update(['two_factor_verified_at' => now()]);

        // Create trusted device token if requested
        $trustedToken = null;
        if ($request->input('trust_device', false)) {
            $trustedToken = $this->twoFactorService->createTrustedDevice($user, $request);
        }

        $response = response()->json([
            'message' => $result['message'],
            'verified' => true,
        ]);

        // Set cookie if trusted device
        if ($trustedToken) {
            $response->cookie(
                'trusted_device_token',
                $trustedToken,
                60 * 24 * 30, // 30 days
                '/',
                null,
                config('session.secure', false), // secure (use config, false for localhost)
                true, // httpOnly
                false,
                'lax' // SameSite=Lax (more permissive for cross-origin in dev)
            );
        }

        return $response;
    }

    /**
     * Check 2FA status.
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $trustedToken = $request->cookie('trusted_device_token');
        $isTrusted = $this->twoFactorService->isTrustedDevice($user, $trustedToken, $request);
        
        // Check if user has verified 2FA in the last hour
        $isVerified = $user->two_factor_verified_at && $user->two_factor_verified_at > now()->subHour();

        return response()->json([
            'verified' => $isVerified || $isTrusted,
            'trusted_device' => $isTrusted,
        ]);
    }

    /**
     * List all trusted devices for the authenticated user.
     */
    public function listTrustedDevices(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $devices = $user->trustedDevices()
            ->where('expires_at', '>', now())
            ->orderBy('last_used_at', 'desc')
            ->get(['id', 'device_name', 'ip_address', 'last_used_at', 'created_at', 'expires_at']);

        return response()->json($devices);
    }

    /**
     * Revoke a specific trusted device.
     */
    public function revokeTrustedDevice(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $deleted = $this->twoFactorService->revokeTrustedDevice($user, $id);

        if (!$deleted) {
            return response()->json(['message' => 'Device not found.'], 404);
        }

        return response()->json(['message' => 'Trusted device revoked successfully.']);
    }

    /**
     * Revoke all trusted devices for the authenticated user.
     */
    public function revokeAllTrustedDevices(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $count = $this->twoFactorService->revokeAllTrustedDevices($user);

        return response()->json([
            'message' => "Successfully revoked {$count} trusted device(s).",
            'count' => $count,
        ]);
    }
}
