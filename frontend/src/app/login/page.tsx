'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201';
      console.log('Attempting login to:', `${apiUrl}/api/login`);
      console.log('Credentials:', { email, password: '***' });
      
      const response = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        setError(`Server error: Expected JSON but got ${contentType}. Check console for details.`);
        return;
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('Login successful, redirecting to dashboard');
        // Redirect to dashboard or home page
        router.push('/dashboard');
      } else {
        // Show error message from server
        console.error('Login failed:', data);
        setError(data.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(`Failed to connect to the server: ${err instanceof Error ? err.message : 'Unknown error'}. Check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1A1A1A] px-4">
      <div className="max-w-md w-full py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-light tracking-tight text-[#1A1A1A] dark:text-white mb-4">
            Sign In
          </h1>
          <p className="text-sm text-[#A3A3A3] tracking-wider font-light">
            Enter your credentials
          </p>
        </div>

        {/* Form */}
        <form className="space-y-8" onSubmit={handleSubmit}>
          {error && (
            <div className="border border-[#A3A3A3] bg-[#F4F4F4] dark:bg-[#2A2A2A] dark:border-[#A3A3A3] text-[#1A1A1A] dark:text-white px-6 py-4 text-sm font-light">
              {error}
            </div>
          )}

          <div className="space-y-8">
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-widest text-[#A3A3A3] mb-3 font-light">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-0 py-3 border-0 border-b border-[#A3A3A3] bg-transparent text-[#1A1A1A] dark:text-white placeholder-[#A3A3A3] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white transition-colors font-light"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs uppercase tracking-widest text-[#A3A3A3] mb-3 font-light">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-0 py-3 border-0 border-b border-[#A3A3A3] bg-transparent text-[#1A1A1A] dark:text-white placeholder-[#A3A3A3] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white transition-colors font-light"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 border border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white hover:bg-[#F4F4F4] dark:hover:bg-[#2A2A2A] focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 text-xs tracking-widest uppercase font-light"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Test Accounts */}
        <div className="mt-16 pt-8 border-t border-[#F4F4F4] dark:border-[#2A2A2A]">
          <p className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-6 font-light">Test Accounts</p>
          <div className="space-y-3 text-xs text-[#A3A3A3] font-light leading-relaxed">
            <p><span className="text-[#1A1A1A] dark:text-white">Owner:</span> ivan@admin.local / password</p>
            <p><span className="text-[#1A1A1A] dark:text-white">Frontend:</span> elena@frontend.local / password</p>
            <p><span className="text-[#1A1A1A] dark:text-white">Backend:</span> petar@backend.local / password</p>
          </div>
        </div>
      </div>
    </div>
  );
}
