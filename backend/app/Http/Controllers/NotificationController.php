<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user.
     */
    public function index()
    {
        $notifications = auth()->user()
            ->notifications()
            ->paginate(20);

        return response()->json($notifications);
    }

    /**
     * Get unread notifications count.
     */
    public function unreadCount()
    {
        $count = auth()->user()
            ->notifications()
            ->unread()
            ->count();

        return response()->json([
            'count' => $count,
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead($notificationId)
    {
        $notification = Notification::findOrFail($notificationId);

        // Check if the notification belongs to the authenticated user
        if ($notification->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => $notification,
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        auth()->user()
            ->notifications()
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => 'All notifications marked as read',
        ]);
    }
}
