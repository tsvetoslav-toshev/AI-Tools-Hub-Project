<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Tool;
use App\Models\Category;
use App\Observers\ToolObserver;
use App\Observers\CategoryObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register observers for cache invalidation
        Tool::observe(ToolObserver::class);
        Category::observe(CategoryObserver::class);
    }
}
