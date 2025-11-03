'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Stats {
  users: { 
    total: number;
    growth?: Array<{ month: string; users: number }>;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
  products: { 
    total: number;
    growth?: Array<{ month: string; products: number }>;
  };
  revenue: { 
    total: number;
    salesData?: Array<{ month: string; revenue: number; orders: number }>;
  };
  recentOrders: Array<{
    _id: string;
    user: { name: string; email: string };
    totalPrice: number;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
  }>;
}

interface Order {
  _id: string;
  user: { name: string; email: string };
  totalPrice: number;
  orderStatus: string;
  paymentStatus: string;
  trackingNumber?: string;
  createdAt: string;
}

interface Plant {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  username?: string;
  role: 'user' | 'moderator' | 'admin';
  emailVerified: boolean;
  profilePicture?: string;
  isBlacklisted?: boolean;
  createdAt: string;
}

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  plant: {
    _id: string;
    name: string;
    imageUrl: string;
  };
  rating: number;
  title?: string;
  comment: string;
  helpful: number;
  verifiedPurchase: boolean;
  replies: Array<{
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
    comment: string;
    createdAt: string;
  }>;
  reactions: Array<{
    _id: string;
    user: {
      _id: string;
      name: string;
      role: string;
    };
    type: 'like' | 'dislike' | 'love' | 'angry';
    createdAt: string;
  }>;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [reviewsFilter, setReviewsFilter] = useState<'all' | 'blocked' | 'active'>('all');
  
  // Get initial tab from URL params
  const initialTab = (searchParams?.get('tab') as 'overview' | 'orders' | 'plants' | 'users' | 'reviews') || 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'plants' | 'users' | 'reviews'>(initialTab);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update tab when URL param changes
  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && ['overview', 'orders', 'plants', 'users', 'reviews'].includes(tab)) {
      setActiveTab(tab as 'overview' | 'orders' | 'plants' | 'users' | 'reviews');
    }
  }, [searchParams]);

  useEffect(() => {
    if (mounted && !authLoading && isAuthenticated) {
      // Refresh user data to ensure role is up to date
      const checkAdminAccess = async () => {
        try {
          const response = await fetch('/api/auth/me');
          const data = await response.json();
          
          if (data.success && data.user) {
            // Check if user is admin by role OR by email/username
            const isAdmin = data.user.role === 'admin' || 
                           data.user.email === 'admin@gmail.com' || 
                           data.user.username === 'admin';
            if (!isAdmin) {
              router.push('/');
              return;
            }
            fetchData();
          } else {
            router.push('/login?redirect=/admin');
          }
        } catch (error) {
          console.error('Error checking admin access:', error);
          router.push('/login?redirect=/admin');
        }
      };
      
      checkAdminAccess();
    } else if (mounted && !authLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin');
    }
  }, [mounted, authLoading, isAuthenticated, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats');
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.stats);
      } else {
        throw new Error(statsData.error || 'Failed to load stats');
      }

      // Fetch orders
      const ordersResponse = await fetch('/api/admin/orders');
      const ordersData = await ordersResponse.json();
      if (ordersData.success) {
        setOrders(ordersData.orders);
      }

      // Fetch plants
      const plantsResponse = await fetch('/api/admin/plants');
      const plantsData = await plantsResponse.json();
      if (plantsData.success) {
        setPlants(plantsData.plants);
      }

      // Fetch users
      const usersResponse = await fetch('/api/admin/users');
      const usersData = await usersResponse.json();
      if (usersData.success) {
        setUsers(usersData.users);
      }

      // Fetch reviews if on reviews tab
      if (activeTab === 'reviews') {
        fetchReviews();
      }
    } catch (error: any) {
      console.error('Admin dashboard error:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      console.log('Fetching reviews:', { page: reviewsPage, filter: reviewsFilter });
      const response = await fetch(`/api/admin/reviews?page=${reviewsPage}&limit=20&filter=${reviewsFilter}`, {
        credentials: 'include',
      });
      const data = await response.json();
      console.log('Fetch reviews response:', data);
      if (data.success) {
        setReviews(data.reviews);
        setReviewsTotalPages(data.pagination.pages);
      } else {
        console.error('Fetch reviews failed:', data.error);
      }
    } catch (error: any) {
      console.error('Fetch reviews error:', error);
      alert('Failed to fetch reviews. Please try again.');
    }
  };

  // Update review (react, reply, block, delete)
  const updateReview = async (reviewId: string, action: string, data?: any) => {
    try {
      console.log('Updating review:', { reviewId, action, data });
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action, ...data }),
      });

      const result = await response.json();
      console.log('Update review response:', result);
      
      if (result.success) {
        await fetchReviews();
        alert('Review updated successfully!');
      } else {
        console.error('Update review failed:', result.error);
        alert(result.error || 'Failed to update review');
      }
    } catch (error: any) {
      console.error('Update review error:', error);
      alert('Failed to update review. Please try again.');
    }
  };

  // Delete review
  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting review:', reviewId);
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      console.log('Delete review response:', data);
      
      if (data.success) {
        await fetchReviews();
        alert('Review deleted successfully!');
      } else {
        console.error('Delete review failed:', data.error);
        alert(data.error || 'Failed to delete review');
      }
    } catch (error: any) {
      console.error('Delete review error:', error);
      alert('Failed to delete review. Please try again.');
    }
  };

  // Update user blacklist status
  const updateUserBlacklist = async (userId: string, isBlacklisted: boolean, reason?: string) => {
    try {
      console.log('Updating user blacklist:', { userId, isBlacklisted, reason });
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isBlacklisted, blacklistReason: reason }),
      });

      const data = await response.json();
      console.log('Update user blacklist response:', data);
      
      if (data.success) {
        await fetchData();
        alert(`User ${isBlacklisted ? 'blacklisted' : 'unblacklisted'} successfully!`);
      } else {
        console.error('Update user blacklist failed:', data.error);
        alert(data.error || 'Failed to update user');
      }
    } catch (error: any) {
      console.error('Update user blacklist error:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  // Fetch reviews when tab changes to reviews
  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, reviewsPage, reviewsFilter]);

  const updateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          orderStatus: status,
          trackingNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchData(); // Refresh data
        alert('Order status updated successfully!');
      } else {
        alert(data.error || 'Failed to update order status');
      }
    } catch (error: any) {
      console.error('Update order error:', error);
      alert('Failed to update order status. Please try again.');
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

  // Double-check admin access (will be handled by useEffect above, but add this as fallback)
  const isAdmin = user && (user.role === 'admin' || user.email === 'admin@gmail.com' || user.username === 'admin');
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-cream-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-emerald-900 mb-2">Access Denied</h2>
          <p className="text-emerald-700 mb-6">You don't have permission to access this page.</p>
          <p className="text-sm text-emerald-600 mb-4">Current role: {user.role || 'none'}</p>
          <Link href="/">
            <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              Go Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
          <p className="mt-4 text-emerald-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-emerald-900 mb-2">Error</h2>
          <p className="text-emerald-700 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50" id="admin-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">Admin Dashboard</h1>
          <p className="text-emerald-700">Manage your store, orders, and products</p>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-700 text-sm font-medium mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-emerald-900">{stats.users.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-700 text-sm font-medium mb-1">Total Orders</p>
                    <p className="text-3xl font-bold text-emerald-900">{stats.orders.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-700 text-sm font-medium mb-1">Total Products</p>
                    <p className="text-3xl font-bold text-emerald-900">{stats.products.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-700 text-sm font-medium mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-emerald-900">${stats.revenue.total.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-md p-4 text-center">
                <p className="text-yellow-600 text-2xl font-bold">{stats.orders.pending}</p>
                <p className="text-sm text-emerald-700">Pending Orders</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 text-center">
                <p className="text-blue-600 text-2xl font-bold">{stats.orders.processing}</p>
                <p className="text-sm text-emerald-700">Processing</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 text-center">
                <p className="text-indigo-600 text-2xl font-bold">{stats.orders.shipped}</p>
                <p className="text-sm text-emerald-700">Shipped</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 text-center">
                <p className="text-green-600 text-2xl font-bold">{stats.orders.delivered}</p>
                <p className="text-sm text-emerald-700">Delivered</p>
              </div>
            </div>

            {/* Business Metrics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Graph */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-emerald-900 mb-4">Sales Revenue</h3>
                {stats.revenue.salesData && stats.revenue.salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.revenue.salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#065f46"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#065f46"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                        contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', r: 4 }}
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-emerald-700">
                    <p>No sales data available</p>
                  </div>
                )}
              </div>

              {/* Users Growth Graph */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-emerald-900 mb-4">User Growth</h3>
                {stats.users.growth && stats.users.growth.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.users.growth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#065f46"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#065f46"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        formatter={(value: number) => [value, 'New Users']}
                        contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="users" 
                        fill="#10b981" 
                        radius={[8, 8, 0, 0]}
                        name="Users"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-emerald-700">
                    <p>No user growth data available</p>
                  </div>
                )}
              </div>

              {/* Products Growth Graph */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-emerald-900 mb-4">Product Growth</h3>
                {stats.products.growth && stats.products.growth.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.products.growth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#065f46"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#065f46"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        formatter={(value: number) => [value, 'Products']}
                        contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="products" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', r: 4 }}
                        name="Products"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-emerald-700">
                    <p>No product growth data available</p>
                  </div>
                )}
              </div>

              {/* Sales Orders Graph */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-emerald-900 mb-4">Orders Over Time</h3>
                {stats.revenue.salesData && stats.revenue.salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.revenue.salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#065f46"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#065f46"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        formatter={(value: number) => [value, 'Orders']}
                        contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="orders" 
                        fill="#3b82f6" 
                        radius={[8, 8, 0, 0]}
                        name="Orders"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-emerald-700">
                    <p>No order data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-emerald-200">
                      <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Order ID</th>
                      <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Customer</th>
                      <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order._id} className="border-b border-emerald-100 hover:bg-emerald-50">
                        <td className="py-3 px-4">
                          <Link href={`/admin/orders/${order._id}`} className="text-emerald-600 hover:text-emerald-800 font-mono text-sm">
                            #{order._id.slice(-8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-emerald-900">{order.user.name}</p>
                          <p className="text-sm text-emerald-700">{order.user.email}</p>
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-900">${order.totalPrice.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                            order.orderStatus === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                            order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.orderStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-emerald-700">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/admin/orders/${order._id}`}>
                            <button className="text-emerald-600 hover:text-emerald-800 text-sm font-semibold">
                              View
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">All Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-emerald-200">
                    <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Order ID</th>
                    <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Tracking</th>
                    <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-emerald-100 hover:bg-emerald-50">
                      <td className="py-3 px-4">
                        <Link href={`/admin/orders/${order._id}`} className="text-emerald-600 hover:text-emerald-800 font-mono text-sm">
                          #{order._id.slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-emerald-900">{order.user.name}</p>
                        <p className="text-sm text-emerald-700">{order.user.email}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-900">${order.totalPrice.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value, order.trackingNumber)}
                          className="px-3 py-1 rounded-lg border border-emerald-300 text-sm font-semibold bg-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {order.trackingNumber ? (
                          <span className="font-mono text-sm text-emerald-700">{order.trackingNumber}</span>
                        ) : (
                          <input
                            type="text"
                            placeholder="Add tracking"
                            onBlur={(e) => {
                              if (e.target.value) {
                                updateOrderStatus(order._id, order.orderStatus, e.target.value);
                              }
                            }}
                            className="px-2 py-1 text-sm border border-emerald-300 rounded w-32"
                          />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/admin/orders/${order._id}`}>
                          <button className="text-emerald-600 hover:text-emerald-800 text-sm font-semibold">
                            View Details
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Plants Tab */}
        {activeTab === 'plants' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-emerald-900">All Products</h2>
              <Link href="/admin/plants/new">
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold">
                  + Add Product
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plants.map((plant) => (
                <div key={plant._id} className="border border-emerald-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={plant.imageUrl}
                      alt={plant.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <h3 className="font-semibold text-emerald-900 mb-2">{plant.name}</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-emerald-700 text-sm">${plant.price.toFixed(2)}</p>
                      <p className="text-emerald-700 text-sm">Stock: {plant.stock}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/plants/${plant._id}`}>
                        <button className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200">
                          Edit
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">All Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-emerald-200">
                    <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Username</th>
                    <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Email Verified</th>
                    <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Created</th>
                    <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem._id} className="border-b border-emerald-100 hover:bg-emerald-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {userItem.profilePicture ? (
                            <Image
                              src={userItem.profilePicture}
                              alt={userItem.name}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
                              {userItem.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-semibold text-emerald-900">{userItem.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-emerald-700">{userItem.email}</td>
                      <td className="py-3 px-4 text-emerald-700">{userItem.username || '-'}</td>
                      <td className="py-3 px-4">
                        <select
                          value={userItem.role}
                          onChange={async (e) => {
                            try {
                              const response = await fetch(`/api/admin/users/${userItem._id}`, {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                credentials: 'include',
                                body: JSON.stringify({ role: e.target.value }),
                              });

                              const data = await response.json();

                              if (data.success) {
                                await fetchData(); // Refresh data
                                alert('User role updated successfully!');
                              } else {
                                alert(data.error || 'Failed to update user role');
                              }
                            } catch (error: any) {
                              console.error('Update user role error:', error);
                              alert('Failed to update user role. Please try again.');
                            }
                          }}
                          className="px-3 py-1 rounded-lg border border-emerald-300 text-sm font-semibold bg-white"
                        >
                          <option value="user">User</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          userItem.emailVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {userItem.emailVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-emerald-700">
                        {new Date(userItem.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {userItem.isBlacklisted ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Unblacklist button clicked for user:', userItem._id);
                                if (confirm(`Unblacklist user ${userItem.name}?`)) {
                                  updateUserBlacklist(userItem._id, false);
                                }
                              }}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700"
                            >
                              Unblacklist
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Blacklist button clicked for user:', userItem._id);
                                const reason = prompt(`Enter reason for blacklisting ${userItem.name}:`);
                                if (reason !== null) {
                                  updateUserBlacklist(userItem._id, true, reason);
                                }
                              }}
                              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm font-semibold hover:bg-yellow-700"
                            >
                              Blacklist
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Delete user button clicked for user:', userItem._id);
                              if (confirm(`Are you sure you want to delete user ${userItem.name}? This action cannot be undone.`)) {
                                try {
                                  const response = await fetch(`/api/admin/users/${userItem._id}`, {
                                    method: 'DELETE',
                                    credentials: 'include',
                                  });

                                  const data = await response.json();

                                  if (data.success) {
                                    await fetchData(); // Refresh data
                                    alert('User deleted successfully!');
                                  } else {
                                    alert(data.error || 'Failed to delete user');
                                  }
                                } catch (error: any) {
                                  console.error('Delete user error:', error);
                                  alert('Failed to delete user. Please try again.');
                                }
                              }
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                        {userItem.isBlacklisted && (
                          <span className="block mt-1 text-xs text-red-600 font-semibold">
                            Blacklisted
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-emerald-900">All Reviews</h2>
              <div className="flex gap-2">
                <select
                  value={reviewsFilter}
                  onChange={(e) => {
                    setReviewsFilter(e.target.value as 'all' | 'blocked' | 'active');
                    setReviewsPage(1);
                  }}
                  className="px-3 py-2 rounded-lg border border-emerald-300 text-sm font-semibold bg-white"
                >
                  <option value="all">All Reviews</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              {reviews.map((review: Review) => (
                <div
                  key={review._id}
                  className={`border rounded-lg p-4 ${review.isBlocked ? 'bg-red-50 border-red-200' : 'bg-white border-emerald-200'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      {review.user.profilePicture ? (
                        <Image
                          src={review.user.profilePicture}
                          alt={review.user.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold">
                          {review.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-emerald-900">{review.user.name}</p>
                        <p className="text-sm text-emerald-700">{review.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {review.isBlocked && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                          Blocked
                        </span>
                      )}
                      <span className="text-yellow-500">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-emerald-700 mb-1">
                      Product: <Link href={`/plants/${review.plant._id}`} className="font-semibold hover:underline">{review.plant.name}</Link>
                    </p>
                    {review.title && (
                      <p className="font-semibold text-emerald-900 mb-2">{review.title}</p>
                    )}
                    <p className="text-emerald-900">{review.comment}</p>
                  </div>

                  {/* Reactions */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-emerald-700">Reactions:</span>
                    {review.reactions && review.reactions.length > 0 ? (
                      <div className="flex gap-2">
                        {review.reactions.map((reaction, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateReview(review._id, 'react', { type: reaction.type });
                            }}
                            className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold"
                            title={reaction.user.name}
                          >
                            {reaction.type === 'like' && '👍'}
                            {reaction.type === 'dislike' && '👎'}
                            {reaction.type === 'love' && '❤️'}
                            {reaction.type === 'angry' && '😠'}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-emerald-500">None</span>
                    )}
                    <div className="flex gap-1 ml-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const type = prompt('Enter reaction type (like, dislike, love, angry):');
                          if (type && ['like', 'dislike', 'love', 'angry'].includes(type)) {
                            updateReview(review._id, 'react', { type });
                          }
                        }}
                        className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold hover:bg-emerald-200"
                      >
                        + React
                      </button>
                    </div>
                  </div>

                  {/* Replies */}
                  <div className="mb-3">
                    {review.replies && review.replies.length > 0 && (
                      <div className="bg-emerald-50 rounded-lg p-3 space-y-2">
                        {review.replies.map((reply, idx) => (
                          <div key={idx} className="border-l-2 border-emerald-500 pl-3">
                            <p className="text-sm font-semibold text-emerald-900">{reply.user.name} ({reply.user.role}):</p>
                            <p className="text-sm text-emerald-700">{reply.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const reply = prompt('Enter your reply:');
                        if (reply && reply.trim()) {
                          updateReview(review._id, 'reply', { comment: reply.trim() });
                        }
                      }}
                      className="mt-2 px-3 py-1 bg-emerald-600 text-white rounded text-sm font-semibold hover:bg-emerald-700"
                    >
                      + Reply
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-emerald-200">
                    {review.isBlocked ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Unblock button clicked for review:', review._id);
                          updateReview(review._id, 'unblock');
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700"
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Block button clicked for review:', review._id);
                          updateReview(review._id, 'block');
                        }}
                        className="px-3 py-1 bg-yellow-600 text-white rounded text-sm font-semibold hover:bg-yellow-700"
                      >
                        Block
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Delete button clicked for review:', review._id);
                        deleteReview(review._id);
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-emerald-700">No reviews found</p>
                </div>
              )}
              {reviewsTotalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => setReviewsPage(Math.max(1, reviewsPage - 1))}
                    disabled={reviewsPage === 1}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-emerald-700">
                    Page {reviewsPage} of {reviewsTotalPages}
                  </span>
                  <button
                    onClick={() => setReviewsPage(Math.min(reviewsTotalPages, reviewsPage + 1))}
                    disabled={reviewsPage === reviewsTotalPages}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

