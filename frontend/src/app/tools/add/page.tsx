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

  const [formData, setFormData] = useState({
    name: '',
    link: '',
    documentation_link: '',
    description: '',
    how_to_use: '',
    real_examples: '',
    images: [''],
    categories: [] as number[],
    tags: [] as number[],
    recommended_roles: [] as string[],
  });

  useEffect(() => {
    fetchCategories();
    fetchTags();
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

    try {
      // For demo purposes, we'll simulate authentication
      // In production, you'd get this from your auth system
      const token = 'demo-token'; // Replace with actual auth token

      const submitData = {
        ...formData,
        images: formData.images.filter(img => img.trim() !== ''),
      };

      const response = await fetch('http://localhost:8080/api/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit tool');
      }

      setSuccess(true);
      setFormData({
        name: '',
        link: '',
        documentation_link: '',
        description: '',
        how_to_use: '',
        real_examples: '',
        images: [''],
        categories: [],
        tags: [],
        recommended_roles: [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit tool');
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

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ''],
    }));
  };

  const updateImage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img),
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1A1A1A]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/dashboard"
            className="text-sm text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white transition-colors mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-light text-[#1A1A1A] dark:text-white mb-2">
            Submit a Tool
          </h1>
          <p className="text-[#A3A3A3]">
            Share an AI tool that shapes our future
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8 p-4 border border-[#F4F4F4] dark:border-[#333] bg-[#F4F4F4] dark:bg-[#2A2A2A] rounded">
            <p className="text-[#1A1A1A] dark:text-white">
              ✓ Tool submitted successfully! It will appear after admin approval.
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

          {/* Images */}
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-[#1A1A1A] dark:text-white border-b border-[#F4F4F4] dark:border-[#333] pb-2">
              Images
            </h2>

            {formData.images.map((image, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => updateImage(index, e.target.value)}
                  className="flex-1 px-4 py-3 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#A3A3A3]"
                  placeholder={`Image URL ${index + 1}`}
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="px-4 py-3 border border-[#F4F4F4] dark:border-[#333] text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white hover:border-[#A3A3A3] transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            {formData.images.length < 5 && (
              <button
                type="button"
                onClick={addImageField}
                className="text-sm text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
              >
                + Add Another Image (max 5)
              </button>
            )}
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
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading || formData.categories.length === 0}
              className="px-8 py-3 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-[#333] dark:hover:bg-[#F4F4F4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Tool'}
            </button>
            <Link
              href="/tools"
              className="px-8 py-3 border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white hover:border-[#A3A3A3] transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
