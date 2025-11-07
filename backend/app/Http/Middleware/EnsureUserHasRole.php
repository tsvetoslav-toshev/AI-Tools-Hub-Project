<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $role  The required role name
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        // If no user is authenticated, return unauthorized
        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        // Check if user has the required role
        if (!$user->hasRole($role)) {
            return response()->json([
                'message' => 'Forbidden. You do not have the required role.',
                'required_role' => $role,
            ], 403);
        }

        return $next($request);
    }
}
