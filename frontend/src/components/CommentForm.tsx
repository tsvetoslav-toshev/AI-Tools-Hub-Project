'use client';

import { useState } from 'react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  submitLabel?: string;
  isReply?: boolean;
}

export default function CommentForm({
  onSubmit,
  onCancel,
  placeholder = 'Write a comment...',
  submitLabel = 'Post Comment',
  isReply = false,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (content.length > 2000) {
      setError('Comment is too long (max 2000 characters)');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(content);
      setContent('');
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={isReply ? 3 : 4}
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-[#F4F4F4] dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white placeholder-[#A3A3A3] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white transition-colors resize-none"
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <p className="mt-2 text-xs text-[#A3A3A3]">
          {content.length}/2000 characters
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-6 py-2 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-[#2A2A2A] dark:hover:bg-[#F4F4F4] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs tracking-widest uppercase font-light"
        >
          {isSubmitting ? 'Posting...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-[#F4F4F4] dark:border-[#2A2A2A] text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white hover:border-[#1A1A1A] dark:hover:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs tracking-widest uppercase font-light"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
