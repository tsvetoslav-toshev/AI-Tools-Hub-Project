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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Зареждане...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      owner: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      backend: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      frontend: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      designer: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      qa: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getRoleEmoji = (role: string) => {
    const emojis: Record<string, string> = {
      owner: '👑',
      backend: '⚙️',
      frontend: '💻',
      designer: '🎨',
      qa: '🧪',
    };
    return emojis[role] || '👤';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Full-Stack Starter Kit
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Здравей, <strong>{user.name}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Изход
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-full text-4xl mb-4">
              {getRoleEmoji(user.role)}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Добре дошъл, {user.name}!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Успешно влязохте в системата
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                Email
              </h3>
              <p className="text-lg font-medium text-blue-800 dark:text-blue-300">
                {user.email}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
              <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-2">
                Роля
              </h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                {getRoleEmoji(user.role)} {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
              <h3 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
                User ID
              </h3>
              <p className="text-lg font-medium text-green-800 dark:text-green-300">
                #{user.id}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Системна информация
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">Frontend:</span>
                <span className="font-medium text-gray-900 dark:text-white">Next.js 15.4.6</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">Backend:</span>
                <span className="font-medium text-gray-900 dark:text-white">Laravel 11</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">Database:</span>
                <span className="font-medium text-gray-900 dark:text-white">MySQL 8.0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">Cache:</span>
                <span className="font-medium text-gray-900 dark:text-white">Redis 7</span>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              🎉 <strong>Поздравления!</strong> Успешно влязохте в системата с акаунт <strong>{user.email}</strong> с роля <strong>{user.role}</strong>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
