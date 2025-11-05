'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Tool {
  id: number;
  name: string;
  slug: string;
  link: string;
  documentation_link: string | null;
  description: string;
  how_to_use: string | null;
  real_examples: string | null;
  views_count: number;
  is_featured: boolean;
  created_at: string;
  categories: Array<{ id: number; name: string; icon: string }>;
  tags: Array<{ id: number; name: string; color: string }>;
  user: { id: number; name: string; email: string };
  recommendedForUsers: Array<{
    id: number;
    name: string;
    pivot: { recommended_role: string };
  }>;
}

export default function ToolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      fetchTool(params.id as string);
    }
    // Load current user
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, [params.id]);

  const fetchTool = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/tools/${id}`);
      if (!response.ok) {
        throw new Error('Tool not found');
      }
      const response_data = await response.json();
      setTool(response_data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tool');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1A1A1A] flex items-center justify-center">
        <p className="text-[#A3A3A3]">Loading tool...</p>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#A3A3A3] mb-4">{error || 'Tool not found'}</p>
          <Link
            href="/tools"
            className="inline-block px-6 py-3 border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white hover:border-[#A3A3A3] transition-colors"
          >
            Back to Tools
          </Link>
        </div>
      </div>
    );
  }

  const recommendedRoles = (tool.recommendedForUsers || [])
    .map((u) => u.pivot.recommended_role)
    .filter((role, index, self) => self.indexOf(role) === index);

  const canEditOrDelete = currentUser && (currentUser.id === tool.user.id || currentUser.role === 'admin');

  const handleDelete = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert('You must be logged in to delete tools');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/tools/${tool.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete tool');
      }

      // Redirect to tools page
      router.push('/tools');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete tool');
    }
  };

  const handleEdit = () => {
    // Store tool data in localStorage for the edit form to use
    localStorage.setItem('editingTool', JSON.stringify(tool));
    router.push('/tools/add');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1A1A1A]">
      {/* Fixed Header */}
      <header className="border-b border-[#F4F4F4] dark:border-[#2A2A2A] fixed top-0 left-0 right-0 bg-white dark:bg-[#1A1A1A] z-50">
        <div className="max-w-6xl mx-auto px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs tracking-widest uppercase font-light text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <nav className="flex gap-4">
              <span className="px-4 py-2 text-xs tracking-widest uppercase font-light text-[#1A1A1A] dark:text-white">
                Explore Tools
              </span>
              <Link
                href="/tools/add"
                className="px-4 py-2 text-xs tracking-widest uppercase font-light text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
              >
                Submit Tool
              </Link>
            </nav>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="px-6 py-2 border border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white hover:bg-[#F4F4F4] dark:hover:bg-[#2A2A2A] transition-all duration-300 text-xs tracking-widest uppercase font-light"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16 pt-32">

        {/* Back Button */}
        <Link 
          href="/tools"
          className="inline-flex items-center gap-2 text-sm text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white transition-colors mb-8"
        >
          ← Back
        </Link>

        {/* Header */}
        <div className="mb-12">
          {tool.is_featured && (
            <div className="text-sm text-[#A3A3A3] mb-2">⭐ Featured Tool</div>
          )}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-5xl font-light text-[#1A1A1A] dark:text-white">
              {tool.name}
            </h1>
            
            {/* Edit and Delete buttons - only shown to owner or admin */}
            {canEditOrDelete && (
              <div className="flex gap-3">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm border border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white hover:bg-[#F4F4F4] dark:hover:bg-[#2A2A2A] transition-all duration-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="px-4 py-2 text-sm border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          <p className="text-xl text-[#A3A3A3] mb-6">{tool.description}</p>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm text-[#A3A3A3] mb-6">
            <span>Submitted by {tool.user.name}</span>
            <span>•</span>
            <span>{tool.views_count} views</span>
            <span>•</span>
            <span>
              {new Date(tool.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <a
              href={tool.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-[#333] dark:hover:bg-[#F4F4F4] transition-colors"
            >
              Visit Tool →
            </a>
            {tool.documentation_link && (
              <a
                href={tool.documentation_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white hover:border-[#A3A3A3] transition-colors"
              >
                View Documentation
              </a>
            )}
          </div>
        </div>

        {/* Categories and Tags */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-6">
            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium text-[#A3A3A3] mb-3">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {tool.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/tools?category=${category.id}`}
                    className="px-3 py-1.5 text-sm border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white hover:border-[#A3A3A3] transition-colors"
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Tags */}
            {tool.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[#A3A3A3] mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tools?tag=${tag.id}`}
                      className="px-2 py-1 text-xs text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
                      style={{ borderBottom: `2px solid ${tag.color}` }}
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommended For */}
        {recommendedRoles.length > 0 && (
          <div className="mb-12 p-6 bg-[#F4F4F4] dark:bg-[#2A2A2A]">
            <h3 className="text-sm font-medium text-[#A3A3A3] mb-3">
              Recommended For
            </h3>
            <div className="flex flex-wrap gap-2">
              {recommendedRoles.map((role, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 text-sm bg-white dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* How to Use */}
        {tool.how_to_use && (
          <div className="mb-12">
            <h2 className="text-2xl font-light text-[#1A1A1A] dark:text-white mb-6">
              How to Use
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-[#A3A3A3] whitespace-pre-wrap">
                {tool.how_to_use}
              </p>
            </div>
          </div>
        )}

        {/* Real Examples */}
        {tool.real_examples && (
          <div className="mb-12">
            <h2 className="text-2xl font-light text-[#1A1A1A] dark:text-white mb-6">
              Real-World Examples
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-[#A3A3A3] whitespace-pre-wrap">
                {tool.real_examples}
              </p>
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="pt-12 border-t border-[#F4F4F4] dark:border-[#333]">
          <div className="text-center">
            <p className="text-[#A3A3A3] mb-4">
              Have a tool to share with the community?
            </p>
            <Link
              href="/tools/add"
              className="inline-block px-6 py-3 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-[#333] dark:hover:bg-[#F4F4F4] transition-colors"
            >
              Submit a Tool
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1A1A1A] p-8 rounded-lg max-w-md mx-4 border border-[#F4F4F4] dark:border-[#2A2A2A]">
            <h3 className="text-2xl font-light text-[#1A1A1A] dark:text-white mb-4">
              Delete Tool
            </h3>
            <p className="text-[#A3A3A3] mb-6">
              Are you sure you want to delete "{tool.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-6 py-2 border border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white hover:bg-[#F4F4F4] dark:hover:bg-[#2A2A2A] transition-all duration-300"
              >
                No
              </button>
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  handleDelete();
                }}
                className="px-6 py-2 bg-red-500 text-white hover:bg-red-600 transition-all duration-300"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
