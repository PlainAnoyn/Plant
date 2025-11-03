import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from '@/lib/email';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to check if user is admin
async function checkAdmin(request: NextRequest): Promise<{ success: boolean; userId?: string; error?: string }> {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return { success: false, error: 'Not authenticated' };
  }

  let decoded: { userId: string };
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }

  // Check if user is admin (for now, we'll check if email contains 'admin' or you can add a role field)
  const user = await User.findById(decoded.userId).lean();
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  // Check if user is admin by role OR by email/username
  const isAdmin = user.role === 'admin' || 
                  user.email === 'admin@gmail.com' || 
                  user.username === 'admin';
  
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized - Admin access required' };
  }

  return { success: true, userId: decoded.userId };
}

// Update order status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();

    // Check admin access
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.error?.includes('Unauthorized') ? 403 : 401 }
      );
    }

    // Handle async params
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.id;

    const body = await request.json();
    const { orderStatus, trackingNumber } = body;

    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const oldStatus = order.orderStatus;

    // Update order status
    if (orderStatus && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(orderStatus)) {
      order.orderStatus = orderStatus;

      // Update related fields based on status
      if (orderStatus === 'shipped') {
        if (trackingNumber) {
          order.trackingNumber = trackingNumber;
        }
        // Send shipped email
        if (order.user && typeof order.user === 'object' && 'email' in order.user) {
          try {
            await sendOrderShippedEmail(
              order.user.email as string,
              (order.user as any).name || 'Customer',
              order._id.toString(),
              order.trackingNumber
            );
          } catch (emailError) {
            console.error('Failed to send shipped email:', emailError);
          }
        }
      } else if (orderStatus === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = new Date();
        // Send delivered email
        if (order.user && typeof order.user === 'object' && 'email' in order.user) {
          try {
            await sendOrderDeliveredEmail(
              order.user.email as string,
              (order.user as any).name || 'Customer',
              order._id.toString()
            );
          } catch (emailError) {
            console.error('Failed to send delivered email:', emailError);
          }
        }
      }

      await order.save();

      return NextResponse.json({
        success: true,
        message: `Order status updated from ${oldStatus} to ${orderStatus}`,
        order: {
          _id: order._id.toString(),
          orderStatus: order.orderStatus,
          trackingNumber: order.trackingNumber,
          isDelivered: order.isDelivered,
          deliveredAt: order.deliveredAt,
        },
      });
    }

    // Update tracking number only
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
      await order.save();

      return NextResponse.json({
        success: true,
        message: 'Tracking number updated',
        order: {
          _id: order._id.toString(),
          trackingNumber: order.trackingNumber,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request. Provide orderStatus or trackingNumber' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Admin update order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}

// Get order details (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();

    // Check admin access
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.error?.includes('Unauthorized') ? 403 : 401 }
      );
    }

    // Handle async params
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.id;

    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        _id: order._id.toString(),
        user: {
          _id: (order.user as any)._id.toString(),
          name: (order.user as any).name,
          email: (order.user as any).email,
        },
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
    console.error('Admin get order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get order' },
      { status: 500 }
    );
  }
}

