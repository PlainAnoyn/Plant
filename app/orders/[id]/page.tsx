'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface OrderItem {
  plantId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface Order {
  _id: string;
  orderItems: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    province?: string;
    postalCode?: string;
    country: string;
  };
  paymentMethod: 'esewa' | 'khalti';
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  itemsPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const orderId = params.id as string;

  useEffect(() => {
    setMounted(true);
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);


  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      router.push('/login?redirect=/orders');
    }
  }, [mounted, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (mounted && isAuthenticated && orderId) {
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isAuthenticated, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.error || 'Failed to load order');
      }
    } catch (error: any) {
      console.error('Fetch order error:', error);
      setError('Failed to load order. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-cream-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
          <p className="mt-4 text-emerald-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
          <p className="mt-4 text-emerald-700">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-cream-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-emerald-900 mb-2">Order Not Found</h2>
          <p className="text-emerald-700 mb-6">{error || 'This order does not exist or you do not have permission to view it.'}</p>
          <Link href="/orders">
            <Button variant="primary" size="lg">
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold">Payment Successful!</p>
              <p className="text-sm">Your order has been confirmed and is being processed.</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <Link href="/orders">
            <Button variant="outline" size="sm" className="mb-4">
              ← Back to Orders
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-emerald-900 mb-2">
              Order Details
            </h1>
            <p className="text-emerald-700">
              Order #{order._id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          {/* Order Status */}
          <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-gray-200">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.paymentStatus)}`}>
              Payment: {order.paymentStatus.toUpperCase()}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>
              Order: {order.orderStatus.toUpperCase()}
            </span>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 bg-cream-50 rounded-lg">
                  <Link href={`/plants/${item.plantId}`} className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/plants/${item.plantId}`}>
                      <h3 className="font-semibold text-emerald-900 hover:text-emerald-700 transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-emerald-700 mt-1">Quantity: {item.quantity}</p>
                    <p className="text-sm text-emerald-700">Price: ${item.price.toFixed(2)} each</p>
                    <p className="text-lg font-semibold text-emerald-900 mt-2">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">Shipping Address</h2>
            <div className="bg-cream-50 rounded-lg p-4">
              <p className="font-semibold text-emerald-900">{order.shippingAddress.fullName}</p>
              <p className="text-emerald-700">{order.shippingAddress.address}</p>
              <p className="text-emerald-700">
                {order.shippingAddress.city}
                {order.shippingAddress.province && `, ${order.shippingAddress.province}`}
                {order.shippingAddress.postalCode && ` ${order.shippingAddress.postalCode}`}
              </p>
              <p className="text-emerald-700">{order.shippingAddress.country}</p>
              <p className="text-emerald-700 mt-2">
                <strong>Phone:</strong> {order.shippingAddress.phone}
              </p>
              <p className="text-emerald-700">
                <strong>Email:</strong> {order.shippingAddress.email}
              </p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">Payment Information</h2>
            <div className="bg-cream-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-emerald-700">Payment Method:</span>
                <span className="font-semibold text-emerald-900">
                  {order.paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'}
                </span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between">
                  <span className="text-emerald-700">Transaction ID:</span>
                  <span className="font-semibold text-emerald-900">{order.paymentId}</span>
                </div>
              )}
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-emerald-700">Paid At:</span>
                  <span className="font-semibold text-emerald-900">
                    {new Date(order.paidAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">Order Summary</h2>
            <div className="bg-cream-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-emerald-700">
                <span>Items ({order.orderItems.reduce((sum, item) => sum + item.quantity, 0)}):</span>
                <span>${order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Shipping:</span>
                <span>{order.shippingPrice === 0 ? 'Free' : `$${order.shippingPrice.toFixed(2)}`}</span>
              </div>
              <div className="border-t border-emerald-200 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-xl font-bold text-emerald-900">Total:</span>
                  <span className="text-2xl font-bold text-emerald-900">${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">Order Timeline</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className={`w-3 h-3 rounded-full mt-2 ${order.isPaid ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div>
                <p className="font-semibold text-emerald-900">Order Placed</p>
                <p className="text-sm text-emerald-700">
                  {new Date(order.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            {order.isPaid && (
              <div className="flex gap-4">
                <div className="w-3 h-3 rounded-full mt-2 bg-green-500"></div>
                <div>
                  <p className="font-semibold text-emerald-900">Payment Confirmed</p>
                  {order.paidAt && (
                    <p className="text-sm text-emerald-700">
                      {new Date(order.paidAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}
            {order.orderStatus === 'processing' && (
              <div className="flex gap-4">
                <div className="w-3 h-3 rounded-full mt-2 bg-blue-500"></div>
                <div>
                  <p className="font-semibold text-emerald-900">Order Processing</p>
                  <p className="text-sm text-emerald-700">Your order is being prepared</p>
                </div>
              </div>
            )}
            {order.orderStatus === 'shipped' && (
              <div className="flex gap-4">
                <div className="w-3 h-3 rounded-full mt-2 bg-blue-500"></div>
                <div className="flex-1">
                  <p className="font-semibold text-emerald-900">Order Shipped</p>
                  <p className="text-sm text-emerald-700">Your order is on the way</p>
                  {order.trackingNumber && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Tracking Number:</p>
                      <p className="text-lg font-mono font-bold text-blue-700">{order.trackingNumber}</p>
                      <p className="text-xs text-blue-600 mt-2">Use this number to track your shipment with the carrier</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {order.isDelivered && (
              <div className="flex gap-4">
                <div className="w-3 h-3 rounded-full mt-2 bg-green-500"></div>
                <div>
                  <p className="font-semibold text-emerald-900">Order Delivered</p>
                  {order.deliveredAt && (
                    <p className="text-sm text-emerald-700">
                      {new Date(order.deliveredAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}
            {order.orderStatus === 'cancelled' && (
              <div className="flex gap-4">
                <div className="w-3 h-3 rounded-full mt-2 bg-red-500"></div>
                <div>
                  <p className="font-semibold text-red-900">Order Cancelled</p>
                  <p className="text-sm text-red-700">This order has been cancelled</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

