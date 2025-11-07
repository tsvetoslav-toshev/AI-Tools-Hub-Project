<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Tool;
use Illuminate\Support\Facades\Cache;

class CacheService
{
    const CACHE_TTL = 3600; // 1 hour
    const CATEGORIES_KEY = 'categories:all:v1';

    /**
     * Get all categories from cache or database.
     */
    public static function getCategories(): mixed
    {
        return Cache::remember(self::CATEGORIES_KEY, self::CACHE_TTL, function () {
            return Category::where('is_active', true)
                ->orderBy('order')
                ->get();
        });
    }

    /**
     * Get tool count for a category.
     */
    public static function getToolCountForCategory(int $categoryId): int
    {
        $key = "tools:count:cat:{$categoryId}:v1";

        return Cache::remember($key, self::CACHE_TTL, function () use ($categoryId) {
            return Tool::whereHas('categories', function ($query) use ($categoryId) {
                $query->where('categories.id', $categoryId);
            })
            ->where('status', 'approved')
            ->count();
        });
    }

    /**
     * Clear categories cache.
     */
    public static function clearCategoriesCache(): void
    {
        Cache::forget(self::CATEGORIES_KEY);
        
        // If using tags (Redis), clear all category-related caches
        if (Cache::supportsTags()) {
            Cache::tags(['categories'])->flush();
        }
    }

    /**
     * Clear tool count cache for a specific category.
     */
    public static function clearToolCountCache(int $categoryId): void
    {
        $key = "tools:count:cat:{$categoryId}:v1";
        Cache::forget($key);
    }

    /**
     * Clear tool count cache for multiple categories.
     */
    public static function clearToolCountCaches(array $categoryIds): void
    {
        foreach ($categoryIds as $categoryId) {
            self::clearToolCountCache($categoryId);
        }
        
        // If using tags (Redis), clear all tool-related caches
        if (Cache::supportsTags()) {
            Cache::tags(['tools'])->flush();
        }
    }

    /**
     * Clear all tool and category caches.
     */
    public static function clearAllToolCaches(): void
    {
        self::clearCategoriesCache();
        
        // Clear all tool count caches
        $categoryIds = Category::pluck('id')->toArray();
        self::clearToolCountCaches($categoryIds);
        
        // If using tags (Redis), clear everything
        if (Cache::supportsTags()) {
            Cache::tags(['tools', 'categories'])->flush();
        }
    }
}
