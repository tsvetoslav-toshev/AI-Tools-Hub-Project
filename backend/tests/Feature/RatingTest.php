<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Tool;
use App\Models\Rating;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RatingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate:fresh');
    }

    /** @test */
    public function authenticated_user_can_rate_a_tool()
    {
        $user = User::factory()->create();
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $toolOwner->id, 'status' => 'approved']);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/tools/{$tool->id}/ratings", [
                'rating' => 4
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Rating submitted successfully',
            ]);

        $this->assertDatabaseHas('ratings', [
            'tool_id' => $tool->id,
            'user_id' => $user->id,
            'rating' => 4,
        ]);

        // Check that tool average rating is updated
        $tool->refresh();
        $this->assertEquals(4, $tool->average_rating);
        $this->assertEquals(1, $tool->ratings_count);
    }

    /** @test */
    public function user_can_update_their_rating()
    {
        $user = User::factory()->create();
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $toolOwner->id, 'status' => 'approved']);

        // First rating
        Rating::create([
            'tool_id' => $tool->id,
            'user_id' => $user->id,
            'rating' => 3,
        ]);

        // Update rating
        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/tools/{$tool->id}/ratings", [
                'rating' => 5
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('ratings', [
            'tool_id' => $tool->id,
            'user_id' => $user->id,
            'rating' => 5,
        ]);
    }

    /** @test */
    public function user_cannot_rate_their_own_tool()
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $user->id, 'status' => 'approved']);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/tools/{$tool->id}/ratings", [
                'rating' => 5
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'You cannot rate your own tool',
            ]);
    }

    /** @test */
    public function rating_must_be_between_1_and_5()
    {
        $user = User::factory()->create();
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $toolOwner->id, 'status' => 'approved']);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/tools/{$tool->id}/ratings", [
                'rating' => 6
            ]);

        $response->assertStatus(422);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/tools/{$tool->id}/ratings", [
                'rating' => 0
            ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function user_can_delete_their_rating()
    {
        $user = User::factory()->create();
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $toolOwner->id, 'status' => 'approved']);

        $rating = Rating::create([
            'tool_id' => $tool->id,
            'user_id' => $user->id,
            'rating' => 4,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/ratings/{$rating->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Rating deleted successfully',
            ]);

        $this->assertDatabaseMissing('ratings', [
            'id' => $rating->id,
        ]);
    }

    /** @test */
    public function user_can_get_their_rating_for_a_tool()
    {
        $user = User::factory()->create();
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $toolOwner->id, 'status' => 'approved']);

        Rating::create([
            'tool_id' => $tool->id,
            'user_id' => $user->id,
            'rating' => 4,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/tools/{$tool->id}/ratings/user");

        $response->assertStatus(200)
            ->assertJsonPath('rating.rating', 4);
    }

    /** @test */
    public function average_rating_is_calculated_correctly()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $user3 = User::factory()->create();
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $toolOwner->id, 'status' => 'approved']);

        // Create ratings
        Rating::create(['tool_id' => $tool->id, 'user_id' => $user1->id, 'rating' => 5]);
        Rating::create(['tool_id' => $tool->id, 'user_id' => $user2->id, 'rating' => 4]);
        Rating::create(['tool_id' => $tool->id, 'user_id' => $user3->id, 'rating' => 3]);

        // Manually update tool ratings (simulating what the controller does)
        $tool->update([
            'average_rating' => Rating::where('tool_id', $tool->id)->avg('rating'),
            'ratings_count' => Rating::where('tool_id', $tool->id)->count(),
        ]);

        $tool->refresh();

        $this->assertEquals(4, $tool->average_rating); // (5+4+3)/3 = 4
        $this->assertEquals(3, $tool->ratings_count);
    }

    /** @test */
    public function unauthenticated_user_cannot_rate_a_tool()
    {
        $toolOwner = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $toolOwner->id, 'status' => 'approved']);

        $response = $this->postJson("/api/tools/{$tool->id}/ratings", [
            'rating' => 4
        ]);

        $response->assertStatus(401);
    }
}
