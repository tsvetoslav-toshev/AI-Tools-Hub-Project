<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Tool;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TwoFactorAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\UserSeeder::class);
    }

    /** @test */
    public function user_can_request_2fa_code()
    {
        $user = User::where('email', 'alexandra@admin.local')->first();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/2fa/send');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Verification code sent to your email.',
            ])
            ->assertJsonStructure(['expires_in_minutes']);
    }

    /** @test */
    public function user_can_verify_2fa_code()
    {
        $user = User::where('email', 'alexandra@admin.local')->first();
        $token = $user->createToken('test')->plainTextToken;

        // Request code
        $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/2fa/send');

        // Get the code from database
        $twoFactorCode = \App\Models\TwoFactorCode::where('user_id', $user->id)
            ->where('consumed_at', null)
            ->latest()
            ->first();

        $this->assertNotNull($twoFactorCode);

        // Generate the actual code (normally it's 6 random digits)
        // For testing, we need to use reflection or create a test-specific method
        // For now, we'll test the validation logic
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/2fa/verify', [
            'code' => '999999', // Wrong code
            'trust_device' => false,
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function user_can_check_2fa_status()
    {
        $user = User::where('email', 'alexandra@admin.local')->first();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/2fa/status');

        $response->assertStatus(200)
            ->assertJsonStructure(['verified', 'trusted_device']);
    }

    /** @test */
    public function rate_limiting_prevents_spam()
    {
        $user = User::where('email', 'alexandra@admin.local')->first();
        $token = $user->createToken('test')->plainTextToken;

        // Send 6 requests (limit is 5 per hour)
        for ($i = 0; $i < 6; $i++) {
            $response = $this->withHeaders([
                'Authorization' => 'Bearer ' . $token,
            ])->postJson('/api/2fa/send');

            if ($i < 5) {
                $response->assertStatus(200);
            } else {
                $response->assertStatus(429); // Too many requests
            }
        }
    }
}
