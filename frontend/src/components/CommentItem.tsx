'use client';

import { useState } from 'react';
import CommentForm from './CommentForm';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Comment {
  id: number;
  content: string;
  user: User;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  currentUserId?: number;
  isAdmin?: boolean;
  onReply: (commentId: number, content: string) => Promise<void>;
  onEdit: (commentId: number, content: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
  depth?: number;
}

export default function CommentItem({
  comment,
  currentUserId,
  isAdmin = false,
  onReply,
  onEdit,
  onDelete,
  depth = 0,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUserId === comment.user.id;
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;
  const maxDepth = 3; // Maximum nesting level

  const handleReply = async (content: string) => {
    await onReply(comment.id, content);
    setIsReplying(false);
  };

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      return;
    }

    await onEdit(comment.id, editContent);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const indentClass = depth > 0 ? 'ml-8 md:ml-12' : '';

  return (
    <div id={`comment-${comment.id}`} className={`${indentClass} ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="py-4 border-b border-[#F4F4F4] dark:border-[#2A2A2A]">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F4F4F4] dark:bg-[#2A2A2A] flex items-center justify-center">
              <span className="text-sm font-medium text-[#1A1A1A] dark:text-white">
                {comment.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#1A1A1A] dark:text-white">
                {comment.user.name}
              </p>
              <p className="text-xs text-[#A3A3A3]">
                {formatTimeAgo(comment.created_at)}
                {comment.created_at !== comment.updated_at && ' (edited)'}
              </p>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="flex items-center gap-2">
            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white transition-colors uppercase tracking-widest"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs text-[#A3A3A3] hover:text-red-600 dark:hover:text-red-400 transition-colors uppercase tracking-widest"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <div className="mt-3 space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-[#F4F4F4] dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white transition-colors resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-[#2A2A2A] dark:hover:bg-[#F4F4F4] transition-all text-xs tracking-widest uppercase font-light"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                className="px-4 py-2 border border-[#F4F4F4] dark:border-[#2A2A2A] text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white transition-all text-xs tracking-widest uppercase font-light"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[#1A1A1A] dark:text-white whitespace-pre-wrap">
              {comment.content}
            </p>
            {depth < maxDepth && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="mt-2 text-xs text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white transition-colors uppercase tracking-widest"
              >
                {isReplying ? 'Cancel' : 'Reply'}
              </button>
            )}
          </div>
        )}

        {/* Reply Form */}
        {isReplying && (
          <div className="mt-4">
            <CommentForm
              onSubmit={handleReply}
              onCancel={() => setIsReplying(false)}
              placeholder="Write a reply..."
              submitLabel="Post Reply"
              isReply
            />
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
