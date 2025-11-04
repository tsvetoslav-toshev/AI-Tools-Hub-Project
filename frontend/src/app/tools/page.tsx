'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Tool {
  id: number;
  name: string;
  slug: string;
  description: string;
  link: string;
  views_count: number;
  is_featured: boolean;
  categories: Array<{ id: number; name: string; icon: string }>;
  tags: Array<{ id: number; name: string; color: string }>;
  user: { id: number; name: string };
}

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

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    fetchTools();
  }, [search, selectedCategory, selectedTag, sortBy, sortOrder, currentPage]);

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

  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category_id', selectedCategory.toString());
      if (selectedTag) params.append('tag_id', selectedTag.toString());
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder);
      params.append('page', currentPage.toString());

      const response = await fetch(`http://localhost:8080/api/tools?${params}`);
      const data = await response.json();
      setTools(data.data);
      setTotalPages(data.last_page);
    } catch (err) {
      console.error('Failed to fetch tools:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory(null);
    setSelectedTag(null);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/dashboard"
            className="text-sm text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white transition-colors mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-light text-[#1A1A1A] dark:text-white mb-2">
                AI Tools Hub
              </h1>
              <p className="text-[#A3A3A3]">
                Discover and share the tools that shape our future
              </p>
            </div>
            <Link
              href="/tools/add"
              className="px-6 py-3 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-[#333] dark:hover:bg-[#F4F4F4] transition-colors"
            >
              Submit Tool
            </Link>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search tools..."
              className="w-full px-4 py-3 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#A3A3A3]"
            />
          </div>

          {/* Sort and Filter Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#A3A3A3]"
            >
              <option value="created_at">Newest First</option>
              <option value="views">Most Viewed</option>
            </select>

            {(search || selectedCategory || selectedTag) && (
              <button
                onClick={clearFilters}
                className="text-sm text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0">
            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-[#1A1A1A] dark:text-white mb-4">
                Categories
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    selectedCategory === null
                      ? 'bg-[#F4F4F4] dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-white'
                      : 'text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-[#F4F4F4] dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-white'
                        : 'text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-sm font-medium text-[#1A1A1A] dark:text-white mb-4">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 15).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      setSelectedTag(selectedTag === tag.id ? null : tag.id);
                      setCurrentPage(1);
                    }}
                    className={`px-2 py-1 text-xs border transition-colors ${
                      selectedTag === tag.id
                        ? 'border-[#1A1A1A] dark:border-white bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]'
                        : 'border-[#F4F4F4] dark:border-[#333] text-[#A3A3A3] hover:border-[#A3A3A3]'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Tools Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="text-center py-12 text-[#A3A3A3]">
                Loading tools...
              </div>
            ) : tools.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#A3A3A3] mb-4">No tools found</p>
                <Link
                  href="/tools/add"
                  className="inline-block px-6 py-3 border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white hover:border-[#A3A3A3] transition-colors"
                >
                  Submit the First Tool
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.id}`}
                      className="group border border-[#F4F4F4] dark:border-[#333] p-6 hover:border-[#A3A3A3] transition-colors"
                    >
                      {/* Featured Badge */}
                      {tool.is_featured && (
                        <div className="text-xs text-[#A3A3A3] mb-2">⭐ Featured</div>
                      )}

                      {/* Tool Name */}
                      <h3 className="text-xl font-light text-[#1A1A1A] dark:text-white mb-2 group-hover:text-[#A3A3A3] transition-colors">
                        {tool.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-[#A3A3A3] mb-4 line-clamp-3">
                        {tool.description}
                      </p>

                      {/* Categories */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tool.categories.slice(0, 2).map((category) => (
                          <span
                            key={category.id}
                            className="text-xs px-2 py-1 border border-[#F4F4F4] dark:border-[#333] text-[#A3A3A3]"
                          >
                            {category.icon} {category.name}
                          </span>
                        ))}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {tool.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs px-2 py-0.5 text-[#A3A3A3]"
                            style={{ borderBottom: `2px solid ${tag.color}` }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-[#A3A3A3]">
                        <span>by {tool.user.name}</span>
                        <span>{tool.views_count} views</span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#A3A3A3] transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-[#A3A3A3]">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#A3A3A3] transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
