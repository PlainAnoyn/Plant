'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function OrderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Order error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-3xl font-bold text-emerald-900 mb-4">Error Loading Order</h1>
        <p className="text-emerald-700 mb-6">
          {error.message || 'Failed to load order details. Please try again.'}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/orders">
            <Button
              variant="outline"
              size="lg"
            >
              Back to Orders
            </Button>
          </Link>
          <Button
            onClick={reset}
            variant="primary"
            size="lg"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}


