<?php

namespace App\Observers;

use App\Models\Category;
use App\Services\CacheService;

class CategoryObserver
{
    /**
     * Handle the Category "created" event.
     */
    public function created(Category $category): void
    {
        CacheService::clearCategoriesCache();
    }

    /**
     * Handle the Category "updated" event.
     */
    public function updated(Category $category): void
    {
        CacheService::clearCategoriesCache();
        
        // Also clear tool count cache for this category
        CacheService::clearToolCountCache($category->id);
    }

    /**
     * Handle the Category "deleted" event.
     */
    public function deleted(Category $category): void
    {
        CacheService::clearCategoriesCache();
        CacheService::clearToolCountCache($category->id);
    }

    /**
     * Handle the Category "restored" event.
     */
    public function restored(Category $category): void
    {
        CacheService::clearCategoriesCache();
    }

    /**
     * Handle the Category "force deleted" event.
     */
    public function forceDeleted(Category $category): void
    {
        CacheService::clearCategoriesCache();
        CacheService::clearToolCountCache($category->id);
    }
}
