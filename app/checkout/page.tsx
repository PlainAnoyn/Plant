'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, getTotalPrice } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Shipping address form state
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Nepal',
  });

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti'>('esewa');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [mounted, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

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

  if (!isAuthenticated || cart.length === 0) {
    if (cart.length === 0) {
      router.push('/cart');
    }
    return null;
  }

  const totalPrice = getTotalPrice();
  const shippingPrice = totalPrice >= 50 ? 0 : 5.99;
  const finalTotal = totalPrice + shippingPrice;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.email || 
        !shippingAddress.address || !shippingAddress.city || !shippingAddress.country) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderItems: cart.map((item) => ({
            plantId: item._id,
            quantity: item.quantity,
          })),
          shippingAddress,
          paymentMethod,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const order = orderData.order;

      // Redirect to payment page
      if (paymentMethod === 'esewa') {
        // eSewa payment integration will be handled here
        // For now, we'll create a payment page
        router.push(`/payment/esewa?orderId=${order._id}&amount=${order.totalPrice}`);
      } else if (paymentMethod === 'khalti') {
        // Khalti payment integration will be handled here
        router.push(`/payment/khalti?orderId=${order._id}&amount=${order.totalPrice}`);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setError(error.message || 'Failed to process checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-emerald-900 mb-6">Shipping Address</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-emerald-800 mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-emerald-800 mb-2">
                      Phone Number *
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                      placeholder="98XXXXXXXX"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-emerald-800 mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={shippingAddress.email}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-emerald-800 mb-2">
                      Street Address *
                    </label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      value={shippingAddress.address}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                      placeholder="House number, street name"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-emerald-800 mb-2">
                      City *
                    </label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="province" className="block text-sm font-medium text-emerald-800 mb-2">
                      Province
                    </label>
                    <Input
                      id="province"
                      name="province"
                      type="text"
                      value={shippingAddress.province}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-emerald-800 mb-2">
                      Postal Code
                    </label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-emerald-800 mb-2">
                      Country *
                    </label>
                    <Input
                      id="country"
                      name="country"
                      type="text"
                      value={shippingAddress.country}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-emerald-900 mb-6">Payment Method</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center p-4 border-2 border-emerald-200 rounded-lg cursor-pointer hover:border-emerald-400 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="esewa"
                      checked={paymentMethod === 'esewa'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'esewa' | 'khalti')}
                      className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="ml-4 flex-1">
                      <div className="font-semibold text-emerald-900">eSewa</div>
                      <div className="text-sm text-emerald-700">Pay securely with eSewa</div>
                    </div>
                    <div className="ml-4 text-3xl">💳</div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-emerald-200 rounded-lg cursor-pointer hover:border-emerald-400 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="khalti"
                      checked={paymentMethod === 'khalti'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'esewa' | 'khalti')}
                      className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="ml-4 flex-1">
                      <div className="font-semibold text-emerald-900">Khalti</div>
                      <div className="text-sm text-emerald-700">Pay securely with Khalti</div>
                    </div>
                    <div className="ml-4 text-3xl">💰</div>
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Back to Cart
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="flex-1"
                >
                  {loading ? 'Processing...' : `Proceed to ${paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'} Payment`}
                </Button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-emerald-900 mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item._id} className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-emerald-900 truncate">{item.name}</h3>
                      <p className="text-sm text-emerald-700">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-emerald-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shippingPrice === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shippingPrice === 0 ? 'Free' : `$${shippingPrice.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-xl font-bold text-emerald-900">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
                {shippingPrice > 0 && (
                  <p className="text-sm text-emerald-700">
                    Add ${(50 - totalPrice).toFixed(2)} more for free shipping!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


