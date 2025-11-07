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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Always try to parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        setError('Server returned invalid response.');
        return;
      }

      if (response.ok && data.success) {
        // Store authentication token and user data in localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Check if user needs 2FA verification
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const statusResponse = await fetch(`${apiUrl}/api/2fa/status`, {
          headers: {
            'Authorization': `Bearer ${data.token}`,
          },
          credentials: 'include', // Important: Send/receive cookies
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          
          if (statusData.verified || statusData.trusted_device) {
            // Already verified or trusted device - go to dashboard
            localStorage.setItem('2fa_verified', 'true');
            router.push('/dashboard');
            return; // IMPORTANT: Exit after routing to prevent fall-through
          } else {
            // Need 2FA verification - send code and redirect to 2FA page
            await fetch(`${apiUrl}/api/2fa/send`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${data.token}`,
              },
              credentials: 'include', // Important: Send/receive cookies
            });
            router.push('/2fa');
            return; // IMPORTANT: Exit after routing to prevent fall-through
          }
        } else {
          // If 2FA check fails, just go to dashboard (backward compatibility)
          router.push('/dashboard');
          return; // IMPORTANT: Exit after routing to prevent fall-through
        }
      } else {
        // Show error message from server
        setError(data.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError(`Failed to connect to the server: ${err instanceof Error ? err.message : 'Unknown error'}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(to top left, #3A3A3A, #1A1A1A)'
      }}
    >
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
            <p><span className="text-[#1A1A1A] dark:text-white">Admin:</span> alexandra@admin.local / password</p>
            <p><span className="text-[#1A1A1A] dark:text-white">Moderator:</span> ivan@moderator.local / password</p>
            <p><span className="text-[#1A1A1A] dark:text-white">Frontend:</span> elena@frontend.local / password</p>
            <p><span className="text-[#1A1A1A] dark:text-white">Backend:</span> petar@backend.local / password</p>
          </div>
        </div>
      </div>
    </div>
  );
}
