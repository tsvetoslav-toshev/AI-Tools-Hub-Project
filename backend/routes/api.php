<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ToolController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;

// Auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
Route::get('/users', [AuthController::class, 'getUsers']);

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
});
