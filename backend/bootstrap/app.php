<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);
        
        // Register middleware aliases
        $middleware->alias([
            '2fa' => \App\Http\Middleware\EnsureTwoFactorVerified::class,
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
            'admin_or_moderator' => \App\Http\Middleware\EnsureAdminOrModerator::class,
        ]);
        
        // API authentication should return JSON instead of redirecting
        $middleware->redirectGuestsTo(fn () => null);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return JSON responses for API routes
        $exceptions->shouldRenderJsonWhen(function ($request) {
            return $request->is('api/*') || $request->expectsJson();
        });
    })->create();
