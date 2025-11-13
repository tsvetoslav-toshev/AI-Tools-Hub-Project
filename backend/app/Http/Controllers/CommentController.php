<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Tool;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Get all comments for a tool.
     */
    public function index($toolId)
    {
        $tool = Tool::findOrFail($toolId);

        // Get only top-level comments (no parent_id) with nested replies
        $comments = $tool->comments()
            ->whereNull('parent_id')
            ->with(['user', 'replies.user', 'replies.replies.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'comments' => $comments
        ]);
    }

    /**
     * Store a new comment.
     */
    public function store(Request $request, $toolId)
    {
        $request->validate([
            'content' => 'required|string|max:2000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $tool = Tool::findOrFail($toolId);

        $comment = Comment::create([
            'tool_id' => $toolId,
            'user_id' => $request->user()->id,
            'parent_id' => $request->parent_id,
            'content' => $request->content,
        ]);

        $comment->load('user');

        // Create notification
        if ($request->parent_id) {
            // Reply to a comment - notify the parent comment author
            $parentComment = Comment::find($request->parent_id);
            if ($parentComment->user_id !== $request->user()->id) {
                \App\Services\NotificationService::createReplyNotification(
                    $parentComment,
                    $comment,
                    $request->user()
                );
            }
        } else {
            // New comment on tool - notify tool owner
            if ($tool->user_id !== $request->user()->id) {
                \App\Services\NotificationService::createCommentNotification(
                    $tool,
                    $comment,
                    $request->user()
                );
            }
        }

        return response()->json([
            'message' => 'Comment posted successfully',
            'comment' => $comment,
        ], 201);
    }

    /**
     * Update a comment.
     */
    public function update(Request $request, $commentId)
    {
        $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $comment = Comment::findOrFail($commentId);

        // Only the comment owner can edit it
        if ($comment->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $comment->update([
            'content' => $request->content,
        ]);

        return response()->json([
            'message' => 'Comment updated successfully',
            'comment' => $comment->fresh('user'),
        ]);
    }

    /**
     * Delete a comment.
     */
    public function destroy($commentId)
    {
        $comment = Comment::findOrFail($commentId);

        // Only the comment owner or admin can delete it
        $user = auth()->user();
        $isAdmin = $user->hasRole('admin');
        
        if ($comment->user_id !== $user->id && !$isAdmin) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully',
        ]);
    }
}
