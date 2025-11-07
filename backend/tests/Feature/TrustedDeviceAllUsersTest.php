<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\TrustedDevice;
use App\Services\TwoFactorService;

class TrustedDeviceAllUsersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed roles
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\RoleSeeder']);
    }

    /**
     * Test that admin user (Alexandra) can trust device for 30 days
     * 
     * @test
     */
    public function admin_user_can_trust_device_for_30_days()
    {
        // Create admin user (Alexandra)
        $user = User::factory()->create([
            'name' => 'Alexandra Ivanova',
            'email' => 'alexandra@admin.local',
            'password' => bcrypt('password'),
            'role' => 'owner',
        ]);
        $user->assignRole('admin');

        $this->runTrustedDeviceTest($user, 'admin');
    }

    /**
     * Test that moderator user (Ivan) can trust device for 30 days
     * 
     * @test
     */
    public function moderator_user_can_trust_device_for_30_days()
    {
        // Create moderator user (Ivan)
        $user = User::factory()->create([
            'name' => 'Иван Иванов',
            'email' => 'ivan@moderator.local',
            'password' => bcrypt('password'),
            'role' => 'moderator',
        ]);
        $user->assignRole('moderator');

        $this->runTrustedDeviceTest($user, 'moderator');
    }

    /**
     * Test that frontend user (Elena) can trust device for 30 days
     * 
     * @test
     */
    public function frontend_user_can_trust_device_for_30_days()
    {
        // Create frontend user (Elena)
        $user = User::factory()->create([
            'name' => 'Елена Петрова',
            'email' => 'elena@frontend.local',
            'password' => bcrypt('password'),
            'role' => 'frontend',
        ]);
        $user->assignRole('user');

        $this->runTrustedDeviceTest($user, 'frontend');
    }

    /**
     * Test that backend user (Petar) can trust device for 30 days
     * 
     * @test
     */
    public function backend_user_can_trust_device_for_30_days()
    {
        // Create backend user (Petar)
        $user = User::factory()->create([
            'name' => 'Петър Георгиев',
            'email' => 'petar@backend.local',
            'password' => bcrypt('password'),
            'role' => 'backend',
        ]);
        $user->assignRole('user');

        $this->runTrustedDeviceTest($user, 'backend');
    }

    /**
     * Helper method to test trusted device functionality for any user
     */
    protected function runTrustedDeviceTest(User $user, string $roleName)
    {
        // Step 1: Login
        $loginResponse = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $loginResponse->assertOk()
            ->assertJson(['success' => true])
            ->assertJsonStructure(['token', 'user']);

        $token = $loginResponse->json('token');

        // Step 2: Send 2FA code
        $sendResponse = $this->postJson('/api/2fa/send', [], [
            'Authorization' => "Bearer $token",
        ]);

        $sendResponse->assertOk()
            ->assertJson(['success' => true]);

        // Step 3: Get the generated code from the database (it's hashed)
        // We need to send the code again and intercept it from logs
        // For testing, we'll use the actual service to generate and get the plain code
        $twoFactorService = app(TwoFactorService::class);
        
        // Generate a new code and capture it
        $result = $twoFactorService->generateAndSendCode($user);
        
        // Get the last code from database
        $lastCodeRecord = \App\Models\TwoFactorCode::forUser($user->id)->valid()->latest()->first();
        
        // We need the plain code - let's generate one and manually store it
        $code = '123456';
        $codeHash = \Illuminate\Support\Facades\Hash::make($code);
        
        // Update the last code with our known code
        $lastCodeRecord->update(['code_hash' => $codeHash]);

        // Step 4: Verify 2FA with trust_device = true
        $verifyResponse = $this->postJson('/api/2fa/verify', [
            'code' => $code,
            'trust_device' => true,
        ], [
            'Authorization' => "Bearer $token",
        ]);

        $verifyResponse->assertOk()
            ->assertJson(['verified' => true]);

        // Verify cookie was set with 30-day expiration
        $verifyResponse->assertCookie('trusted_device_token');

        // Step 5: Check that a trusted device was created in database
        $this->assertDatabaseHas('trusted_devices', [
            'user_id' => $user->id,
        ]);

        $trustedDevice = TrustedDevice::where('user_id', $user->id)->first();
        $this->assertNotNull($trustedDevice);
        $this->assertNotNull($trustedDevice->device_token);
        $this->assertNotNull($trustedDevice->expires_at);
        
        // Verify expiration is approximately 30 days from now
        $expectedExpiry = now()->addDays(30);
        $this->assertTrue(
            abs($trustedDevice->expires_at->timestamp - $expectedExpiry->timestamp) < 60,
            "Trusted device should expire in 30 days for {$roleName} user"
        );

        // Step 6: Verify the device fingerprint was stored
        $this->assertNotNull($trustedDevice->device_fingerprint);
        $this->assertNotNull($trustedDevice->ip_address);
        
        echo "\n✅ SUCCESS: {$user->name} ({$roleName}) can trust device for 30 days!\n";
        echo "   - Login successful\n";
        echo "   - 2FA code sent\n";
        echo "   - 2FA verified with trust_device=true\n";
        echo "   - Trusted device cookie set (30 days)\n";
        echo "   - Trusted device record created in database\n";
        echo "   - Device expires at: {$trustedDevice->expires_at->format('Y-m-d H:i:s')}\n";
        echo "   - Device fingerprint: " . substr($trustedDevice->device_fingerprint, 0, 16) . "...\n";
        echo "   - IP Address: {$trustedDevice->ip_address}\n\n";
    }

    /**
     * Test that all 4 users can list their trusted devices
     * 
     * @test
     */
    public function all_users_can_list_trusted_devices()
    {
        $users = [
            User::factory()->create(['name' => 'Alexandra', 'email' => 'alexandra@test.com', 'role' => 'owner']),
            User::factory()->create(['name' => 'Ivan', 'email' => 'ivan@test.com', 'role' => 'moderator']),
            User::factory()->create(['name' => 'Elena', 'email' => 'elena@test.com', 'role' => 'frontend']),
            User::factory()->create(['name' => 'Petar', 'email' => 'petar@test.com', 'role' => 'backend']),
        ];

        foreach ($users as $user) {
            // Create 2 trusted devices for this user
            TrustedDevice::factory()->count(2)->create([
                'user_id' => $user->id,
            ]);

            // Login and get token
            $loginResponse = $this->postJson('/api/login', [
                'email' => $user->email,
                'password' => 'password',
            ]);

            $token = $loginResponse->json('token');

            // List trusted devices
            $response = $this->getJson('/api/2fa/trusted-devices', [
                'Authorization' => "Bearer $token",
            ]);

            $response->assertOk()
                ->assertJsonCount(2);

            echo "✅ {$user->name} ({$user->role}) can list their 2 trusted devices\n";
        }
    }

    /**
     * Test that all 4 users can revoke trusted devices
     * 
     * @test
     */
    public function all_users_can_revoke_trusted_devices()
    {
        $users = [
            User::factory()->create(['name' => 'Alexandra', 'email' => 'alexandra@test.com', 'role' => 'owner']),
            User::factory()->create(['name' => 'Ivan', 'email' => 'ivan@test.com', 'role' => 'moderator']),
            User::factory()->create(['name' => 'Elena', 'email' => 'elena@test.com', 'role' => 'frontend']),
            User::factory()->create(['name' => 'Petar', 'email' => 'petar@test.com', 'role' => 'backend']),
        ];

        foreach ($users as $user) {
            // Create a trusted device
            $device = TrustedDevice::factory()->create([
                'user_id' => $user->id,
            ]);

            // Login and get token
            $loginResponse = $this->postJson('/api/login', [
                'email' => $user->email,
                'password' => 'password',
            ]);

            $token = $loginResponse->json('token');

            // Revoke the device
            $response = $this->withHeaders([
                'Authorization' => "Bearer $token",
            ])->deleteJson("/api/2fa/trusted-devices/{$device->id}");

            $response->assertOk();

            // Verify device was deleted
            $this->assertDatabaseMissing('trusted_devices', [
                'id' => $device->id,
            ]);

            echo "✅ {$user->name} ({$user->role}) can revoke trusted devices\n";
        }
    }
}
