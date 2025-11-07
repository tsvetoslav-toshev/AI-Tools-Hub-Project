'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationBell from './NotificationBell';

interface NavbarProps {
  currentPage?: 'dashboard' | 'explore-tools' | 'submit-tool';
}

export default function Navbar({ currentPage }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setUserRole(userData.role);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Auto-detect current page from pathname if not explicitly provided
  const detectCurrentPage = (): 'dashboard' | 'explore-tools' | 'submit-tool' | null => {
    if (currentPage) return currentPage;
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname?.startsWith('/tools/add')) return 'submit-tool';
    if (pathname?.startsWith('/tools')) return 'explore-tools';
    return null;
  };

  const activePage = detectCurrentPage();
  const showAdminPanel = userRole === 'owner' || userRole === 'admin' || userRole === 'moderator';

  return (
    <header 
      className="border-b border-[#F4F4F4] dark:border-[#2A2A2A] fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'linear-gradient(to top left, #3A3A3A, #1A1A1A)'
      }}
    >
      <div className="max-w-6xl mx-auto px-8 py-6 flex justify-between items-center">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/dashboard"
            className={`px-4 py-2 text-xs tracking-widest uppercase font-light transition-colors ${
              activePage === 'dashboard'
                ? 'text-[#1A1A1A] dark:text-white'
                : 'text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white'
            }`}
          >
            Dashboard
          </Link>
          <nav className="flex gap-4">
            <Link
              href="/tools"
              className={`px-4 py-2 text-xs tracking-widest uppercase font-light transition-colors ${
                activePage === 'explore-tools'
                  ? 'text-[#1A1A1A] dark:text-white'
                  : 'text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white'
              }`}
            >
              Explore Tools
            </Link>
            <Link
              href="/tools/add"
              className={`px-4 py-2 text-xs tracking-widest uppercase font-light transition-colors ${
                activePage === 'submit-tool'
                  ? 'text-[#1A1A1A] dark:text-white'
                  : 'text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white'
              }`}
            >
              Submit Tool
            </Link>
            {showAdminPanel && (
              <Link
                href="/admin"
                className="px-4 py-2 text-xs tracking-widest uppercase font-light text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
              >
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        {/* Desktop Right Side: NotificationBell + Sign Out */}
        <div className="hidden md:flex items-center gap-4">
          <NotificationBell />
          <button
            onClick={handleLogout}
            className="px-6 py-2 border border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white hover:bg-[#F4F4F4] dark:hover:bg-[#2A2A2A] transition-all duration-300 text-xs tracking-widest uppercase font-light"
          >
            Sign Out
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-between w-full">
          <span className="text-xs tracking-widest uppercase font-light text-[#1A1A1A] dark:text-white">
            {activePage === 'dashboard' && 'Dashboard'}
            {activePage === 'explore-tools' && 'Explore Tools'}
            {activePage === 'submit-tool' && 'Submit Tool'}
          </span>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1A1A1A] dark:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#F4F4F4] dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A]">
          <nav className="flex flex-col p-4 space-y-2">
            <Link
              href="/dashboard"
              className={`px-4 py-3 text-xs tracking-widest uppercase font-light transition-colors ${
                activePage === 'dashboard'
                  ? 'text-[#1A1A1A] dark:text-white bg-[#F4F4F4] dark:bg-[#2A2A2A]'
                  : 'text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/tools"
              className={`px-4 py-3 text-xs tracking-widest uppercase font-light transition-colors ${
                activePage === 'explore-tools'
                  ? 'text-[#1A1A1A] dark:text-white bg-[#F4F4F4] dark:bg-[#2A2A2A]'
                  : 'text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore Tools
            </Link>
            <Link
              href="/tools/add"
              className={`px-4 py-3 text-xs tracking-widest uppercase font-light transition-colors ${
                activePage === 'submit-tool'
                  ? 'text-[#1A1A1A] dark:text-white bg-[#F4F4F4] dark:bg-[#2A2A2A]'
                  : 'text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Submit Tool
            </Link>
            {showAdminPanel && (
              <Link
                href="/admin"
                className="px-4 py-3 text-xs tracking-widest uppercase font-light text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="mt-4 px-6 py-3 border border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white hover:bg-[#F4F4F4] dark:hover:bg-[#2A2A2A] transition-all duration-300 text-xs tracking-widest uppercase font-light text-center"
            >
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
