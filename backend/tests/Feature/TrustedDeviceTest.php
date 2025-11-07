<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\TrustedDevice;

class TrustedDeviceTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function user_can_trust_device_after_2fa_verification()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        // Login to get token
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $token = $loginResponse->json('token');

        // Request 2FA code
        $this->postJson('/api/2fa/send', [], [
            'Authorization' => "Bearer $token",
        ])->assertOk();

        // Get the generated code using TwoFactorService
        $twoFactorService = app(\App\Services\TwoFactorService::class);
        
        // For testing, we need to peek at the code
        // In real scenario, user would receive it via email
        // We'll generate a known code for testing
        $code = '123456';
        $twoFactorService->storeCode($user, $code);

        // Verify 2FA with trust_device = true
        $response = $this->postJson('/api/2fa/verify', [
            'code' => $code,
            'trust_device' => true,
        ], [
            'Authorization' => "Bearer $token",
        ]);

        $response->assertOk()
            ->assertJson(['verified' => true]);

        // Check that a trusted device was created
        $this->assertDatabaseHas('trusted_devices', [
            'user_id' => $user->id,
        ]);

        // Verify cookie was set
        $response->assertCookie('trusted_device_token');
    }

    /** @test */
    public function trusted_device_bypasses_2fa_on_next_login()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        // Create a trusted device token
        $plainToken = bin2hex(random_bytes(32));
        $hashedToken = hash('sha256', $plainToken);

        TrustedDevice::create([
            'user_id' => $user->id,
            'device_token' => $hashedToken,
            'device_name' => 'Test Device',
            'device_fingerprint' => hash('sha256', 'test-fingerprint'),
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test Browser',
            'last_used_at' => now(),
            'expires_at' => now()->addDays(30),
        ]);

        // Login to get token
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $token = $loginResponse->json('token');

        // Check 2FA status with trusted device cookie
        $response = $this->withCookie('trusted_device_token', $plainToken)
            ->getJson('/api/2fa/status', [
                'Authorization' => "Bearer $token",
            ]);

        $response->assertOk()
            ->assertJson([
                'verified' => true,
                'trusted_device' => true,
            ]);
    }

    /** @test */
    public function user_can_list_trusted_devices()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        // Create some trusted devices
        TrustedDevice::create([
            'user_id' => $user->id,
            'device_token' => hash('sha256', 'token1'),
            'device_name' => 'Chrome on Windows',
            'device_fingerprint' => 'fingerprint1',
            'ip_address' => '192.168.1.1',
            'user_agent' => 'Chrome',
            'last_used_at' => now(),
            'expires_at' => now()->addDays(30),
        ]);

        TrustedDevice::create([
            'user_id' => $user->id,
            'device_token' => hash('sha256', 'token2'),
            'device_name' => 'Firefox on Mac',
            'device_fingerprint' => 'fingerprint2',
            'ip_address' => '192.168.1.2',
            'user_agent' => 'Firefox',
            'last_used_at' => now(),
            'expires_at' => now()->addDays(30),
        ]);

        $response = $this->getJson('/api/2fa/trusted-devices', [
            'Authorization' => "Bearer $token",
        ]);

        $response->assertOk()
            ->assertJsonCount(2);
    }

    /** @test */
    public function user_can_revoke_trusted_device()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $device = TrustedDevice::create([
            'user_id' => $user->id,
            'device_token' => hash('sha256', 'token1'),
            'device_name' => 'Chrome on Windows',
            'device_fingerprint' => 'fingerprint1',
            'ip_address' => '192.168.1.1',
            'user_agent' => 'Chrome',
            'last_used_at' => now(),
            'expires_at' => now()->addDays(30),
        ]);

        $response = $this->deleteJson("/api/2fa/trusted-devices/{$device->id}", [], [
            'Authorization' => "Bearer $token",
        ]);

        $response->assertOk()
            ->assertJson(['message' => 'Trusted device revoked successfully.']);

        $this->assertDatabaseMissing('trusted_devices', [
            'id' => $device->id,
        ]);
    }

    /** @test */
    public function user_can_revoke_all_trusted_devices()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        // Create multiple trusted devices
        TrustedDevice::factory()->count(3)->create([
            'user_id' => $user->id,
        ]);

        $response = $this->deleteJson('/api/2fa/trusted-devices', [], [
            'Authorization' => "Bearer $token",
        ]);

        $response->assertOk()
            ->assertJsonFragment(['count' => 3]);

        $this->assertEquals(0, $user->trustedDevices()->count());
    }

    /** @test */
    public function expired_trusted_devices_are_not_valid()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        // Create an expired trusted device
        $plainToken = bin2hex(random_bytes(32));
        $hashedToken = hash('sha256', $plainToken);

        TrustedDevice::create([
            'user_id' => $user->id,
            'device_token' => $hashedToken,
            'device_name' => 'Test Device',
            'device_fingerprint' => hash('sha256', 'test-fingerprint'),
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test Browser',
            'last_used_at' => now()->subDays(31),
            'expires_at' => now()->subDay(), // Expired
        ]);

        // Login to get token
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $token = $loginResponse->json('token');

        // Check 2FA status with expired device cookie
        $response = $this->withCookie('trusted_device_token', $plainToken)
            ->getJson('/api/2fa/status', [
                'Authorization' => "Bearer $token",
            ]);

        $response->assertOk()
            ->assertJson([
                'verified' => false,
                'trusted_device' => false,
            ]);
    }
}
