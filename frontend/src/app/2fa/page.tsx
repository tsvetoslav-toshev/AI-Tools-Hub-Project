'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function TwoFactorPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [trustDevice, setTrustDevice] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
    }

    // Focus first input on mount
    inputRefs.current[0]?.focus();

    // Start cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [router, resendCooldown]);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      // Auto-submit pasted code
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const verificationCode = codeToVerify || code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const response = await fetch(`${apiUrl}/api/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // Important: Send/receive cookies
        body: JSON.stringify({
          code: verificationCode,
          trust_device: trustDevice,
        }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        // Store 2FA verification status
        localStorage.setItem('2fa_verified', 'true');
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid verification code. Please try again.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      setError('Failed to verify code. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const response = await fetch(`${apiUrl}/api/2fa/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResendCooldown(60); // 60 second cooldown
        // Show success message briefly
        setError(''); // Clear any errors
      } else {
        setError(data.message || 'Failed to resend code. Please try again.');
      }
    } catch (err) {
      console.error('Resend code error:', err);
      setError('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
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
            Two-Factor Authentication
          </h1>
          <p className="text-sm text-[#A3A3A3] tracking-wider font-light">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* Code Input */}
        <div className="space-y-8">
          {error && (
            <div className="border border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500 text-red-600 dark:text-red-400 px-6 py-4 text-sm font-light">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-3">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={loading}
                className="w-12 h-14 text-center text-2xl font-light border-b-2 border-[#A3A3A3] bg-transparent text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white transition-colors disabled:opacity-50"
              />
            ))}
          </div>

          {/* Trust Device Checkbox */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <input
              type="checkbox"
              id="trustDevice"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="w-4 h-4 border border-[#A3A3A3] rounded bg-transparent focus:ring-0 focus:ring-offset-0"
            />
            <label htmlFor="trustDevice" className="text-sm text-[#A3A3A3] font-light cursor-pointer">
              Trust this device for 30 days
            </label>
          </div>

          {/* Verify Button */}
          <div className="pt-8">
            <button
              onClick={() => handleVerify()}
              disabled={loading || code.some(digit => digit === '')}
              className="w-full py-4 border border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white hover:bg-[#F4F4F4] dark:hover:bg-[#2A2A2A] focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 text-xs tracking-widest uppercase font-light"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>

          {/* Resend Code */}
          <div className="text-center pt-4">
            {resendCooldown > 0 ? (
              <p className="text-xs text-[#A3A3A3] font-light">
                Resend code in {resendCooldown}s
              </p>
            ) : (
              <button
                onClick={handleResendCode}
                disabled={resending}
                className="text-xs text-[#1A1A1A] dark:text-white underline hover:no-underline font-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Sending...' : "Didn't receive code? Resend"}
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-16 pt-8 border-t border-[#F4F4F4] dark:border-[#2A2A2A]">
          <p className="text-xs text-[#A3A3A3] font-light text-center leading-relaxed">
            Check your email inbox for the verification code. 
            <br />
            The code expires in 10 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
