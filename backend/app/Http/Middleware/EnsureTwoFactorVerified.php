<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\TwoFactorService;

class EnsureTwoFactorVerified
{
    protected TwoFactorService $twoFactorService;

    public function __construct(TwoFactorService $twoFactorService)
    {
        $this->twoFactorService = $twoFactorService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // If no user is authenticated, let auth middleware handle it
        if (!$user) {
            return $next($request);
        }

        // Check if user has a trusted device token
        $trustedToken = $request->cookie('trusted_device_token');
        
        if ($trustedToken && $this->twoFactorService->isTrustedDevice($user, $trustedToken)) {
            // Device is trusted, allow access
            return $next($request);
        }

        // Check if 2FA is verified in session
        if ($request->session()->get('2fa_verified') === true) {
            return $next($request);
        }

        // 2FA not verified, return error
        return response()->json([
            'message' => 'Two-factor authentication required.',
            'requires_2fa' => true,
        ], 403);
    }
}
