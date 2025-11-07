<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLoggingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\UserSeeder::class);
    }

    /** @test */
    public function login_action_is_logged()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'alexandra@admin.local',
            'password' => 'password',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'login_success',
            'entity_type' => 'User',
        ]);

        $auditLog = AuditLog::where('action', 'login_success')->first();
        $this->assertNotNull($auditLog->ip);
        $this->assertNotNull($auditLog->user_agent);
    }

    /** @test */
    public function logout_action_is_logged()
    {
        $user = User::where('email', 'alexandra@admin.local')->first();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/logout');

        $response->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => 'logout',
        ]);
    }

    /** @test */
    public function tool_approval_is_logged()
    {
        $admin = User::where('email', 'alexandra@admin.local')->first();
        $user = User::where('email', 'elena@frontend.local')->first();
        
        $tool = \App\Models\Tool::create([
            'name' => 'Test Tool',
            'slug' => 'test-tool',
            'link' => 'https://example.com',
            'description' => 'Test',
            'user_id' => $user->id,
            'status' => 'pending',
        ]);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/moderator/tools/{$tool->id}/approve");

        $response->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'tool_approved',
            'entity_type' => 'Tool',
            'entity_id' => $tool->id,
        ]);
    }

    /** @test */
    public function role_assignment_is_logged()
    {
        $admin = User::where('email', 'alexandra@admin.local')->first();
        $user = User::where('email', 'elena@frontend.local')->first();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/admin/users/{$user->id}/assign-role", [
            'role' => 'moderator',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'role_assigned',
            'entity_type' => 'User',
            'entity_id' => $user->id,
        ]);

        $auditLog = AuditLog::where('action', 'role_assigned')->first();
        $this->assertEquals('moderator', $auditLog->meta['role']);
    }

    /** @test */
    public function admin_can_view_audit_logs()
    {
        $admin = User::where('email', 'alexandra@admin.local')->first();
        $token = $admin->createToken('test')->plainTextToken;

        // Create some audit logs
        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'test_action',
            'ip' => '127.0.0.1',
            'user_agent' => 'Test Agent',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/admin/audit-logs');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'user_id', 'action', 'ip', 'user_agent', 'created_at']
                ]
            ]);
    }

    /** @test */
    public function admin_can_filter_audit_logs_by_action()
    {
        $admin = User::where('email', 'alexandra@admin.local')->first();
        $token = $admin->createToken('test')->plainTextToken;

        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'login_success',
            'ip' => '127.0.0.1',
            'user_agent' => 'Test',
        ]);

        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'tool_approved',
            'ip' => '127.0.0.1',
            'user_agent' => 'Test',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/admin/audit-logs?action=login_success');

        $response->assertStatus(200);

        $logs = $response->json('data');
        foreach ($logs as $log) {
            $this->assertEquals('login_success', $log['action']);
        }
    }

    /** @test */
    public function admin_can_get_available_actions()
    {
        $admin = User::where('email', 'alexandra@admin.local')->first();
        $token = $admin->createToken('test')->plainTextToken;

        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'login_success',
            'ip' => '127.0.0.1',
            'user_agent' => 'Test',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/admin/audit-logs/actions');

        $response->assertStatus(200)
            ->assertJsonFragment(['login_success']);
    }
}
