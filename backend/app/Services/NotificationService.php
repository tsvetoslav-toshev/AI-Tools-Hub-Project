<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Tool;
use App\Models\Comment;
use App\Models\Rating;
use App\Models\User;

class NotificationService
{
    /**
     * Create notification for admins when a new tool is submitted.
     */
    public static function createToolSubmittedNotification(Tool $tool, User $submitter)
    {
        // Get all admin and owner users
        $admins = User::whereIn('role', ['admin', 'owner'])->get();
        
        $notifications = [];
        foreach ($admins as $admin) {
            // Don't notify the submitter if they're an admin
            if ($admin->id === $submitter->id) {
                continue;
            }
            
            $notifications[] = Notification::create([
                'user_id' => $admin->id,
                'type' => 'new_tool_submission',
                'message' => "{$submitter->name} submitted a new tool: '{$tool->name}'",
                'action_url' => "/admin/tools",
                'data' => [
                    'tool_id' => $tool->id,
                    'tool_name' => $tool->name,
                    'tool_slug' => $tool->slug,
                    'submitter_id' => $submitter->id,
                    'submitter_name' => $submitter->name,
                ],
            ]);
        }
        
        return $notifications;
    }

    /**
     * Create notification when tool is approved.
     */
    public static function createToolApprovedNotification(Tool $tool, User $approver)
    {
        return Notification::create([
            'user_id' => $tool->user_id,
            'type' => 'tool_approved',
            'message' => "Your tool '{$tool->name}' has been approved!",
            'action_url' => "/tools/{$tool->slug}",
            'data' => [
                'tool_id' => $tool->id,
                'tool_name' => $tool->name,
                'tool_slug' => $tool->slug,
                'approver_id' => $approver->id,
                'approver_name' => $approver->name,
            ],
        ]);
    }

    /**
     * Create notification when tool is rejected.
     */
    public static function createToolRejectedNotification(Tool $tool, User $rejector)
    {
        return Notification::create([
            'user_id' => $tool->user_id,
            'type' => 'tool_rejected',
            'message' => "Your tool '{$tool->name}' has been rejected.",
            'action_url' => "/tools/{$tool->slug}",
            'data' => [
                'tool_id' => $tool->id,
                'tool_name' => $tool->name,
                'tool_slug' => $tool->slug,
                'rejector_id' => $rejector->id,
                'rejector_name' => $rejector->name,
            ],
        ]);
    }

    /**
     * Create notification when someone comments on user's tool.
     */
    public static function createCommentNotification(Tool $tool, Comment $comment, User $commenter)
    {
        return Notification::create([
            'user_id' => $tool->user_id,
            'type' => 'new_comment',
            'message' => "{$commenter->name} commented on your tool '{$tool->name}'",
            'action_url' => "/tools/{$tool->slug}#comments",
            'data' => [
                'tool_id' => $tool->id,
                'tool_name' => $tool->name,
                'tool_slug' => $tool->slug,
                'comment_id' => $comment->id,
                'commenter_id' => $commenter->id,
                'commenter_name' => $commenter->name,
            ],
        ]);
    }

    /**
     * Create notification when someone replies to user's comment.
     */
    public static function createReplyNotification(Comment $parentComment, Comment $reply, User $replier)
    {
        $tool = $parentComment->tool;
        
        return Notification::create([
            'user_id' => $parentComment->user_id,
            'type' => 'new_reply',
            'message' => "{$replier->name} replied to your comment on '{$tool->name}'",
            'action_url' => "/tools/{$tool->slug}#comment-{$parentComment->id}",
            'data' => [
                'tool_id' => $tool->id,
                'tool_name' => $tool->name,
                'tool_slug' => $tool->slug,
                'parent_comment_id' => $parentComment->id,
                'reply_id' => $reply->id,
                'replier_id' => $replier->id,
                'replier_name' => $replier->name,
            ],
        ]);
    }

    /**
     * Create notification when someone rates user's tool.
     */
    public static function createRatingNotification(Tool $tool, User $rater, int $ratingValue)
    {
        return Notification::create([
            'user_id' => $tool->user_id,
            'type' => 'new_rating',
            'message' => "{$rater->name} rated your tool '{$tool->name}' {$ratingValue} stars",
            'action_url' => "/tools/{$tool->slug}",
            'data' => [
                'tool_id' => $tool->id,
                'tool_name' => $tool->name,
                'tool_slug' => $tool->slug,
                'rating_value' => $ratingValue,
                'rater_id' => $rater->id,
                'rater_name' => $rater->name,
            ],
        ]);
    }
}
