<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Tool;
use App\Models\Comment;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate:fresh');
    }

    /** @test */
    public function user_can_get_their_notifications()
    {
        $user = User::factory()->create();

        Notification::create([
            'user_id' => $user->id,
            'type' => 'tool_approved',
            'message' => 'Your tool has been approved!',
            'data' => json_encode(['tool_id' => 1]),
            'action_url' => '/tools/1',
        ]);

        Notification::create([
            'user_id' => $user->id,
            'type' => 'new_comment',
            'message' => 'Someone commented on your tool',
            'data' => json_encode(['tool_id' => 1]),
            'action_url' => '/tools/1',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/notifications');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /** @test */
    public function user_can_get_unread_notifications_count()
    {
        $user = User::factory()->create();

        // Create 3 unread notifications
        Notification::create([
            'user_id' => $user->id,
            'type' => 'tool_approved',
            'message' => 'Notification 1',
            'data' => json_encode([]),
            'action_url' => '/tools/1',
        ]);

        Notification::create([
            'user_id' => $user->id,
            'type' => 'new_comment',
            'message' => 'Notification 2',
            'data' => json_encode([]),
            'action_url' => '/tools/1',
        ]);

        // Create 1 read notification
        Notification::create([
            'user_id' => $user->id,
            'type' => 'new_rating',
            'message' => 'Notification 3',
            'data' => json_encode([]),
            'action_url' => '/tools/1',
            'read_at' => now(),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/notifications/unread-count');

        $response->assertStatus(200)
            ->assertJson([
                'count' => 2,
            ]);
    }

    /** @test */
    public function user_can_mark_notification_as_read()
    {
        $user = User::factory()->create();

        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => 'tool_approved',
            'message' => 'Your tool has been approved!',
            'data' => json_encode(['tool_id' => 1]),
            'action_url' => '/tools/1',
        ]);

        $this->assertNull($notification->read_at);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/notifications/{$notification->id}/read");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Notification marked as read',
            ]);

        $notification->refresh();
        $this->assertNotNull($notification->read_at);
    }

    /** @test */
    public function user_can_mark_all_notifications_as_read()
    {
        $user = User::factory()->create();

        Notification::create([
            'user_id' => $user->id,
            'type' => 'tool_approved',
            'message' => 'Notification 1',
            'data' => json_encode([]),
            'action_url' => '/tools/1',
        ]);

        Notification::create([
            'user_id' => $user->id,
            'type' => 'new_comment',
            'message' => 'Notification 2',
            'data' => json_encode([]),
            'action_url' => '/tools/1',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/notifications/read-all');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'All notifications marked as read',
            ]);

        $unreadCount = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        $this->assertEquals(0, $unreadCount);
    }

    /** @test */
    public function notification_service_creates_tool_approved_notification()
    {
        $user = User::factory()->create();
        $approver = User::factory()->create(['name' => 'Admin User']);
        $tool = Tool::factory()->create([
            'user_id' => $user->id,
            'name' => 'Test Tool',
            'status' => 'approved'
        ]);

        NotificationService::createToolApprovedNotification($tool, $approver);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $user->id,
            'type' => 'tool_approved',
            'action_url' => "/tools/{$tool->slug}",
        ]);

        $notification = Notification::where('user_id', $user->id)->first();
        $this->assertStringContainsString('Test Tool', $notification->message);
        $this->assertStringContainsString('approved', $notification->message);
    }

    /** @test */
    public function notification_service_creates_tool_rejected_notification()
    {
        $user = User::factory()->create();
        $rejector = User::factory()->create(['name' => 'Admin User']);
        $tool = Tool::factory()->create([
            'user_id' => $user->id,
            'name' => 'Test Tool',
            'status' => 'rejected'
        ]);

        NotificationService::createToolRejectedNotification($tool, $rejector);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $user->id,
            'type' => 'tool_rejected',
            'action_url' => "/tools/{$tool->slug}",
        ]);
    }

    /** @test */
    public function notification_service_creates_comment_notification()
    {
        $toolOwner = User::factory()->create();
        $commenter = User::factory()->create(['name' => 'John Doe']);
        $tool = Tool::factory()->create([
            'user_id' => $toolOwner->id,
            'name' => 'Test Tool',
            'status' => 'approved'
        ]);

        $comment = Comment::create([
            'tool_id' => $tool->id,
            'user_id' => $commenter->id,
            'content' => 'Great tool!'
        ]);

        NotificationService::createCommentNotification($tool, $comment, $commenter);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $toolOwner->id,
            'type' => 'new_comment',
            'action_url' => "/tools/{$tool->slug}#comments",
        ]);

        $notification = Notification::where('user_id', $toolOwner->id)->first();
        $this->assertStringContainsString('John Doe', $notification->message);
        $this->assertStringContainsString('commented', $notification->message);
    }

    /** @test */
    public function notification_service_creates_reply_notification()
    {
        $originalCommenter = User::factory()->create();
        $replier = User::factory()->create(['name' => 'Jane Doe']);
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create([
            'user_id' => $toolOwner->id,
            'name' => 'Test Tool',
            'status' => 'approved'
        ]);

        $parentComment = Comment::create([
            'tool_id' => $tool->id,
            'user_id' => $originalCommenter->id,
            'content' => 'Original comment'
        ]);

        $reply = Comment::create([
            'tool_id' => $tool->id,
            'user_id' => $replier->id,
            'parent_id' => $parentComment->id,
            'content' => 'Reply comment'
        ]);

        NotificationService::createReplyNotification($parentComment, $reply, $replier);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $originalCommenter->id,
            'type' => 'new_reply',
            'action_url' => "/tools/{$tool->slug}#comments",
        ]);

        $notification = Notification::where('user_id', $originalCommenter->id)->first();
        $this->assertStringContainsString('Jane Doe', $notification->message);
        $this->assertStringContainsString('replied', $notification->message);
    }

    /** @test */
    public function notification_service_creates_rating_notification()
    {
        $toolOwner = User::factory()->create();
        $rater = User::factory()->create(['name' => 'Bob Smith']);
        $tool = Tool::factory()->create([
            'user_id' => $toolOwner->id,
            'name' => 'Test Tool',
            'status' => 'approved'
        ]);

        NotificationService::createRatingNotification($tool, $rater, 5);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $toolOwner->id,
            'type' => 'new_rating',
            'action_url' => "/tools/{$tool->slug}",
        ]);

        $notification = Notification::where('user_id', $toolOwner->id)->first();
        $this->assertStringContainsString('Bob Smith', $notification->message);
        $this->assertStringContainsString('5', $notification->message);
        $this->assertStringContainsString('rated', $notification->message);
    }

    /** @test */
    public function user_cannot_mark_someone_elses_notification_as_read()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $notification = Notification::create([
            'user_id' => $user1->id,
            'type' => 'tool_approved',
            'message' => 'Your tool has been approved!',
            'data' => json_encode(['tool_id' => 1]),
            'action_url' => '/tools/1',
        ]);

        $response = $this->actingAs($user2, 'sanctum')
            ->postJson("/api/notifications/{$notification->id}/read");

        $response->assertStatus(403);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_notifications()
    {
        $response = $this->getJson('/api/notifications');
        $response->assertStatus(401);

        $response = $this->getJson('/api/notifications/unread-count');
        $response->assertStatus(401);
    }
}
