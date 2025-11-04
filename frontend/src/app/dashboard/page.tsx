'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Redirect to login if not logged in
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1A1A1A]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border border-[#1A1A1A] dark:border-white border-t-transparent animate-spin"></div>
          <p className="mt-6 text-xs uppercase tracking-widest text-[#A3A3A3] font-light">Loading</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#1A1A1A]">
      {/* Minimalist Header */}
      <header className="border-b border-[#F4F4F4] dark:border-[#2A2A2A]">
        <div className="max-w-6xl mx-auto px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-light tracking-wide text-[#1A1A1A] dark:text-white">
              Dashboard
            </h1>
            <nav className="flex gap-4">
              <button
                onClick={() => router.push('/tools')}
                className="px-4 py-2 text-xs tracking-widest uppercase font-light text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
              >
                Explore Tools
              </button>
              <button
                onClick={() => router.push('/tools/add')}
                className="px-4 py-2 text-xs tracking-widest uppercase font-light text-[#A3A3A3] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
              >
                Submit Tool
              </button>
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 border border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white hover:bg-[#F4F4F4] dark:hover:bg-[#2A2A2A] transition-all duration-300 text-xs tracking-widest uppercase font-light"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-24">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <h2 className="text-5xl font-light tracking-tight text-[#1A1A1A] dark:text-white mb-4">
            Welcome
          </h2>
          <p className="text-lg text-[#A3A3A3] font-light tracking-wide">
            {user.name}
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-3 gap-16 mb-24">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-4 font-light">Email</p>
            <p className="text-sm text-[#1A1A1A] dark:text-white font-light">{user.email}</p>
          </div>

          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-4 font-light">Role</p>
            <p className="text-sm text-[#1A1A1A] dark:text-white font-light capitalize">{user.role}</p>
          </div>

          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-4 font-light">User ID</p>
            <p className="text-sm text-[#1A1A1A] dark:text-white font-light">#{user.id}</p>
          </div>
        </div>

        {/* System Info */}
        <div className="border-t border-[#F4F4F4] dark:border-[#2A2A2A] pt-16">
          <h3 className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-12 font-light text-center">
            System Information
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="flex justify-between items-center border-b border-[#F4F4F4] dark:border-[#2A2A2A] pb-4">
              <span className="text-xs text-[#A3A3A3] font-light tracking-wider">Frontend</span>
              <span className="text-xs text-[#1A1A1A] dark:text-white font-light">Next.js 15</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#F4F4F4] dark:border-[#2A2A2A] pb-4">
              <span className="text-xs text-[#A3A3A3] font-light tracking-wider">Backend</span>
              <span className="text-xs text-[#1A1A1A] dark:text-white font-light">Laravel 11</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#F4F4F4] dark:border-[#2A2A2A] pb-4">
              <span className="text-xs text-[#A3A3A3] font-light tracking-wider">Database</span>
              <span className="text-xs text-[#1A1A1A] dark:text-white font-light">MySQL 8.0</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#F4F4F4] dark:border-[#2A2A2A] pb-4">
              <span className="text-xs text-[#A3A3A3] font-light tracking-wider">Cache</span>
              <span className="text-xs text-[#1A1A1A] dark:text-white font-light">Redis 7</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
