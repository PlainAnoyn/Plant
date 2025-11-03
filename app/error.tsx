'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-3xl font-bold text-emerald-900 mb-4">Something went wrong!</h1>
        <p className="text-emerald-700 mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            size="lg"
          >
            Go Home
          </Button>
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


