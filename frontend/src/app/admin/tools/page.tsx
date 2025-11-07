'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tool {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  user: { id: number; name: string; email: string };
  categories: Array<{ id: number; name: string }>;
  created_at: string;
  reviewed_at?: string;
  approver?: { id: number; name: string };
}

export default function AdminToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    fetchTools();
  }, [selectedStatus, currentPage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkAdminAccess = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    // Allow admin and moderator
    if (userData.role !== 'owner' && userData.role !== 'admin' && userData.role !== 'moderator') {
      router.push('/dashboard');
    }
  };

  const fetchTools = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const endpoint = user.role === 'moderator' ? 'moderator' : 'admin';

      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      params.append('page', currentPage.toString());
      params.append('per_page', '20');

      const response = await fetch(`${apiUrl}/api/${endpoint}/tools?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTools(data.data);
        setTotalPages(data.last_page);
      } else {
        setError('Failed to load tools');
      }
    } catch (err) {
      console.error('Failed to fetch tools:', err);
      setError('Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  const handleToolAction = async (toolId: number, action: 'approve' | 'reject' | 'archive') => {
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const endpoint = user.role === 'moderator' ? 'moderator' : 'admin';

      const response = await fetch(`${apiUrl}/api/${endpoint}/tools/${toolId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess(`Tool ${action}d successfully`);
        setTimeout(() => setSuccess(''), 3000);
        fetchTools();
      } else {
        const data = await response.json();
        setError(data.message || `Failed to ${action} tool`);
      }
    } catch (err) {
      console.error(`Failed to ${action} tool:`, err);
      setError(`Failed to ${action} tool`);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedTools.length === 0) {
      setError('Please select at least one tool');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const endpoint = user.role === 'moderator' ? 'moderator' : 'admin';

      const response = await fetch(`${apiUrl}/api/${endpoint}/tools/bulk-${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tool_ids: selectedTools }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`${data.processed} tools ${action}d successfully`);
        setTimeout(() => setSuccess(''), 3000);
        setSelectedTools([]);
        fetchTools();
      } else {
        const data = await response.json();
        setError(data.message || `Failed to bulk ${action}`);
      }
    } catch (err) {
      console.error(`Failed to bulk ${action}:`, err);
      setError(`Failed to bulk ${action}`);
    }
  };

  const toggleToolSelection = (toolId: number) => {
    setSelectedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedTools(prev =>
      prev.length === tools.length
        ? []
        : tools.map(tool => tool.id)
    );
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'linear-gradient(to top left, #3A3A3A, #1A1A1A)'
      }}
    >
      {/* Header */}
      <header className="border-b border-[#F4F4F4] dark:border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          {/* Mobile Layout */}
          <div className="sm:hidden">
            <h1 className="text-2xl font-light text-[#1A1A1A] dark:text-white mb-4">
              Tools Management
            </h1>
            <Link
              href="/admin"
              className="inline-block px-6 py-2 border border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white hover:bg-[#F4F4F4] dark:hover:bg-[#2A2A2A] transition-all duration-300 text-xs tracking-widest uppercase font-light"
            >
              Back to Admin
            </Link>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden sm:flex justify-between items-center">
            <h1 className="text-3xl font-light text-[#1A1A1A] dark:text-white">
              Tools Management
            </h1>
            <Link
              href="/admin"
              className="px-6 py-2 border border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white hover:bg-[#F4F4F4] dark:hover:bg-[#2A2A2A] transition-all duration-300 text-xs tracking-widest uppercase font-light"
            >
              Back to Admin
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        {/* Messages */}
        {error && (
          <div className="mb-6 border border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-4">
            {error}
            <button onClick={() => setError('')} className="float-right font-bold">×</button>
          </div>
        )}
        {success && (
          <div className="mb-6 border border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-6 py-4">
            {success}
            <button onClick={() => setSuccess('')} className="float-right font-bold">×</button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8">
          {/* Mobile Dropdown */}
          <div className="sm:hidden relative dropdown-container">
            <label htmlFor="status-filter" className="block text-xs uppercase tracking-widest text-[#A3A3A3] mb-2">
              Filter by Status
            </label>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white text-sm flex items-center justify-between"
            >
              <span className="capitalize">{selectedStatus}</span>
              <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] max-h-64 overflow-y-auto z-10 shadow-lg">
                {['pending', 'approved', 'rejected', 'archived'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setCurrentPage(1);
                      setSelectedTools([]);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm capitalize hover:bg-[#F4F4F4] dark:hover:bg-[#1A1A1A] border-b border-[#F4F4F4] dark:border-[#333] last:border-b-0 ${
                      selectedStatus === status 
                        ? 'bg-[#F4F4F4] dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white font-medium' 
                        : 'text-[#A3A3A3]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden sm:flex flex-wrap gap-2">
            {['pending', 'approved', 'rejected', 'archived'].map(status => (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatus(status);
                  setCurrentPage(1);
                  setSelectedTools([]);
                }}
                className={`px-4 py-2 text-xs tracking-widest uppercase font-light border transition-colors ${
                  selectedStatus === status
                    ? 'border-[#1A1A1A] dark:border-white bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]'
                    : 'border-[#F4F4F4] dark:border-[#2A2A2A] text-[#A3A3A3] hover:border-[#A3A3A3]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Bulk Actions */}
          {selectedStatus === 'pending' && selectedTools.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs tracking-widest uppercase font-light transition-colors"
              >
                Approve Selected ({selectedTools.length})
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs tracking-widest uppercase font-light transition-colors"
              >
                Reject Selected ({selectedTools.length})
              </button>
            </div>
          )}
        </div>

        {/* Tools Table */}
        {loading ? (
          <div className="text-center py-12 text-[#A3A3A3]">
            Loading tools...
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-12 border border-[#F4F4F4] dark:border-[#2A2A2A]">
            <p className="text-[#A3A3A3]">No {selectedStatus} tools found</p>
          </div>
        ) : (
          <div className="border border-[#F4F4F4] dark:border-[#2A2A2A] overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-[#F4F4F4] dark:border-[#2A2A2A]">
                <tr>
                  {selectedStatus === 'pending' && (
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedTools.length === tools.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4"
                      />
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-[#A3A3A3] font-light">
                    Tool
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-[#A3A3A3] font-light">
                    Submitted By
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-[#A3A3A3] font-light">
                    Categories
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-[#A3A3A3] font-light">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-widest text-[#A3A3A3] font-light">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => (
                  <tr key={tool.id} className="border-b border-[#F4F4F4] dark:border-[#2A2A2A] last:border-b-0 hover:bg-[#F4F4F4] dark:hover:bg-[#2A2A2A] transition-colors">
                    {selectedStatus === 'pending' && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedTools.includes(tool.id)}
                          onChange={() => toggleToolSelection(tool.id)}
                          className="w-4 h-4"
                        />
                      </td>
                    )}
                    <td className="px-4 py-4">
                      <Link
                        href={`/tools/${tool.id}`}
                        target="_blank"
                        className="text-[#1A1A1A] dark:text-white hover:underline font-light"
                      >
                        {tool.name}
                      </Link>
                      <div className="text-xs text-[#A3A3A3] mt-1 line-clamp-1">
                        {tool.description}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-[#1A1A1A] dark:text-white font-light">
                        {tool.user.name}
                      </div>
                      <div className="text-xs text-[#A3A3A3]">
                        {tool.user.email}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {tool.categories.slice(0, 2).map(cat => (
                          <span key={cat.id} className="text-xs px-2 py-1 bg-[#F4F4F4] dark:bg-[#2A2A2A] text-[#A3A3A3] rounded">
                            {cat.name}
                          </span>
                        ))}
                        {tool.categories.length > 2 && (
                          <span className="text-xs text-[#A3A3A3]">
                            +{tool.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#A3A3A3] font-light">
                      {new Date(tool.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2 justify-end">
                        {tool.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleToolAction(tool.id, 'approve')}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors whitespace-nowrap"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleToolAction(tool.id, 'reject')}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors whitespace-nowrap"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {tool.status === 'approved' && (
                          <button
                            onClick={() => handleToolAction(tool.id, 'archive')}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors whitespace-nowrap"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-[#F4F4F4] dark:border-[#2A2A2A] text-[#1A1A1A] dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#A3A3A3] transition-colors text-xs tracking-widest uppercase font-light"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-[#A3A3A3] text-xs">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-[#F4F4F4] dark:border-[#2A2A2A] text-[#1A1A1A] dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#A3A3A3] transition-colors text-xs tracking-widest uppercase font-light"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
