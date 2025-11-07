<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleBasedAccessControlTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\UserSeeder::class);
    }

    /** @test */
    public function admin_can_access_admin_routes()
    {
        $admin = User::where('email', 'alexandra@admin.local')->first();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/moderator/tools'); // Admin can access moderator routes too

        $response->assertStatus(200);
    }

    /** @test */
    public function regular_user_cannot_access_admin_routes()
    {
        $user = User::where('email', 'elena@frontend.local')->first();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/moderator/tools');

        $response->assertStatus(403); // Forbidden
    }

    /** @test */
    public function user_can_have_multiple_roles()
    {
        $user = User::where('email', 'elena@frontend.local')->first();
        $adminRole = Role::where('name', 'admin')->first();
        $moderatorRole = Role::where('name', 'moderator')->first();

        $user->assignRole('admin');
        $user->assignRole('moderator');

        $this->assertTrue($user->hasRole('admin'));
        $this->assertTrue($user->hasRole('moderator'));
        $this->assertCount(3, $user->roles); // user + admin + moderator
    }

    /** @test */
    public function user_can_remove_role()
    {
        $user = User::where('email', 'elena@frontend.local')->first();
        
        $user->assignRole('admin');
        $this->assertTrue($user->hasRole('admin'));

        $user->removeRole('admin');
        $this->assertFalse($user->hasRole('admin'));
    }

    /** @test */
    public function roles_are_seeded_correctly()
    {
        $this->assertDatabaseHas('roles', ['name' => 'admin']);
        $this->assertDatabaseHas('roles', ['name' => 'moderator']);
        $this->assertDatabaseHas('roles', ['name' => 'user']);
    }

    /** @test */
    public function alexandra_has_admin_role()
    {
        $alexandra = User::where('email', 'alexandra@admin.local')->first();
        
        $this->assertTrue($alexandra->hasRole('admin'));
    }

    /** @test */
    public function ivan_has_moderator_role()
    {
        $ivan = User::where('email', 'ivan@moderator.local')->first();
        
        $this->assertTrue($ivan->hasRole('moderator'));
    }
}
