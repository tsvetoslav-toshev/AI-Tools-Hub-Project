'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AuditLog {
  id: number;
  user: { id: number; name: string; email: string } | null;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  meta: any;
  ip: string;
  user_agent: string;
  created_at: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
    fetchActions();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [selectedAction, currentPage]);

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
    if (userData.role !== 'owner' && userData.role !== 'admin') {
      router.push('/dashboard');
    }
  };

  const fetchActions = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const response = await fetch(`${apiUrl}/api/admin/audit-logs/actions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActions(data);
      }
    } catch (err) {
      console.error('Failed to fetch actions:', err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const params = new URLSearchParams();
      if (selectedAction) params.append('action', selectedAction);
      params.append('page', currentPage.toString());
      params.append('per_page', '50');

      const response = await fetch(`${apiUrl}/api/admin/audit-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data);
        setTotalPages(data.last_page);
      } else {
        setError('Failed to load audit logs');
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('success') || action.includes('approved') || action.includes('verified')) {
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10';
    }
    if (action.includes('failed') || action.includes('rejected')) {
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10';
    }
    if (action.includes('sent') || action.includes('submitted')) {
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10';
    }
    if (action.includes('assigned') || action.includes('removed')) {
      return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10';
    }
    return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/10';
  };

  const formatAction = (action: string) => {
    return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
              Audit Logs
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
              Audit Logs
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
        {/* Error Message */}
        {error && (
          <div className="mb-6 border border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-4">
            {error}
            <button onClick={() => setError('')} className="float-right font-bold">×</button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8">
          {/* Mobile Dropdown */}
          <div className="sm:hidden relative dropdown-container">
            <label htmlFor="action-filter" className="block text-xs uppercase tracking-widest text-[#A3A3A3] mb-2">
              Filter by Action
            </label>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white text-sm flex items-center justify-between"
            >
              <span>{selectedAction ? formatAction(selectedAction) : 'All Actions'}</span>
              <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] max-h-64 overflow-y-auto z-10 shadow-lg">
                <button
                  onClick={() => {
                    setSelectedAction('');
                    setCurrentPage(1);
                    setDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-[#F4F4F4] dark:hover:bg-[#1A1A1A] border-b border-[#F4F4F4] dark:border-[#333] ${
                    selectedAction === '' 
                      ? 'bg-[#F4F4F4] dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white font-medium' 
                      : 'text-[#A3A3A3]'
                  }`}
                >
                  All Actions
                </button>
                {actions.map((action) => (
                  <button
                    key={action}
                    onClick={() => {
                      setSelectedAction(action);
                      setCurrentPage(1);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-[#F4F4F4] dark:hover:bg-[#1A1A1A] border-b border-[#F4F4F4] dark:border-[#333] last:border-b-0 ${
                      selectedAction === action 
                        ? 'bg-[#F4F4F4] dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white font-medium' 
                        : 'text-[#A3A3A3]'
                    }`}
                  >
                    {formatAction(action)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden sm:flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedAction('');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-xs tracking-widest uppercase font-light border transition-colors ${
                selectedAction === ''
                  ? 'border-[#1A1A1A] dark:border-white bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]'
                  : 'border-[#F4F4F4] dark:border-[#2A2A2A] text-[#A3A3A3] hover:border-[#A3A3A3]'
              }`}
            >
              All Actions
            </button>
            {actions.map(action => (
              <button
                key={action}
                onClick={() => {
                  setSelectedAction(action);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 text-xs font-light border transition-colors ${
                  selectedAction === action
                    ? 'border-[#1A1A1A] dark:border-white bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]'
                    : 'border-[#F4F4F4] dark:border-[#2A2A2A] text-[#A3A3A3] hover:border-[#A3A3A3]'
                }`}
              >
                {formatAction(action)}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Timeline */}
        {loading ? (
          <div className="text-center py-12 text-[#A3A3A3]">
            Loading audit logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 border border-[#F4F4F4] dark:border-[#2A2A2A]">
            <p className="text-[#A3A3A3]">No audit logs found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="border border-[#F4F4F4] dark:border-[#2A2A2A] p-6 hover:border-[#A3A3A3] transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                      {formatAction(log.action)}
                    </span>
                    {log.entity_type && (
                      <span className="text-xs text-[#A3A3A3]">
                        {log.entity_type} #{log.entity_id}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#A3A3A3]">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-1">User</div>
                    <div className="text-[#1A1A1A] dark:text-white font-light">
                      {log.user ? (
                        <>
                          {log.user.name}
                          <span className="text-xs text-[#A3A3A3] ml-2">{log.user.email}</span>
                        </>
                      ) : (
                        <span className="text-[#A3A3A3]">System</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-1">IP Address</div>
                    <div className="text-[#1A1A1A] dark:text-white font-light font-mono text-xs">
                      {log.ip}
                    </div>
                  </div>
                </div>

                {log.meta && Object.keys(log.meta).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#F4F4F4] dark:border-[#2A2A2A]">
                    <div className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2">Details</div>
                    <div className="bg-[#F4F4F4] dark:bg-[#2A2A2A] p-3 rounded">
                      <pre className="text-xs text-[#1A1A1A] dark:text-white font-mono overflow-x-auto">
                        {JSON.stringify(log.meta, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-[#F4F4F4] dark:border-[#2A2A2A]">
                  <div className="text-xs text-[#A3A3A3] truncate" title={log.user_agent}>
                    <span className="font-medium">User Agent:</span> {log.user_agent}
                  </div>
                </div>
              </div>
            ))}
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
