<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminOrModerator
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // If no user is authenticated, return unauthorized
        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        // Check if user has admin OR moderator role
        if (!$user->hasRole('admin') && !$user->hasRole('moderator')) {
            return response()->json([
                'message' => 'Forbidden. You need admin or moderator role to access this resource.',
            ], 403);
        }

        return $next($request);
    }
}
