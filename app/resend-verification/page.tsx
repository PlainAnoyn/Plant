'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function ResendVerificationPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message || 'Verification email sent! Please check your inbox.');
      } else {
        setError(data.error || 'Failed to resend verification email');
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">Please Login</h2>
          <p className="text-emerald-700 mb-6">You need to be logged in to resend verification email.</p>
          <Link href="/login">
            <Button variant="primary" size="lg" className="w-full">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (user?.emailVerified) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-emerald-900 mb-2">Email Already Verified!</h2>
          <p className="text-emerald-700 mb-6">Your email address has already been verified.</p>
          <Link href="/cart">
            <Button variant="primary" size="lg" className="w-full">
              Go to Cart
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-emerald-900 mb-4">Resend Verification Email</h2>
          <p className="text-emerald-700 mb-6">
            A verification email will be sent to <strong>{user?.email}</strong>
          </p>
        </div>

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleResend}
            loading={loading}
            disabled={loading}
          >
            Resend Verification Email
          </Button>

          <Link href="/cart">
            <Button variant="outline" size="lg" className="w-full">
              Back to Cart
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


