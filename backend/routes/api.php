<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ToolController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TwoFactorController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

// Auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
Route::get('/users', [AuthController::class, 'getUsers']);

// Two-Factor Authentication routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/2fa/send', [TwoFactorController::class, 'sendCode']);
    Route::post('/2fa/verify', [TwoFactorController::class, 'verifyCode']);
    Route::get('/2fa/status', [TwoFactorController::class, 'status']);
    
    // Trusted devices management
    Route::get('/2fa/trusted-devices', [TwoFactorController::class, 'listTrustedDevices']);
    Route::delete('/2fa/trusted-devices/{id}', [TwoFactorController::class, 'revokeTrustedDevice']);
    Route::delete('/2fa/trusted-devices', [TwoFactorController::class, 'revokeAllTrustedDevices']);
});

// Status check
Route::get('/status', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'API is running',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Public routes
Route::get('/tools', [ToolController::class, 'index']);
Route::get('/tools/{id}', [ToolController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/tags', [TagController::class, 'index']);
Route::get('/tags/{id}', [TagController::class, 'show']);

// Public comment reading
Route::get('/tools/{id}/comments', [CommentController::class, 'index']);

// Roles route (protected)
Route::middleware('auth:sanctum')->get('/roles', function () {
    return response()->json(\App\Models\Role::all());
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Tool management
    Route::post('/tools', [ToolController::class, 'store']);
    Route::put('/tools/{id}', [ToolController::class, 'update']);
    Route::delete('/tools/{id}', [ToolController::class, 'destroy']);
    
    // Admin only routes
    Route::post('/tools/{id}/approve', [ToolController::class, 'approve']);
    Route::post('/tools/{id}/feature', [ToolController::class, 'feature']);
    
    // Tag creation
    Route::post('/tags', [TagController::class, 'store']);
    
    // Ratings
    Route::post('/tools/{id}/ratings', [RatingController::class, 'store']);
    Route::get('/tools/{id}/ratings/user', [RatingController::class, 'getUserRating']);
    Route::delete('/ratings/{id}', [RatingController::class, 'destroy']);
    
    // Comments (write operations)
    Route::post('/tools/{id}/comments', [CommentController::class, 'store']);
    Route::put('/comments/{id}', [CommentController::class, 'update']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});

// Admin routes (require auth + admin role)
// TODO: Re-enable 2FA middleware after testing: ['auth:sanctum', '2fa', 'role:admin']
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    // User management (ADMIN ONLY)
    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index']);
    Route::get('/users/statistics', [\App\Http\Controllers\Admin\UserController::class, 'statistics']);
    Route::get('/users/{id}', [\App\Http\Controllers\Admin\UserController::class, 'show']);
    Route::post('/users/{id}/assign-role', [\App\Http\Controllers\Admin\UserController::class, 'assignRole']);
    Route::post('/users/{id}/remove-role', [\App\Http\Controllers\Admin\UserController::class, 'removeRole']);
    
    // Audit logs (ADMIN ONLY)
    Route::get('/audit-logs', [\App\Http\Controllers\Admin\AuditLogController::class, 'index']);
    Route::get('/audit-logs/actions', [\App\Http\Controllers\Admin\AuditLogController::class, 'actions']);
    Route::get('/audit-logs/summary', [\App\Http\Controllers\Admin\AuditLogController::class, 'summary']);
    
    // Tool management (ADMIN has access to all moderator features too)
    Route::get('/tools', [\App\Http\Controllers\Admin\ToolController::class, 'index']);
    Route::post('/tools/{id}/approve', [\App\Http\Controllers\Admin\ToolController::class, 'approve']);
    Route::post('/tools/{id}/reject', [\App\Http\Controllers\Admin\ToolController::class, 'reject']);
    Route::post('/tools/{id}/archive', [\App\Http\Controllers\Admin\ToolController::class, 'archive']);
    Route::post('/tools/bulk-approve', [\App\Http\Controllers\Admin\ToolController::class, 'bulkApprove']);
    Route::post('/tools/bulk-reject', [\App\Http\Controllers\Admin\ToolController::class, 'bulkReject']);
    Route::get('/tools/statistics', [\App\Http\Controllers\Admin\ToolController::class, 'statistics']);
});

// Moderator routes (accessible by both admin and moderator)
Route::middleware(['auth:sanctum', 'admin_or_moderator'])->prefix('moderator')->group(function () {
    // Tool management (ADMIN + MODERATOR)
    Route::get('/tools', [\App\Http\Controllers\Admin\ToolController::class, 'index']);
    Route::post('/tools/{id}/approve', [\App\Http\Controllers\Admin\ToolController::class, 'approve']);
    Route::post('/tools/{id}/reject', [\App\Http\Controllers\Admin\ToolController::class, 'reject']);
    Route::post('/tools/{id}/archive', [\App\Http\Controllers\Admin\ToolController::class, 'archive']);
    Route::post('/tools/bulk-approve', [\App\Http\Controllers\Admin\ToolController::class, 'bulkApprove']);
    Route::post('/tools/bulk-reject', [\App\Http\Controllers\Admin\ToolController::class, 'bulkReject']);
    Route::get('/tools/statistics', [\App\Http\Controllers\Admin\ToolController::class, 'statistics']);
});
