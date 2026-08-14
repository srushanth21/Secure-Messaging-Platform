'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import Spinner from '@/components/ui/Spinner';

export default function VerifyOTPPage() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { verifyOTP } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);
  const router = useRouter();

  useEffect(() => {
    if (!username) {
      router.replace('/auth');
    }
  }, [username, router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit
    if (value && index === 5 && newOtp.every(v => v !== '')) {
      submitOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submitOTP = async (code: string) => {
    setIsLoading(true);
    try {
      await verifyOTP(username, code);
      router.push('/auth/profile');
    } catch (err: any) {
      addToast(err.response?.data?.detail || 'Verification failed', 'error');
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    addToast('Verification code resent', 'success');
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-signal-border text-center">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-signal-text-primary mb-2">Verification</h2>
        <p className="text-signal-text-secondary text-sm">
          Enter the verification code sent to<br />
          <span className="font-medium text-signal-text-primary">{username}</span>
        </p>
        <p className="text-xs text-signal-text-secondary mt-2">Hint: 123456</p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-14 text-signal-text-primary text-center text-xl font-semibold border border-signal-border rounded-lg focus:border-signal-blue focus:ring-1 focus:ring-signal-blue outline-none transition-colors"
          />
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-2">
          <Spinner size="md" />
        </div>
      ) : (
        <button
          onClick={handleResend}
          className="text-signal-blue text-sm font-medium hover:underline transition-all"
        >
          Resend code
        </button>
      )}
    </div>
  );
}
