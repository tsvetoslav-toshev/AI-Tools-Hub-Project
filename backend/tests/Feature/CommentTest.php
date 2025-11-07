<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Tool;
use App\Models\Comment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate:fresh');
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\RoleSeeder']);
    }

    /** @test */
    public function authenticated_user_can_comment_on_a_tool()
    {
        $user = User::factory()->create();
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $toolOwner->id, 'status' => 'approved']);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/tools/{$tool->id}/comments", [
                'content' => 'This is a great tool!'
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Comment posted successfully',
            ]);

        $this->assertDatabaseHas('comments', [
            'tool_id' => $tool->id,
            'user_id' => $user->id,
            'content' => 'This is a great tool!',
            'parent_id' => null,
        ]);
    }

    /** @test */
    public function user_can_reply_to_a_comment()
    {
        $user = User::factory()->create();
        $commenter = User::factory()->create();
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $toolOwner->id, 'status' => 'approved']);

        $parentComment = Comment::create([
            'tool_id' => $tool->id,
            'user_id' => $commenter->id,
            'content' => 'Great tool!',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/tools/{$tool->id}/comments", [
                'content' => 'I agree!',
                'parent_id' => $parentComment->id,
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('comments', [
            'tool_id' => $tool->id,
            'user_id' => $user->id,
            'content' => 'I agree!',
            'parent_id' => $parentComment->id,
        ]);
    }

    /** @test */
    public function user_can_get_all_comments_for_a_tool()
    {
        $user = User::factory()->create();
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $toolOwner->id, 'status' => 'approved']);

        Comment::create([
            'tool_id' => $tool->id,
            'user_id' => $user->id,
            'content' => 'Comment 1',
        ]);

        Comment::create([
            'tool_id' => $tool->id,
            'user_id' => $user->id,
            'content' => 'Comment 2',
        ]);

        $response = $this->getJson("/api/tools/{$tool->id}/comments");

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    /** @test */
    public function user_can_update_their_own_comment()
    {
        $user = User::factory()->create();
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $toolOwner->id, 'status' => 'approved']);

        $comment = Comment::create([
            'tool_id' => $tool->id,
            'user_id' => $user->id,
            'content' => 'Original comment',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/comments/{$comment->id}", [
                'content' => 'Updated comment',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Comment updated successfully',
            ]);

        $this->assertDatabaseHas('comments', [
            'id' => $comment->id,
            'content' => 'Updated comment',
        ]);
    }

    /** @test */
    public function user_cannot_update_someone_elses_comment()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $toolOwner->id, 'status' => 'approved']);

        $comment = Comment::create([
            'tool_id' => $tool->id,
            'user_id' => $otherUser->id,
            'content' => 'Original comment',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/comments/{$comment->id}", [
                'content' => 'Trying to update',
            ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function user_can_delete_their_own_comment()
    {
        $user = User::factory()->create();
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $toolOwner->id, 'status' => 'approved']);

        $comment = Comment::create([
            'tool_id' => $tool->id,
            'user_id' => $user->id,
            'content' => 'Comment to delete',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/comments/{$comment->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Comment deleted successfully',
            ]);

        $this->assertDatabaseMissing('comments', [
            'id' => $comment->id,
        ]);
    }

    /** @test */
    public function admin_can_delete_any_comment()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        
        $user = User::factory()->create();
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $toolOwner->id, 'status' => 'approved']);

        $comment = Comment::create([
            'tool_id' => $tool->id,
            'user_id' => $user->id,
            'content' => 'Comment to delete',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/comments/{$comment->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('comments', [
            'id' => $comment->id,
        ]);
    }

    /** @test */
    public function comment_content_is_required()
    {
        $user = User::factory()->create();
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $toolOwner->id, 'status' => 'approved']);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/tools/{$tool->id}/comments", [
                'content' => '',
            ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function comment_content_cannot_exceed_2000_characters()
    {
        $user = User::factory()->create();
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $toolOwner->id, 'status' => 'approved']);

        $longContent = str_repeat('a', 2001);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/tools/{$tool->id}/comments", [
                'content' => $longContent,
            ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function nested_comments_are_loaded_correctly()
    {
        $user = User::factory()->create();
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $toolOwner->id, 'status' => 'approved']);

        $parentComment = Comment::create([
            'tool_id' => $tool->id,
            'user_id' => $user->id,
            'content' => 'Parent comment',
        ]);

        $childComment = Comment::create([
            'tool_id' => $tool->id,
            'user_id' => $user->id,
            'content' => 'Child comment',
            'parent_id' => $parentComment->id,
        ]);

        $response = $this->getJson("/api/tools/{$tool->id}/comments");

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'content',
                    'user',
                    'replies' => [
                        '*' => [
                            'id',
                            'content',
                            'user',
                        ]
                    ]
                ]
            ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_post_comment()
    {
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $toolOwner->id, 'status' => 'approved']);

        $response = $this->postJson("/api/tools/{$tool->id}/comments", [
            'content' => 'This should fail',
        ]);

        $response->assertStatus(401);
    }
}
