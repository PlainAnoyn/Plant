import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Verify payment and update order status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

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

    const body = await request.json();
    const { paymentId, paymentStatus } = body;

    const order = await Order.findById(params.id);

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

    // Update payment information
    order.paymentId = paymentId || order.paymentId;
    
    if (paymentStatus === 'success' || paymentStatus === 'paid') {
      order.paymentStatus = 'paid';
      order.isPaid = true;
      order.paidAt = new Date();
      order.orderStatus = 'processing';
    } else if (paymentStatus === 'failed') {
      order.paymentStatus = 'failed';
    }

    await order.save();

    return NextResponse.json({
      success: true,
      order: {
        _id: order._id.toString(),
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
      },
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}


