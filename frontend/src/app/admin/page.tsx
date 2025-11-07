'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stats {
  tools: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    archived: number;
    featured: number;
  };
  users: {
    total: number;
    admins: number;
    moderators: number;
    users: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
  }, []);

  const checkAdminAccess = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    const role = userData.role || '';
    setUserRole(role);
    
    // Allow both admin and moderator access
    if (role !== 'owner' && role !== 'admin' && role !== 'moderator') {
      router.push('/dashboard');
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isModerator = user.role === 'moderator';

      // Moderators use /api/moderator, admins use /api/admin
      const toolsEndpoint = isModerator ? 'moderator' : 'admin';

      // Fetch tool statistics
      const toolsResponse = await fetch(`${apiUrl}/api/${toolsEndpoint}/tools/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      let usersData = { total: 0, admins: 0, moderators: 0, users: 0 };
      
      // Only admins can fetch user statistics
      if (!isModerator) {
        const usersResponse = await fetch(`${apiUrl}/api/admin/users/statistics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (usersResponse.ok) {
          usersData = await usersResponse.json();
        }
      }

      if (toolsResponse.ok) {
        const toolsData = await toolsResponse.json();

        setStats({
          tools: toolsData,
          users: usersData,
        });
      } else {
        setError('Failed to load statistics');
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-[#A3A3A3]">Loading...</div>
      </div>
    );
  }

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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-light text-[#1A1A1A] dark:text-white">
              Admin Dashboard
            </h1>
            <Link
              href="/dashboard"
              className="px-6 py-2 border border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white hover:bg-[#F4F4F4] dark:hover:bg-[#2A2A2A] transition-all duration-300 text-xs tracking-widest uppercase font-light"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        {error && (
          <div className="mb-8 border border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-4">
            {error}
          </div>
        )}

        {/* Statistics Grid */}
        {stats && (
          <div className="mb-12">
            <h2 className="text-xl font-light text-[#1A1A1A] dark:text-white mb-6">
              Statistics Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Tools */}
              <div className="border border-[#F4F4F4] dark:border-[#2A2A2A] p-6">
                <div className="text-4xl font-light text-[#1A1A1A] dark:text-white mb-2">
                  {stats.tools.total}
                </div>
                <div className="text-xs uppercase tracking-widest text-[#A3A3A3]">
                  Total Tools
                </div>
              </div>

              {/* Pending Tools */}
              <div className="border border-yellow-500 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/10 p-6">
                <div className="text-4xl font-light text-yellow-600 dark:text-yellow-400 mb-2">
                  {stats.tools.pending}
                </div>
                <div className="text-xs uppercase tracking-widest text-yellow-600 dark:text-yellow-500">
                  Pending Review
                </div>
              </div>

              {/* Approved Tools */}
              <div className="border border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/10 p-6">
                <div className="text-4xl font-light text-green-600 dark:text-green-400 mb-2">
                  {stats.tools.approved}
                </div>
                <div className="text-xs uppercase tracking-widest text-green-600 dark:text-green-500">
                  Approved
                </div>
              </div>

              {/* Total Users - ADMIN ONLY */}
              {userRole !== 'moderator' && (
              <div className="border border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/10 p-6">
                <div className="text-4xl font-light text-blue-600 dark:text-blue-400 mb-2">
                  {stats.users.total}
                </div>
                <div className="text-xs uppercase tracking-widest text-blue-600 dark:text-blue-500">
                  Total Users
                </div>
              </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-light text-[#1A1A1A] dark:text-white mb-6">
            Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tools Management */}
            <Link
              href="/admin/tools"
              className="group border border-[#F4F4F4] dark:border-[#2A2A2A] p-8 hover:border-[#1A1A1A] dark:hover:border-white transition-all"
            >
              <div className="mb-4">
                <svg className="w-12 h-12 text-[#A3A3A3] group-hover:text-[#1A1A1A] dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-light text-[#1A1A1A] dark:text-white mb-2">
                Tools Management
              </h3>
              <p className="text-sm text-[#A3A3A3] mb-4">
                Review, approve, reject, and manage all submitted tools
              </p>
              {stats && stats.tools.pending > 0 && (
                <div className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-xs font-medium rounded">
                  {stats.tools.pending} pending
                </div>
              )}
            </Link>

            {/* User Management - ADMIN ONLY */}
            {userRole !== 'moderator' && (
            <Link
              href="/admin/users"
              className="group border border-[#F4F4F4] dark:border-[#2A2A2A] p-8 hover:border-[#1A1A1A] dark:hover:border-white transition-all"
            >
              <div className="mb-4">
                <svg className="w-12 h-12 text-[#A3A3A3] group-hover:text-[#1A1A1A] dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-light text-[#1A1A1A] dark:text-white mb-2">
                User Management
              </h3>
              <p className="text-sm text-[#A3A3A3] mb-4">
                Manage users, assign roles, and control permissions
              </p>
              {stats && (
                <div className="text-xs text-[#A3A3A3]">
                  {stats.users.admins} admins, {stats.users.moderators} moderators
                </div>
              )}
            </Link>
            )}

            {/* Audit Logs - ADMIN ONLY */}
            {userRole !== 'moderator' && (
            <Link
              href="/admin/audit-logs"
              className="group border border-[#F4F4F4] dark:border-[#2A2A2A] p-8 hover:border-[#1A1A1A] dark:hover:border-white transition-all"
            >
              <div className="mb-4">
                <svg className="w-12 h-12 text-[#A3A3A3] group-hover:text-[#1A1A1A] dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-light text-[#1A1A1A] dark:text-white mb-2">
                Audit Logs
              </h3>
              <p className="text-sm text-[#A3A3A3]">
                View all system activities, user actions, and security events
              </p>
            </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
