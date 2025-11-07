'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: number;
  type: string;
  message: string;
  action_url: string | null;
  read_at: string | null;
  created_at: string;
  data: Record<string, any>;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
    
    // Only fetch if user is authenticated
    if (!token) return;

    fetchUnreadCount();
    
    // Poll for new notifications every 5 seconds for real-time updates
    const interval = setInterval(fetchUnreadCount, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return; // Don't fetch if not authenticated

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const response = await fetch(`${apiUrl}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      } else if (response.status === 401) {
        // Token expired or invalid, clear it
        localStorage.removeItem('auth_token');
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const response = await fetch(`${apiUrl}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('auth_token');
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number, actionUrl: string | null) => {
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      await fetch(`${apiUrl}/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Navigate if there's an action URL
      if (actionUrl) {
        setIsOpen(false);
        router.push(actionUrl);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      await fetch(`${apiUrl}/api/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_tool_submission':
        return '📝';
      case 'tool_approved':
        return '✅';
      case 'tool_rejected':
        return '❌';
      case 'new_comment':
        return '💬';
      case 'new_reply':
        return '↩️';
      case 'new_rating':
        return '⭐';
      default:
        return '🔔';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[#F4F4F4] dark:hover:bg-[#2A2A2A] transition-colors rounded-full"
        aria-label="Notifications"
      >
        {/* Bell SVG */}
        <svg
          className={`w-6 h-6 ${unreadCount > 0 ? 'text-white' : 'text-[#A3A3A3]'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1A1A1A] border border-[#F4F4F4] dark:border-[#2A2A2A] shadow-lg z-50 max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#F4F4F4] dark:border-[#2A2A2A] flex justify-between items-center">
            <h3 className="text-sm font-medium text-[#1A1A1A] dark:text-white uppercase tracking-widest">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white transition-colors uppercase tracking-widest"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-[#A3A3A3]">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-[#A3A3A3]">
                <p>No notifications</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id, notification.action_url)}
                    className={`px-4 py-3 border-b border-[#F4F4F4] dark:border-[#2A2A2A] cursor-pointer transition-colors ${
                      notification.read_at
                        ? 'bg-white dark:bg-[#1A1A1A] hover:bg-[#F4F4F4] dark:hover:bg-[#2A2A2A]'
                        : 'bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1A1A1A] dark:text-white">
                          {notification.message}
                        </p>
                        <p className="text-xs text-[#A3A3A3] mt-1">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                      {!notification.read_at && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
