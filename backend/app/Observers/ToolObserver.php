<?php

namespace App\Observers;

use App\Models\Tool;
use App\Services\CacheService;

class ToolObserver
{
    /**
     * Handle the Tool "created" event.
     */
    public function created(Tool $tool): void
    {
        $this->clearCaches($tool);
    }

    /**
     * Handle the Tool "updated" event.
     */
    public function updated(Tool $tool): void
    {
        // Clear caches when status changes or categories change
        if ($tool->wasChanged(['status', 'is_approved'])) {
            $this->clearCaches($tool);
        }
    }

    /**
     * Handle the Tool "deleted" event.
     */
    public function deleted(Tool $tool): void
    {
        $this->clearCaches($tool);
    }

    /**
     * Handle the Tool "restored" event.
     */
    public function restored(Tool $tool): void
    {
        $this->clearCaches($tool);
    }

    /**
     * Handle the Tool "force deleted" event.
     */
    public function forceDeleted(Tool $tool): void
    {
        $this->clearCaches($tool);
    }

    /**
     * Clear relevant caches for the tool.
     */
    protected function clearCaches(Tool $tool): void
    {
        // Get category IDs
        $categoryIds = $tool->categories()->pluck('categories.id')->toArray();
        
        // Clear tool count caches for categories
        if (!empty($categoryIds)) {
            CacheService::clearToolCountCaches($categoryIds);
        }
        
        // Clear categories cache
        CacheService::clearCategoriesCache();
    }
}
