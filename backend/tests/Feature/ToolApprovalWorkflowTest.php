<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Tool;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ToolApprovalWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\UserSeeder::class);
        $this->seed(\Database\Seeders\CategorySeeder::class);
    }

    /** @test */
    public function tool_is_created_with_pending_status()
    {
        $user = User::where('email', 'elena@frontend.local')->first();
        $token = $user->createToken('test')->plainTextToken;
        $category = Category::first();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/tools', [
            'name' => 'Test Tool',
            'link' => 'https://example.com',
            'description' => 'Test description',
            'categories' => [$category->id],
        ]);

        $response->assertStatus(201);
        
        $tool = Tool::where('name', 'Test Tool')->first();
        $this->assertEquals('pending', $tool->status);
        $this->assertFalse($tool->is_approved);
    }

    /** @test */
    public function admin_can_approve_tool()
    {
        $admin = User::where('email', 'alexandra@admin.local')->first();
        $user = User::where('email', 'elena@frontend.local')->first();
        
        $tool = Tool::create([
            'name' => 'Pending Tool',
            'slug' => 'pending-tool',
            'link' => 'https://example.com',
            'description' => 'Test',
            'user_id' => $user->id,
            'status' => 'pending',
            'is_approved' => false,
        ]);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/moderator/tools/{$tool->id}/approve");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Tool approved successfully.']);

        $tool->refresh();
        $this->assertEquals('approved', $tool->status);
        $this->assertTrue($tool->is_approved);
        $this->assertEquals($admin->id, $tool->approved_by);
        $this->assertNotNull($tool->reviewed_at);
    }

    /** @test */
    public function admin_can_reject_tool()
    {
        $admin = User::where('email', 'alexandra@admin.local')->first();
        $user = User::where('email', 'elena@frontend.local')->first();
        
        $tool = Tool::create([
            'name' => 'Pending Tool',
            'slug' => 'pending-tool',
            'link' => 'https://example.com',
            'description' => 'Test',
            'user_id' => $user->id,
            'status' => 'pending',
            'is_approved' => false,
        ]);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/moderator/tools/{$tool->id}/reject");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Tool rejected.']);

        $tool->refresh();
        $this->assertEquals('rejected', $tool->status);
        $this->assertFalse($tool->is_approved);
    }

    /** @test */
    public function admin_can_archive_tool()
    {
        $admin = User::where('email', 'alexandra@admin.local')->first();
        $user = User::where('email', 'elena@frontend.local')->first();
        
        $tool = Tool::create([
            'name' => 'Approved Tool',
            'slug' => 'approved-tool',
            'link' => 'https://example.com',
            'description' => 'Test',
            'user_id' => $user->id,
            'status' => 'approved',
            'is_approved' => true,
        ]);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/moderator/tools/{$tool->id}/archive");

        $response->assertStatus(200);

        $tool->refresh();
        $this->assertEquals('archived', $tool->status);
    }

    /** @test */
    public function admin_can_bulk_approve_tools()
    {
        $admin = User::where('email', 'alexandra@admin.local')->first();
        $user = User::where('email', 'elena@frontend.local')->first();
        
        $tool1 = Tool::create([
            'name' => 'Tool 1',
            'slug' => 'tool-1',
            'link' => 'https://example.com',
            'description' => 'Test',
            'user_id' => $user->id,
            'status' => 'pending',
        ]);

        $tool2 = Tool::create([
            'name' => 'Tool 2',
            'slug' => 'tool-2',
            'link' => 'https://example.com',
            'description' => 'Test',
            'user_id' => $user->id,
            'status' => 'pending',
        ]);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/moderator/tools/bulk-approve', [
            'tool_ids' => [$tool1->id, $tool2->id],
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['2 tools approved successfully.']);

        $tool1->refresh();
        $tool2->refresh();

        $this->assertEquals('approved', $tool1->status);
        $this->assertEquals('approved', $tool2->status);
    }

    /** @test */
    public function regular_users_see_only_approved_tools()
    {
        $user = User::where('email', 'elena@frontend.local')->first();

        // Create tools with different statuses
        Tool::create([
            'name' => 'Approved Tool',
            'slug' => 'approved-tool',
            'link' => 'https://example.com',
            'description' => 'Test',
            'user_id' => $user->id,
            'status' => 'approved',
            'is_approved' => true,
        ]);

        Tool::create([
            'name' => 'Pending Tool',
            'slug' => 'pending-tool',
            'link' => 'https://example.com',
            'description' => 'Test',
            'user_id' => $user->id,
            'status' => 'pending',
            'is_approved' => false,
        ]);

        // Request without status filter (should default to approved)
        $response = $this->getJson('/api/tools');

        $response->assertStatus(200);
        
        $tools = $response->json('data');
        
        // Should only see approved tools
        $this->assertCount(1, $tools);
        $this->assertEquals('Approved Tool', $tools[0]['name']);
    }
}
