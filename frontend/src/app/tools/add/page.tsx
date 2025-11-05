'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface Tag {
  id: number;
  name: string;
  color: string;
}

const roles = [
  'Backend Developer',
  'Frontend Developer',
  'Full-Stack Developer',
  'DevOps Engineer',
  'Data Scientist',
  'AI/ML Engineer',
  'Designer',
  'Product Manager',
  'QA Engineer',
  'Mobile Developer',
];

export default function AddToolPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [editingTool, setEditingTool] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    link: '',
    documentation_link: '',
    description: '',
    how_to_use: '',
    real_examples: '',
    categories: [] as number[],
    tags: [] as number[],
    recommended_roles: [] as string[],
  });

  useEffect(() => {
    fetchCategories();
    fetchTags();
    
    // Check if editing an existing tool
    const editingToolStr = localStorage.getItem('editingTool');
    if (editingToolStr) {
      const tool = JSON.parse(editingToolStr);
      setEditingTool(tool);
      
      // Pre-fill form with tool data
      setFormData({
        name: tool.name || '',
        link: tool.link || '',
        documentation_link: tool.documentation_link || '',
        description: tool.description || '',
        how_to_use: tool.how_to_use || '',
        real_examples: tool.real_examples || '',
        categories: tool.categories?.map((c: any) => c.id) || [],
        tags: tool.tags?.map((t: any) => t.id) || [],
        recommended_roles: tool.recommendedForUsers?.map((u: any) => u.pivot.recommended_role) || [],
      });
      
      // Clear the editing data
      localStorage.removeItem('editingTool');
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/tags');
      const data = await response.json();
      setTags(data);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Get authentication token from localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('You must be logged in to submit a tool');
        window.location.href = '/login';
        return;
      }

      // Check if data has changed (for edit mode)
      if (editingTool) {
        const hasChanges = 
          formData.name !== editingTool.name ||
          formData.link !== editingTool.link ||
          formData.documentation_link !== (editingTool.documentation_link || '') ||
          formData.description !== editingTool.description ||
          formData.how_to_use !== (editingTool.how_to_use || '') ||
          formData.real_examples !== (editingTool.real_examples || '') ||
          JSON.stringify(formData.categories.sort()) !== JSON.stringify(editingTool.categories?.map((c: any) => c.id).sort() || []) ||
          JSON.stringify(formData.tags.sort()) !== JSON.stringify(editingTool.tags?.map((t: any) => t.id).sort() || []) ||
          JSON.stringify(formData.recommended_roles.sort()) !== JSON.stringify(editingTool.recommendedForUsers?.map((u: any) => u.pivot.recommended_role).sort() || []);

        if (!hasChanges) {
          setError('No changes detected. Please modify at least one field to update the tool.');
          setLoading(false);
          return;
        }
      }

      const url = editingTool 
        ? `http://localhost:8080/api/tools/${editingTool.id}`
        : 'http://localhost:8080/api/tools';
      
      const method = editingTool ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to ${editingTool ? 'update' : 'submit'} tool`);
        } else {
          // If response is HTML (like a 401 redirect), show auth error
          if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
          }
          throw new Error(`Server error (${response.status}). Please try again.`);
        }
      }

      setSuccess(true);
      
      if (editingTool) {
        // Redirect to tool detail page after update
        setTimeout(() => {
          window.location.href = `/tools/${editingTool.id}`;
        }, 1500);
      } else {
        setFormData({
          name: '',
          link: '',
          documentation_link: '',
          description: '',
          how_to_use: '',
          real_examples: '',
          categories: [],
          tags: [],
          recommended_roles: [],
        });
        
        // Scroll to show success message
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${editingTool ? 'update' : 'submit'} tool`);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter(c => c !== id)
        : [...prev.categories, id],
    }));
  };

  const toggleTag = (id: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(id)
        ? prev.tags.filter(t => t !== id)
        : [...prev.tags, id],
    }));
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      recommended_roles: prev.recommended_roles.includes(role)
        ? prev.recommended_roles.filter(r => r !== role)
        : [...prev.recommended_roles, role],
    }));
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
              <Link
                href="/tools"
                className="px-4 py-2 text-xs tracking-widest uppercase font-light text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
              >
                Explore Tools
              </Link>
              <span className="px-4 py-2 text-xs tracking-widest uppercase font-light text-[#1A1A1A] dark:text-white">
                Submit Tool
              </span>
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

      <div className="max-w-4xl mx-auto px-6 py-16 pt-32">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-[#1A1A1A] dark:text-white mb-2">
            {editingTool ? 'Edit Tool' : 'Submit a Tool'}
          </h1>
          <p className="text-[#A3A3A3]">
            {editingTool ? 'Update the tool information below' : 'Share an AI tool that shapes our future'}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8 p-4 border border-[#F4F4F4] dark:border-[#333] bg-[#F4F4F4] dark:bg-[#2A2A2A] rounded">
            <p className="text-[#1A1A1A] dark:text-white">
              ✓ {editingTool ? 'Tool updated successfully! Redirecting...' : 'Tool submitted successfully! It will appear after admin approval.'}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20 rounded">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-[#1A1A1A] dark:text-white border-b border-[#F4F4F4] dark:border-[#333] pb-2">
              Basic Information
            </h2>

            <div>
              <label className="block text-sm text-[#A3A3A3] mb-2">
                Tool Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#A3A3A3]"
                placeholder="e.g., ChatGPT, Midjourney, GitHub Copilot"
              />
            </div>

            <div>
              <label className="block text-sm text-[#A3A3A3] mb-2">
                Tool URL *
              </label>
              <input
                type="url"
                required
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#A3A3A3]"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-[#A3A3A3] mb-2">
                Documentation URL (Optional)
              </label>
              <input
                type="url"
                value={formData.documentation_link}
                onChange={(e) => setFormData({ ...formData, documentation_link: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#A3A3A3]"
                placeholder="https://docs.example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-[#A3A3A3] mb-2">
                Description * (max 1000 characters)
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={1000}
                rows={4}
                className="w-full px-4 py-3 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#A3A3A3] resize-none"
                placeholder="Brief description of what this tool does..."
              />
              <p className="text-xs text-[#A3A3A3] mt-1">
                {formData.description.length}/1000
              </p>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-[#1A1A1A] dark:text-white border-b border-[#F4F4F4] dark:border-[#333] pb-2">
              Detailed Information
            </h2>

            <div>
              <label className="block text-sm text-[#A3A3A3] mb-2">
                How to Use (Optional, max 2000 characters)
              </label>
              <textarea
                value={formData.how_to_use}
                onChange={(e) => setFormData({ ...formData, how_to_use: e.target.value })}
                maxLength={2000}
                rows={6}
                className="w-full px-4 py-3 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#A3A3A3] resize-none"
                placeholder="Step-by-step guide on how to use this tool..."
              />
              <p className="text-xs text-[#A3A3A3] mt-1">
                {formData.how_to_use.length}/2000
              </p>
            </div>

            <div>
              <label className="block text-sm text-[#A3A3A3] mb-2">
                Real Examples (Optional, max 2000 characters)
              </label>
              <textarea
                value={formData.real_examples}
                onChange={(e) => setFormData({ ...formData, real_examples: e.target.value })}
                maxLength={2000}
                rows={6}
                className="w-full px-4 py-3 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#A3A3A3] resize-none"
                placeholder="Real-world use cases and examples..."
              />
              <p className="text-xs text-[#A3A3A3] mt-1">
                {formData.real_examples.length}/2000
              </p>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-[#1A1A1A] dark:text-white border-b border-[#F4F4F4] dark:border-[#333] pb-2">
              Categories *
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`px-4 py-3 border text-left transition-colors ${
                    formData.categories.includes(category.id)
                      ? 'border-[#1A1A1A] dark:border-white bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]'
                      : 'border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white hover:border-[#A3A3A3]'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-[#1A1A1A] dark:text-white border-b border-[#F4F4F4] dark:border-[#333] pb-2">
              Tags (Optional)
            </h2>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 text-sm border transition-colors ${
                    formData.tags.includes(tag.id)
                      ? 'border-[#1A1A1A] dark:border-white bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]'
                      : 'border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white hover:border-[#A3A3A3]'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Recommended Roles */}
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-[#1A1A1A] dark:text-white border-b border-[#F4F4F4] dark:border-[#333] pb-2">
              Recommended For (Optional)
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {roles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-4 py-3 border text-left text-sm transition-colors ${
                    formData.recommended_roles.includes(role)
                      ? 'border-[#1A1A1A] dark:border-white bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]'
                      : 'border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white hover:border-[#A3A3A3]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="space-y-4 pt-6">
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || formData.categories.length === 0}
                className="px-8 py-3 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-[#333] dark:hover:bg-[#F4F4F4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (editingTool ? 'Updating...' : 'Submitting...') : (editingTool ? 'Update Tool' : 'Submit Tool')}
              </button>
              <Link
                href="/tools"
                className="px-8 py-3 border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white hover:border-[#A3A3A3] transition-colors"
              >
                Cancel
              </Link>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-3 text-[#A3A3A3] text-sm">
                <div className="w-4 h-4 border-2 border-[#A3A3A3] border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting your tool...</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="border border-green-500 bg-green-50 dark:bg-green-900/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-light">
                  <span className="text-xl">✓</span>
                  <span className="text-sm tracking-wide uppercase">Success!</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-500">
                  Your tool has been published and is now visible in Explore Tools.
                </p>
                <Link
                  href="/tools"
                  className="inline-block text-sm text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 underline"
                >
                  View all tools →
                </Link>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="border border-red-500 bg-red-50 dark:bg-red-900/20 p-4">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
