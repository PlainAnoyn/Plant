'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

interface OrderItem {
  plantId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface Order {
  _id: string;
  user: { name: string; email: string };
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

export default function AdminOrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  const orderId = params.id as string;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      const isAdmin = user?.role === 'admin';
      if (!isAdmin) {
        router.push('/');
        return;
      }
      fetchOrder();
    }
  }, [mounted, isAuthenticated, user, orderId, router]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
        setTrackingNumber(data.order.trackingNumber || '');
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

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          orderStatus: newStatus,
          trackingNumber: trackingNumber || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchOrder();
        alert('Order status updated successfully!');
      } else {
        alert(data.error || 'Failed to update order status');
      }
    } catch (error: any) {
      console.error('Update order error:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-cream-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
          <p className="mt-4 text-emerald-700">Loading...</p>
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
          <p className="text-emerald-700 mb-6">{error || 'This order does not exist.'}</p>
          <Link href="/admin">
            <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin">
          <button className="mb-6 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            ← Back to Dashboard
          </button>
        </Link>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-emerald-900 mb-2">Order Details</h1>
              <p className="text-emerald-700">Order #{order._id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="flex gap-4 items-center">
              <select
                value={order.orderStatus}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                disabled={updating}
                className="px-4 py-2 rounded-lg border border-emerald-300 font-semibold bg-white disabled:opacity-50"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Tracking Number */}
          <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
            <label className="block text-sm font-semibold text-emerald-900 mb-2">Tracking Number</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="flex-1 px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <button
                onClick={() => handleStatusUpdate(order.orderStatus)}
                disabled={updating}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {updating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-emerald-900 mb-4">Customer Information</h2>
            <div className="bg-cream-50 rounded-lg p-4">
              <p className="font-semibold text-emerald-900">{order.user.name}</p>
              <p className="text-emerald-700">{order.user.email}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-emerald-900 mb-4">Order Items</h2>
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
                  <div className="flex-1">
                    <Link href={`/plants/${item.plantId}`}>
                      <h3 className="font-semibold text-emerald-900 hover:text-emerald-700">{item.name}</h3>
                    </Link>
                    <p className="text-sm text-emerald-700">Quantity: {item.quantity}</p>
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
            <h2 className="text-xl font-bold text-emerald-900 mb-4">Shipping Address</h2>
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

          {/* Payment Info */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-emerald-900 mb-4">Payment Information</h2>
            <div className="bg-cream-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-emerald-700">Payment Method:</span>
                <span className="font-semibold text-emerald-900">
                  {order.paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700">Payment Status:</span>
                <span className={`font-semibold ${
                  order.paymentStatus === 'paid' ? 'text-green-700' :
                  order.paymentStatus === 'failed' ? 'text-red-700' :
                  'text-yellow-700'
                }`}>
                  {order.paymentStatus.toUpperCase()}
                </span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between">
                  <span className="text-emerald-700">Transaction ID:</span>
                  <span className="font-semibold text-emerald-900">{order.paymentId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-xl font-bold text-emerald-900 mb-4">Order Summary</h2>
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
      </div>
    </div>
  );
}

