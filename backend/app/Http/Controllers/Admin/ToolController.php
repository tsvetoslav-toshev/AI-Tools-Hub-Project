<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use App\Models\Category;
use App\Services\AuditService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ToolController extends Controller
{
    /**
     * Get all tools with filters for admin.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tool::with(['user', 'categories', 'tags', 'approver']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('categories.id', $request->input('category_id'));
            });
        }

        // Filter by submitter role
        if ($request->has('submitter_role')) {
            $query->whereHas('user.roles', function ($q) use ($request) {
                $q->where('roles.name', $request->input('submitter_role'));
            });
        }

        // Search by name or description
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        // Paginate
        $perPage = $request->input('per_page', 20);
        $tools = $query->paginate($perPage);

        return response()->json($tools);
    }

    /**
     * Approve a tool.
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $tool = Tool::findOrFail($id);

        $tool->update([
            'status' => 'approved',
            'is_approved' => true,
            'approved_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        // Clear relevant caches
        $this->clearToolCaches($tool);

        // Log the action
        AuditService::logToolApproved($request->user(), $tool->id, $tool->name, $request);

        // Create notification for tool owner
        NotificationService::createToolApprovedNotification($tool, $request->user());

        return response()->json([
            'message' => 'Tool approved successfully.',
            'tool' => $tool->load(['user', 'categories', 'tags', 'approver']),
        ]);
    }

    /**
     * Reject a tool.
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $tool = Tool::findOrFail($id);

        $tool->update([
            'status' => 'rejected',
            'is_approved' => false,
            'approved_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        // Clear relevant caches
        $this->clearToolCaches($tool);

        // Log the action
        AuditService::logToolRejected($request->user(), $tool->id, $tool->name, $request);

        // Create notification for tool owner
        NotificationService::createToolRejectedNotification($tool, $request->user());

        return response()->json([
            'message' => 'Tool rejected.',
            'tool' => $tool->load(['user', 'categories', 'tags', 'approver']),
        ]);
    }

    /**
     * Archive a tool.
     */
    public function archive(Request $request, int $id): JsonResponse
    {
        $tool = Tool::findOrFail($id);

        $tool->update([
            'status' => 'archived',
            'approved_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        // Clear relevant caches
        $this->clearToolCaches($tool);

        // Log the action
        AuditService::logToolArchived($request->user(), $tool->id, $tool->name, $request);

        return response()->json([
            'message' => 'Tool archived.',
            'tool' => $tool->load(['user', 'categories', 'tags', 'approver']),
        ]);
    }

    /**
     * Bulk approve tools.
     */
    public function bulkApprove(Request $request): JsonResponse
    {
        $request->validate([
            'tool_ids' => 'required|array',
            'tool_ids.*' => 'exists:tools,id',
        ]);

        $toolIds = $request->input('tool_ids');
        
        Tool::whereIn('id', $toolIds)->update([
            'status' => 'approved',
            'is_approved' => true,
            'approved_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        // Clear all tool-related caches
        Cache::tags(['tools', 'categories'])->flush();

        return response()->json([
            'message' => count($toolIds) . ' tools approved successfully.',
        ]);
    }

    /**
     * Bulk reject tools.
     */
    public function bulkReject(Request $request): JsonResponse
    {
        $request->validate([
            'tool_ids' => 'required|array',
            'tool_ids.*' => 'exists:tools,id',
        ]);

        $toolIds = $request->input('tool_ids');
        
        Tool::whereIn('id', $toolIds)->update([
            'status' => 'rejected',
            'is_approved' => false,
            'approved_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        // Clear all tool-related caches
        Cache::tags(['tools', 'categories'])->flush();

        return response()->json([
            'message' => count($toolIds) . ' tools rejected.',
        ]);
    }

    /**
     * Get statistics for admin dashboard.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => Tool::count(),
            'pending' => Tool::where('status', 'pending')->count(),
            'approved' => Tool::where('status', 'approved')->count(),
            'rejected' => Tool::where('status', 'rejected')->count(),
            'archived' => Tool::where('status', 'archived')->count(),
            'featured' => Tool::where('is_featured', true)->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Clear caches related to a tool.
     */
    protected function clearToolCaches(Tool $tool): void
    {
        // Clear categories cache
        Cache::forget('categories:all:v1');

        // Clear tool counter caches for each category
        $categoryIds = $tool->categories()->pluck('categories.id');
        foreach ($categoryIds as $categoryId) {
            Cache::forget("tools:count:cat:{$categoryId}:v1");
        }

        // Clear general tool caches if using tags
        if (Cache::supportsTags()) {
            Cache::tags(['tools', 'categories'])->flush();
        }
    }
}
