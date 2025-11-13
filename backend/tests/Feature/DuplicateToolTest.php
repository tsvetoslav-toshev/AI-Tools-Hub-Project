<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Category;
use App\Models\Tool;

class DuplicateToolTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed roles and categories
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\RoleSeeder']);
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\CategorySeeder']);
    }

    /**
     * Test that same user cannot submit same tool twice (same URL)
     * 
     * @test
     */
    public function same_user_cannot_submit_duplicate_tool_with_same_url()
    {
        $user = User::factory()->create(['role' => 'user']);
        $category = Category::first();

        // First submission - should succeed
        $toolData = [
            'name' => 'ChatGPT',
            'link' => 'https://chat.openai.com',
            'description' => 'AI-powered conversational assistant that can help with various tasks',
            'categories' => [$category->id],
        ];

        $firstResponse = $this->actingAs($user, 'sanctum')
            ->postJson('/api/tools', $toolData);

        $firstResponse->assertStatus(201);
        $this->assertDatabaseHas('tools', [
            'link' => 'https://chat.openai.com',
            'user_id' => $user->id,
        ]);

        // Second submission with same URL - should fail
        $secondResponse = $this->actingAs($user, 'sanctum')
            ->postJson('/api/tools', $toolData);

        $secondResponse->assertStatus(422);
        $secondResponse->assertJsonValidationErrors(['link']);
        $secondResponse->assertJson([
            'message' => 'A tool with this website URL already exists in our database.',
        ]);

        // Verify only one tool exists
        $this->assertEquals(1, Tool::where('link', 'https://chat.openai.com')->count());
    }

    /**
     * Test that different users cannot submit tool with same URL
     * 
     * @test
     */
    public function different_users_cannot_submit_tool_with_same_url()
    {
        $user1 = User::factory()->create(['role' => 'user', 'name' => 'Petar']);
        $user2 = User::factory()->create(['role' => 'user', 'name' => 'Elena']);
        $category = Category::first();

        // Petar submits ChatGPT
        $toolData = [
            'name' => 'ChatGPT',
            'link' => 'https://chat.openai.com',
            'description' => 'AI-powered conversational assistant',
            'categories' => [$category->id],
        ];

        $firstResponse = $this->actingAs($user1, 'sanctum')
            ->postJson('/api/tools', $toolData);

        $firstResponse->assertStatus(201);

        // Elena tries to submit same URL
        $secondResponse = $this->actingAs($user2, 'sanctum')
            ->postJson('/api/tools', $toolData);

        $secondResponse->assertStatus(422);
        $secondResponse->assertJsonValidationErrors(['link']);

        // Verify only Petar's tool exists
        $this->assertEquals(1, Tool::where('link', 'https://chat.openai.com')->count());
        $this->assertEquals($user1->id, Tool::where('link', 'https://chat.openai.com')->first()->user_id);
    }

    /**
     * Test that same URL with different name still fails
     * 
     * @test
     */
    public function same_url_with_different_name_fails()
    {
        $user = User::factory()->create(['role' => 'user']);
        $category = Category::first();

        // Submit with name "ChatGPT"
        $toolData1 = [
            'name' => 'ChatGPT',
            'link' => 'https://chat.openai.com',
            'description' => 'AI assistant',
            'categories' => [$category->id],
        ];

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/tools', $toolData1)
            ->assertStatus(201);

        // Try to submit same URL with different name
        $toolData2 = [
            'name' => 'OpenAI ChatGPT', // Different name
            'link' => 'https://chat.openai.com', // Same URL
            'description' => 'Different description',
            'categories' => [$category->id],
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/tools', $toolData2);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['link']);
    }

    /**
     * Test that different URLs are allowed even with same name
     * 
     * @test
     */
    public function different_urls_with_same_name_allowed()
    {
        $user = User::factory()->create(['role' => 'user']);
        $category = Category::first();

        // Submit ChatGPT Free
        $toolData1 = [
            'name' => 'ChatGPT',
            'link' => 'https://chat.openai.com/free',
            'description' => 'Free version',
            'categories' => [$category->id],
        ];

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/tools', $toolData1)
            ->assertStatus(201);

        // Submit ChatGPT Plus (different URL, same name)
        $toolData2 = [
            'name' => 'ChatGPT',
            'link' => 'https://chat.openai.com/plus',
            'description' => 'Plus version',
            'categories' => [$category->id],
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/tools', $toolData2);

        $response->assertStatus(201);

        // Verify both tools exist
        $this->assertEquals(2, Tool::where('name', 'ChatGPT')->count());
    }
}
