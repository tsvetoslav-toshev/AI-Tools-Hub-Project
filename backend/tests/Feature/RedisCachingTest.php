<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Tool;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class RedisCachingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\UserSeeder::class);
        $this->seed(\Database\Seeders\CategorySeeder::class);
        Cache::flush();
    }

    /** @test */
    public function categories_are_cached()
    {
        // First call - should cache
        $categories1 = \App\Services\CacheService::getCategories();
        
        // Check cache exists
        $this->assertTrue(Cache::has('categories:all:v1'));
        
        // Second call - should return from cache
        $categories2 = \App\Services\CacheService::getCategories();
        
        $this->assertEquals($categories1->count(), $categories2->count());
    }

    /** @test */
    public function tool_count_per_category_is_cached()
    {
        $category = Category::first();
        $user = User::first();

        // Create approved tool
        Tool::create([
            'name' => 'Test Tool',
            'slug' => 'test-tool',
            'link' => 'https://example.com',
            'description' => 'Test',
            'user_id' => $user->id,
            'status' => 'approved',
            'is_approved' => true,
        ])->categories()->attach($category->id);

        $count1 = \App\Services\CacheService::getToolCountForCategory($category->id);
        
        // Check cache exists
        $this->assertTrue(Cache::has("tools:count:cat:{$category->id}:v1"));
        
        $count2 = \App\Services\CacheService::getToolCountForCategory($category->id);
        
        $this->assertEquals($count1, $count2);
        $this->assertEquals(1, $count1);
    }

    /** @test */
    public function cache_is_invalidated_when_tool_is_created()
    {
        $category = Category::first();
        
        // Pre-cache
        \App\Services\CacheService::getCategories();
        
        $this->assertTrue(Cache::has('categories:all:v1'));
        
        // Create tool (should trigger observer to clear cache)
        $user = User::first();
        $tool = Tool::create([
            'name' => 'New Tool',
            'slug' => 'new-tool',
            'link' => 'https://example.com',
            'description' => 'Test',
            'user_id' => $user->id,
            'status' => 'approved',
        ]);
        
        // Cache should be cleared (categories cache is always cleared)
        $this->assertFalse(Cache::has('categories:all:v1'));
        
        // After attaching categories, the observer will clear tool count cache
        $tool->categories()->attach($category->id);
        
        // Re-cache the tool count
        \App\Services\CacheService::getToolCountForCategory($category->id);
        $this->assertTrue(Cache::has("tools:count:cat:{$category->id}:v1"));
    }

    /** @test */
    public function cache_is_invalidated_when_tool_is_approved()
    {
        $admin = User::where('email', 'alexandra@admin.local')->first();
        $user = User::where('email', 'elena@frontend.local')->first();
        $category = Category::first();
        
        $tool = Tool::create([
            'name' => 'Pending Tool',
            'slug' => 'pending-tool',
            'link' => 'https://example.com',
            'description' => 'Test',
            'user_id' => $user->id,
            'status' => 'pending',
        ]);
        $tool->categories()->attach($category->id);

        // Pre-cache
        \App\Services\CacheService::getCategories();
        \App\Services\CacheService::getToolCountForCategory($category->id);
        
        $token = $admin->createToken('test')->plainTextToken;

        // Approve tool (should clear cache)
        $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/moderator/tools/{$tool->id}/approve");

        // Cache should be cleared
        $this->assertFalse(Cache::has('categories:all:v1'));
    }

    /** @test */
    public function cache_service_can_clear_specific_caches()
    {
        $category = Category::first();
        
        // Set caches
        \App\Services\CacheService::getCategories();
        \App\Services\CacheService::getToolCountForCategory($category->id);
        
        $this->assertTrue(Cache::has('categories:all:v1'));
        $this->assertTrue(Cache::has("tools:count:cat:{$category->id}:v1"));
        
        // Clear categories cache
        \App\Services\CacheService::clearCategoriesCache();
        
        $this->assertFalse(Cache::has('categories:all:v1'));
        $this->assertTrue(Cache::has("tools:count:cat:{$category->id}:v1"));
        
        // Clear tool count cache
        \App\Services\CacheService::clearToolCountCache($category->id);
        
        $this->assertFalse(Cache::has("tools:count:cat:{$category->id}:v1"));
    }
}
