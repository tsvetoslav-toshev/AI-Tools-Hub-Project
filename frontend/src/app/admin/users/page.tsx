'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  roles: Array<{ id: number; name: string; description: string }>;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, currentPage]);

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

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const response = await fetch(`${apiUrl}/api/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const params = new URLSearchParams();
      if (selectedRole) params.append('role', selectedRole);
      params.append('page', currentPage.toString());
      params.append('per_page', '20');

      const response = await fetch(`${apiUrl}/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
        setTotalPages(data.last_page);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (userId: number, roleName: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const response = await fetch(`${apiUrl}/api/admin/users/${userId}/assign-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: roleName }),
      });

      if (response.ok) {
        setSuccess(`Role "${roleName}" assigned successfully`);
        setTimeout(() => setSuccess(''), 3000);
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to assign role');
      }
    } catch (err) {
      console.error('Failed to assign role:', err);
      setError('Failed to assign role');
    }
  };

  const handleRemoveRole = async (userId: number, roleName: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const response = await fetch(`${apiUrl}/api/admin/users/${userId}/remove-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: roleName }),
      });

      if (response.ok) {
        setSuccess(`Role "${roleName}" removed successfully`);
        setTimeout(() => setSuccess(''), 3000);
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to remove role');
      }
    } catch (err) {
      console.error('Failed to remove role:', err);
      setError('Failed to remove role');
    }
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
              User Management
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
              User Management
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
            <label htmlFor="role-filter" className="block text-xs uppercase tracking-widest text-[#A3A3A3] mb-2">
              Filter by Role
            </label>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] text-[#1A1A1A] dark:text-white text-sm flex items-center justify-between"
            >
              <span className="capitalize">{selectedRole || 'All Users'}</span>
              <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#2A2A2A] border border-[#F4F4F4] dark:border-[#333] max-h-64 overflow-y-auto z-10 shadow-lg">
                <button
                  onClick={() => {
                    setSelectedRole('');
                    setCurrentPage(1);
                    setDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-[#F4F4F4] dark:hover:bg-[#1A1A1A] border-b border-[#F4F4F4] dark:border-[#333] ${
                    selectedRole === '' 
                      ? 'bg-[#F4F4F4] dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white font-medium' 
                      : 'text-[#A3A3A3]'
                  }`}
                >
                  All Users
                </button>
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRole(role.name);
                      setCurrentPage(1);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm capitalize hover:bg-[#F4F4F4] dark:hover:bg-[#1A1A1A] border-b border-[#F4F4F4] dark:border-[#333] last:border-b-0 ${
                      selectedRole === role.name 
                        ? 'bg-[#F4F4F4] dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white font-medium' 
                        : 'text-[#A3A3A3]'
                    }`}
                  >
                    {role.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => {
                setSelectedRole('');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-xs tracking-widest uppercase font-light border transition-colors ${
                selectedRole === ''
                  ? 'border-[#1A1A1A] dark:border-white bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]'
                  : 'border-[#F4F4F4] dark:border-[#2A2A2A] text-[#A3A3A3] hover:border-[#A3A3A3]'
              }`}
            >
              All Users
            </button>
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => {
                  setSelectedRole(role.name);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 text-xs tracking-widest uppercase font-light border transition-colors ${
                  selectedRole === role.name
                    ? 'border-[#1A1A1A] dark:border-white bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]'
                    : 'border-[#F4F4F4] dark:border-[#2A2A2A] text-[#A3A3A3] hover:border-[#A3A3A3]'
                }`}
              >
                {role.name}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-12 text-[#A3A3A3]">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 border border-[#F4F4F4] dark:border-[#2A2A2A]">
            <p className="text-[#A3A3A3]">No users found</p>
          </div>
        ) : (
          <div className="border border-[#F4F4F4] dark:border-[#2A2A2A] overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#F4F4F4] dark:border-[#2A2A2A]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-[#A3A3A3] font-light">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-[#A3A3A3] font-light">
                    Roles
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-[#A3A3A3] font-light">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-widest text-[#A3A3A3] font-light">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[#F4F4F4] dark:border-[#2A2A2A] last:border-b-0 hover:bg-[#F4F4F4] dark:hover:bg-[#2A2A2A] transition-colors">
                    <td className="px-4 py-4">
                      <div className="text-sm text-[#1A1A1A] dark:text-white font-light">
                        {user.name}
                      </div>
                      <div className="text-xs text-[#A3A3A3]">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map(role => (
                            <span
                              key={role.id}
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded"
                            >
                              {role.name}
                              <button
                                onClick={() => handleRemoveRole(user.id, role.name)}
                                className="hover:text-red-600 dark:hover:text-red-400 font-bold"
                                title="Remove role"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#A3A3A3]">No roles</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#A3A3A3] font-light">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1 justify-end">
                        {roles.map(role => {
                          const hasRole = user.roles.some(r => r.name === role.name);
                          return !hasRole && (
                            <button
                              key={role.id}
                              onClick={() => handleAssignRole(user.id, role.name)}
                              className="px-2 py-1 bg-[#F4F4F4] dark:bg-[#2A2A2A] hover:bg-[#1A1A1A] hover:text-white dark:hover:bg-white dark:hover:text-[#1A1A1A] text-[#A3A3A3] text-xs rounded transition-colors"
                              title={`Add ${role.name} role`}
                            >
                              + {role.name}
                            </button>
                          );
                        })}
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
