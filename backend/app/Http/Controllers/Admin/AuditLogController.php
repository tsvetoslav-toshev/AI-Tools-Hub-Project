<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuditLogController extends Controller
{
    /**
     * Get audit logs with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('user');

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        // Filter by action
        if ($request->has('action')) {
            $query->where('action', $request->input('action'));
        }

        // Filter by entity type
        if ($request->has('entity_type')) {
            $query->where('entity_type', $request->input('entity_type'));
        }

        // Filter by entity ID
        if ($request->has('entity_id')) {
            $query->where('entity_id', $request->input('entity_id'));
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->where('created_at', '>=', $request->input('from_date'));
        }

        if ($request->has('to_date')) {
            $query->where('created_at', '<=', $request->input('to_date'));
        }

        // Sort by newest first
        $query->orderBy('created_at', 'desc');

        // Paginate
        $perPage = $request->input('per_page', 50);
        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }

    /**
     * Get available actions for filtering.
     */
    public function actions(): JsonResponse
    {
        $actions = AuditLog::distinct()->pluck('action')->sort()->values();

        return response()->json($actions);
    }

    /**
     * Get recent activity summary.
     */
    public function summary(Request $request): JsonResponse
    {
        $days = $request->input('days', 7);

        $summary = [
            'total_actions' => AuditLog::recent($days)->count(),
            'login_success' => AuditLog::recent($days)->byAction('login_success')->count(),
            'otp_sent' => AuditLog::recent($days)->byAction('otp_sent')->count(),
            'otp_verified' => AuditLog::recent($days)->byAction('otp_verified')->count(),
            'otp_failed' => AuditLog::recent($days)->byAction('otp_failed')->count(),
            'tool_submitted' => AuditLog::recent($days)->byAction('tool_submitted')->count(),
            'tool_approved' => AuditLog::recent($days)->byAction('tool_approved')->count(),
            'tool_rejected' => AuditLog::recent($days)->byAction('tool_rejected')->count(),
            'role_assigned' => AuditLog::recent($days)->byAction('role_assigned')->count(),
            'role_removed' => AuditLog::recent($days)->byAction('role_removed')->count(),
        ];

        return response()->json($summary);
    }
}
