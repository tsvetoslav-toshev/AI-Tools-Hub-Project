'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import RatingStars from '@/components/RatingStars';

interface Tool {
  id: number;
  name: string;
  slug: string;
  description: string;
  link: string;
  views_count: number;
  is_featured: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'archived';
  categories: Array<{ id: number; name: string; icon: string }>;
  tags: Array<{ id: number; name: string; color: string }>;
  user: { id: number; name: string };
  average_rating: number;
  ratings_count: number;
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
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setCategoryDropdownOpen(false);
        setTagDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
  }, [search, selectedCategory, selectedTag, selectedCategories, selectedTags, sortBy, sortOrder, currentPage]);

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
      
      // Only show approved tools for non-admin users
      if (typeof window !== 'undefined') {
        const user = localStorage.getItem('user');
        if (user) {
          try {
            const userData = JSON.parse(user);
            const userRole = userData.role;
            if (userRole !== 'owner' && userRole !== 'admin') {
              params.append('status', 'approved');
            }
          } catch (error) {
            // If parsing fails, show only approved tools
            params.append('status', 'approved');
          }
        } else {
          // No user logged in, show only approved tools
          params.append('status', 'approved');
        }
      }
      
      // Desktop uses single select
      if (selectedCategory) params.append('category_id', selectedCategory.toString());
      if (selectedTag) params.append('tag_id', selectedTag.toString());
      // Mobile uses multi-select
      if (selectedCategories.length > 0) {
        selectedCategories.forEach(id => params.append('category_id[]', id.toString()));
      }
      if (selectedTags.length > 0) {
        selectedTags.forEach(id => params.append('tag_id[]', id.toString()));
      }
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
    setSelectedCategories([]);
    setSelectedTags([]);
    setCurrentPage(1);
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'linear-gradient(to top left, #3A3A3A, #1A1A1A)'
      }}
    >
      {/* Unified Navbar */}
      <Navbar currentPage="explore-tools" />

      <div className="max-w-4xl mx-auto px-6 py-16 pt-32">
        {/* Header */}
        <div className="mb-12">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-light text-[#1A1A1A] dark:text-white mb-2">
                AI Tools Hub
              </h1>
              <p className="text-base text-[#A3A3A3]">
                Discover and share the tools that shape our future
              </p>
            </div>
            <Link
              href="/tools/add"
              className="px-6 py-3 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-[#333] dark:hover:bg-[#F4F4F4] transition-colors whitespace-nowrap"
            >
              Submit Tool
            </Link>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-light text-[#1A1A1A] dark:text-white mb-2">
                AI Tools Hub
              </h1>
              <p className="text-sm text-[#A3A3A3]">
                Discover and share the tools<br />that shape our future
              </p>
            </div>
            <Link
              href="/tools/add"
              className="flex-shrink-0 px-6 py-3 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-[#333] dark:hover:bg-[#F4F4F4] transition-colors whitespace-nowrap"
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

          {/* Desktop Filter Dropdowns */}
          <div className="hidden md:flex gap-3 mb-6">
            {/* Categories Dropdown */}
            <div className="flex-1 relative dropdown-container">
              <button
                onClick={() => {
                  setCategoryDropdownOpen(!categoryDropdownOpen);
                  setTagDropdownOpen(false);
                }}
                className="w-full px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white text-sm flex items-center justify-between"
              >
                <span>Categories {selectedCategories.length > 0 && `(${selectedCategories.length})`}</span>
                <svg className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] max-h-64 overflow-y-auto z-10 shadow-lg">
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#F4F4F4] dark:hover:bg-[#1A1A1A] border-b-2 border-[#F4F4F4] dark:border-[#333] font-medium"
                  >
                    Clear All Categories
                  </button>
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center px-4 py-3 hover:bg-[#F4F4F4] dark:hover:bg-[#1A1A1A] cursor-pointer border-b border-[#F4F4F4] dark:border-[#333] last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                          }
                          setCurrentPage(1);
                        }}
                        className="mr-3 w-4 h-4"
                      />
                      <span className="mr-2">{category.icon}</span>
                      <span className="text-sm text-[#1A1A1A] dark:text-white">{category.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Tags Dropdown */}
            <div className="flex-1 relative dropdown-container">
              <button
                onClick={() => {
                  setTagDropdownOpen(!tagDropdownOpen);
                  setCategoryDropdownOpen(false);
                }}
                className="w-full px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white text-sm flex items-center justify-between"
              >
                <span>Tags {selectedTags.length > 0 && `(${selectedTags.length})`}</span>
                <svg className={`w-4 h-4 transition-transform ${tagDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {tagDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] max-h-64 overflow-y-auto z-10 shadow-lg">
                  <button
                    onClick={() => {
                      setSelectedTags([]);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#F4F4F4] dark:hover:bg-[#1A1A1A] border-b-2 border-[#F4F4F4] dark:border-[#333] font-medium"
                  >
                    Clear All Tags
                  </button>
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center px-4 py-3 hover:bg-[#F4F4F4] dark:hover:bg-[#1A1A1A] cursor-pointer border-b border-[#F4F4F4] dark:border-[#333] last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTags([...selectedTags, tag.id]);
                          } else {
                            setSelectedTags(selectedTags.filter(id => id !== tag.id));
                          }
                          setCurrentPage(1);
                        }}
                        className="mr-3 w-4 h-4"
                      />
                      <span className="text-sm text-[#1A1A1A] dark:text-white">{tag.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white text-sm focus:outline-none focus:border-[#A3A3A3] appearance-none pr-10"
              >
                <option value="created_at">Newest First</option>
                <option value="views">Most Viewed</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[#1A1A1A] dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Clear All Filters - Desktop */}
          {(search || selectedCategories.length > 0 || selectedTags.length > 0) && (
            <div className="hidden md:block mb-6">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white border border-[#F4F4F4] dark:border-[#333] hover:border-[#A3A3A3] transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Mobile Filter Dropdowns */}
          <div className="md:hidden">
            <div className="flex gap-3 mb-3">
              {/* Categories Dropdown */}
              <div className="flex-1 relative dropdown-container">
                <button
                  onClick={() => {
                    setCategoryDropdownOpen(!categoryDropdownOpen);
                    setTagDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white text-sm flex items-center justify-between"
                >
                  <span>Categories {selectedCategories.length > 0 && `(${selectedCategories.length})`}</span>
                  <svg className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] max-h-64 overflow-y-auto z-10 shadow-lg">
                    {/* Clear All Option */}
                    <button
                      onClick={() => {
                        setSelectedCategories([]);
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#F4F4F4] dark:hover:bg-[#1A1A1A] border-b-2 border-[#F4F4F4] dark:border-[#333] font-medium"
                    >
                      Clear All Categories
                    </button>
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center px-4 py-3 hover:bg-[#F4F4F4] dark:hover:bg-[#1A1A1A] cursor-pointer border-b border-[#F4F4F4] dark:border-[#333] last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category.id]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                            }
                            setCurrentPage(1);
                          }}
                          className="mr-3 w-4 h-4"
                        />
                        <span className="mr-2">{category.icon}</span>
                        <span className="text-sm text-[#1A1A1A] dark:text-white">{category.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags Dropdown */}
              <div className="flex-1 relative dropdown-container">
                <button
                  onClick={() => {
                    setTagDropdownOpen(!tagDropdownOpen);
                    setCategoryDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white text-sm flex items-center justify-between"
                >
                  <span>Tags {selectedTags.length > 0 && `(${selectedTags.length})`}</span>
                  <svg className={`w-4 h-4 transition-transform ${tagDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {tagDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] max-h-64 overflow-y-auto z-10 shadow-lg">
                    {/* Clear All Option */}
                    <button
                      onClick={() => {
                        setSelectedTags([]);
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#F4F4F4] dark:hover:bg-[#1A1A1A] border-b-2 border-[#F4F4F4] dark:border-[#333] font-medium"
                    >
                      Clear All Tags
                    </button>
                    {tags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center px-4 py-3 hover:bg-[#F4F4F4] dark:hover:bg-[#1A1A1A] cursor-pointer border-b border-[#F4F4F4] dark:border-[#333] last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTags([...selectedTags, tag.id]);
                            } else {
                              setSelectedTags(selectedTags.filter(id => id !== tag.id));
                            }
                            setCurrentPage(1);
                          }}
                          className="mr-3 w-4 h-4"
                        />
                        <span className="text-sm text-[#1A1A1A] dark:text-white">{tag.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Clear All Filters Button - Mobile Only */}
            {(selectedCategories.length > 0 || selectedTags.length > 0 || search) && (
              <button
                onClick={clearFilters}
                className="w-full mb-6 px-4 py-2 text-sm text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white border border-[#F4F4F4] dark:border-[#333] hover:border-[#A3A3A3] transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Tools Grid */}
        <div>
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
                <div className="grid grid-cols-1 min-[390px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {tools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.id}`}
                      className="group border border-[#F4F4F4] dark:border-[#333] p-6 hover:border-[#A3A3A3] transition-colors"
                    >
                      {/* Status & Featured Badges */}
                      <div className="flex items-center gap-2 mb-2">
                        {tool.is_featured && (
                          <div className="text-xs text-[#A3A3A3]">⭐ Featured</div>
                        )}
                        {tool.status && tool.status !== 'approved' && (
                          <div className={`text-xs px-2 py-1 rounded ${
                            tool.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
                            tool.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                            tool.status === 'archived' ? 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400' : ''
                          }`}>
                            {tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}
                          </div>
                        )}
                      </div>

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

                      {/* Rating */}
                      {(tool.average_rating > 0 || tool.ratings_count > 0) && (
                        <div className="mb-3">
                          <RatingStars 
                            rating={tool.average_rating || 0} 
                            totalRatings={tool.ratings_count || 0} 
                            size="sm" 
                          />
                        </div>
                      )}

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
        </div>
      </div>
    </div>
  );
}
