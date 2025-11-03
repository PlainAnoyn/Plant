'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Button from '@/components/ui/Button';

export default function KhaltiPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (!orderId || !amount) {
      router.push('/cart');
    }
  }, [orderId, amount, router]);

  const handlePayment = async () => {
    if (!orderId || !amount) return;

    setLoading(true);
    setError('');

    try {
      // Khalti payment integration
      // This is a placeholder - you'll need to integrate with Khalti's actual API
      // For now, we'll simulate the payment flow

      // Khalti typically uses their Web SDK or API
      // After successful payment, they send a callback
      // For demo purposes, we'll simulate success after a delay

      // In production, you would:
      // 1. Initialize Khalti SDK with your public key
      // 2. Create payment request
      // 3. Handle payment success callback
      // 4. Verify payment with Khalti API using secret key
      // 5. Update order status

      // Simulate payment verification
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify payment and update order
      const verifyResponse = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: `khalti_${Date.now()}`, // This would come from Khalti
          paymentStatus: 'success',
        }),
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        // Clear cart and redirect to success page
        clearCart();
        router.push(`/orders/${orderId}?success=true`);
      } else {
        throw new Error(verifyData.error || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (!orderId || !amount) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream-50 py-12 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💰</div>
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">Khalti Payment</h1>
          <p className="text-emerald-700">Complete your payment securely</p>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-emerald-800 font-medium">Order ID:</span>
              <span className="text-emerald-900 font-semibold">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-800 font-medium">Amount:</span>
              <span className="text-emerald-900 font-bold text-xl">Rs. {parseFloat(amount).toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is a demo payment. In production, you would integrate with Khalti's actual payment gateway.
              You'll need to:
            </p>
            <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside space-y-1">
              <li>Get Khalti merchant credentials (public key and secret key)</li>
              <li>Configure Khalti API keys in environment variables</li>
              <li>Install and integrate Khalti Web SDK</li>
              <li>Implement payment verification webhook/callback</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handlePayment}
              loading={loading}
              className="w-full"
            >
              {loading ? 'Processing Payment...' : 'Proceed with Khalti Payment'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              disabled={loading}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


