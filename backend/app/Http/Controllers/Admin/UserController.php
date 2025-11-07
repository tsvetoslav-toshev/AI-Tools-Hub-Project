<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Get all users with their roles.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with('roles');

        // Filter by role
        if ($request->has('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->input('role'));
            });
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Paginate
        $perPage = $request->input('per_page', 20);
        $users = $query->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Get a single user with roles.
     */
    public function show(int $id): JsonResponse
    {
        $user = User::with('roles')->findOrFail($id);

        return response()->json($user);
    }

    /**
     * Assign a role to a user.
     */
    public function assignRole(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'role' => 'required|string|exists:roles,name',
        ]);

        $user = User::findOrFail($id);
        $roleName = $request->input('role');

        $user->assignRole($roleName);

        // Log the action
        AuditService::logRoleAssigned($request->user(), $user->id, $roleName, $request);

        return response()->json([
            'message' => "Role '{$roleName}' assigned to user successfully.",
            'user' => $user->load('roles'),
        ]);
    }

    /**
     * Remove a role from a user.
     */
    public function removeRole(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'role' => 'required|string|exists:roles,name',
        ]);

        $user = User::findOrFail($id);
        $roleName = $request->input('role');

        $user->removeRole($roleName);

        // Log the action
        AuditService::logRoleRemoved($request->user(), $user->id, $roleName, $request);

        return response()->json([
            'message' => "Role '{$roleName}' removed from user successfully.",
            'user' => $user->load('roles'),
        ]);
    }

    /**
     * Get user statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => User::count(),
            'admins' => User::whereHas('roles', function ($q) {
                $q->where('name', 'admin');
            })->count(),
            'moderators' => User::whereHas('roles', function ($q) {
                $q->where('name', 'moderator');
            })->count(),
            'users' => User::whereHas('roles', function ($q) {
                $q->where('name', 'user');
            })->count(),
        ];

        return response()->json($stats);
    }
}
