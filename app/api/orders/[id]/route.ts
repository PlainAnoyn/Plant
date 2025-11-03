import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Plant from '@/models/Plant';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Get order details by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();

    // Handle async params (Next.js 15+) or sync params (Next.js 14)
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.id;

    // Get user from token
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const order = await Order.findById(orderId).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order belongs to the user
    if (order.user.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }

                return NextResponse.json({
                  success: true,
                  order: {
                    _id: order._id.toString(),
                    orderItems: order.orderItems,
                    shippingAddress: order.shippingAddress,
                    paymentMethod: order.paymentMethod,
                    paymentStatus: order.paymentStatus,
                    paymentId: order.paymentId,
                    orderStatus: order.orderStatus,
                    trackingNumber: order.trackingNumber,
                    itemsPrice: order.itemsPrice,
                    shippingPrice: order.shippingPrice,
                    totalPrice: order.totalPrice,
                    isPaid: order.isPaid,
                    paidAt: order.paidAt,
                    isDelivered: order.isDelivered,
                    deliveredAt: order.deliveredAt,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt,
                  },
                });
  } catch (error: any) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get order' },
      { status: 500 }
    );
  }
}

// Cancel order
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    console.log('[API PATCH] Cancel order request received');
    await connectDB();
    console.log('[API PATCH] Database connected');

    // Handle async params (Next.js 15+) or sync params (Next.js 14)
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.id;
    console.log('[API PATCH] Order ID from params:', orderId);

    // Get user from token
    const token = request.cookies.get('token')?.value;
    console.log('[API PATCH] Token present:', !!token);

    if (!token) {
      console.log('[API PATCH] No token found, returning 401');
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      console.log('[API PATCH] Token verified, userId:', decoded.userId);
    } catch (error) {
      console.error('[API PATCH] Token verification failed:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('[API PATCH] Request body:', body);
    const { action } = body;

    if (action !== 'cancel') {
      console.log('[API PATCH] Invalid action:', action);
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    console.log('[API PATCH] Finding order with ID:', orderId);
    const order = await Order.findById(orderId);
    console.log('[API PATCH] Order found:', !!order);

    if (!order) {
      console.log('[API PATCH] Order not found in database');
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('[API PATCH] Order details:', {
      orderId: order._id.toString(),
      userId: order.user.toString(),
      requestUserId: decoded.userId,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
    });

    // Check if order belongs to the user
    if (order.user.toString() !== decoded.userId) {
      console.log('[API PATCH] User mismatch - unauthorized access');
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Check if order can be cancelled
    // Orders can only be cancelled if status is 'pending' or 'processing' (before admin confirms/ships)
    if (order.orderStatus !== 'pending' && order.orderStatus !== 'processing') {
      console.log('[API PATCH] Order cannot be cancelled, status:', order.orderStatus);
      return NextResponse.json(
        { success: false, error: `Order cannot be cancelled. Current status: ${order.orderStatus}` },
        { status: 400 }
      );
    }

    console.log('[API PATCH] Restoring stock for', order.orderItems.length, 'items');
    // Restore stock for all items in the order
    for (const item of order.orderItems) {
      await Plant.findByIdAndUpdate(item.plantId, {
        $inc: { stock: item.quantity },
      });
      console.log('[API PATCH] Restored stock for plant:', item.plantId.toString(), 'quantity:', item.quantity);
    }

    // Update order status to cancelled
    order.orderStatus = 'cancelled';
    
    // If order was paid, mark payment status as refunded (pending refund)
    if (order.isPaid && order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
      console.log('[API PATCH] Payment status updated to refunded');
    }

    await order.save();
    console.log('[API PATCH] Order saved successfully');

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      order: {
        _id: order._id.toString(),
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error: any) {
    console.error('Cancel order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel order' },
      { status: 500 }
    );
  }
}

