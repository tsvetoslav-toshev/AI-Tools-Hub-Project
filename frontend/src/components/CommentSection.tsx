'use client';

import { useState, useEffect } from 'react';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

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

interface CommentSectionProps {
  toolId: number;
  currentUserId?: number;
  isAdmin?: boolean;
}

type SortOption = 'newest' | 'oldest' | 'most-liked';

export default function CommentSection({
  toolId,
  currentUserId,
  isAdmin = false,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    fetchComments();
  }, [toolId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const response = await fetch(`${apiUrl}/api/tools/${toolId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      } else {
        setError('Failed to load comments');
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (content: string) => {
    const token = localStorage.getItem('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const response = await fetch(`${apiUrl}/api/tools/${toolId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to post comment');
    }

    const data = await response.json();
    setComments([data.comment, ...comments]);
  };

  const handleReply = async (parentId: number, content: string) => {
    const token = localStorage.getItem('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const response = await fetch(`${apiUrl}/api/tools/${toolId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, parent_id: parentId }),
    });

    if (!response.ok) {
      throw new Error('Failed to post reply');
    }

    // Refresh comments to show new reply
    await fetchComments();
  };

  const handleEdit = async (commentId: number, content: string) => {
    const token = localStorage.getItem('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const response = await fetch(`${apiUrl}/api/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to update comment');
    }

    // Refresh comments
    await fetchComments();
  };

  const handleDelete = async (commentId: number) => {
    const token = localStorage.getItem('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const response = await fetch(`${apiUrl}/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }

    // Remove comment from state
    setComments(comments.filter((c) => c.id !== commentId));
  };

  const getSortedComments = () => {
    const sorted = [...comments];

    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'oldest':
        return sorted.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case 'most-liked':
        // TODO: Implement when likes are added
        return sorted;
      default:
        return sorted;
    }
  };

  const sortedComments = getSortedComments();

  return (
    <div id="comments" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#F4F4F4] dark:border-[#2A2A2A]">
        <h2 className="text-xl font-light text-[#1A1A1A] dark:text-white">
          Comments ({comments.length})
        </h2>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-[#A3A3A3]">
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border border-[#F4F4F4] dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white text-xs tracking-widest uppercase focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most-liked">Most Liked</option>
          </select>
        </div>
      </div>

      {/* Comment Form */}
      {currentUserId && (
        <div>
          <CommentForm onSubmit={handlePostComment} />
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8 text-[#A3A3A3]">Loading comments...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
      ) : sortedComments.length === 0 ? (
        <div className="text-center py-8 text-[#A3A3A3]">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-0">
          {sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
