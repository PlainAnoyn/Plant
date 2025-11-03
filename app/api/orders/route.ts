import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Plant from '@/models/Plant';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { sendOrderConfirmationEmail } from '@/lib/email';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Create a new order
export async function POST(request: NextRequest) {
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
    const { orderItems, shippingAddress, paymentMethod } = body;

    // Validate required fields
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order items are required' },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { success: false, error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    if (!paymentMethod || !['esewa', 'khalti'].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: 'Valid payment method is required (esewa or khalti)' },
        { status: 400 }
      );
    }

    // Validate shipping address fields
    const requiredAddressFields = ['fullName', 'phone', 'email', 'address', 'city', 'country'];
    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required in shipping address` },
          { status: 400 }
        );
      }
    }

    // Validate order items and check stock
    const itemsWithDetails = [];
    let itemsPrice = 0;

    for (const item of orderItems) {
      const plant = await Plant.findById(item.plantId || item._id);
      
      if (!plant) {
        return NextResponse.json(
          { success: false, error: `Plant ${item.plantId || item._id} not found` },
          { status: 404 }
        );
      }

      if (plant.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${plant.name}. Available: ${plant.stock}, Requested: ${item.quantity}` },
          { status: 400 }
        );
      }

      const itemPrice = plant.price * item.quantity;
      itemsPrice += itemPrice;

      itemsWithDetails.push({
        plantId: plant._id,
        name: plant.name,
        price: plant.price,
        quantity: item.quantity,
        imageUrl: plant.imageUrl,
      });
    }

    // Calculate shipping price (free if total >= 50, else $5.99)
    const shippingPrice = itemsPrice >= 50 ? 0 : 5.99;
    const totalPrice = itemsPrice + shippingPrice;

    // Create order
    const order = await Order.create({
      user: decoded.userId,
      orderItems: itemsWithDetails,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      isPaid: false,
    });

    // Update stock for each plant (reserve the stock)
    for (const item of itemsWithDetails) {
      await Plant.findByIdAndUpdate(item.plantId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Get user details for email
    const user = await User.findById(decoded.userId).lean();
    
    // Send order confirmation email (non-blocking)
    if (user && user.email) {
      try {
        await sendOrderConfirmationEmail(
          user.email,
          user.name || 'Customer',
          order._id.toString(),
          itemsWithDetails.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          totalPrice,
          shippingAddress
        );
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        // Don't fail order creation if email fails
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        _id: order._id.toString(),
        orderItems: order.orderItems,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        itemsPrice: order.itemsPrice,
        shippingPrice: order.shippingPrice,
        totalPrice: order.totalPrice,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

// Get all orders for the authenticated user
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Get orders for the user
    const orders = await Order.find({ user: decoded.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Order.countDocuments({ user: decoded.userId });

    return NextResponse.json({
      success: true,
      orders: orders.map((order) => ({
        _id: order._id.toString(),
        orderItems: order.orderItems,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
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
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get orders' },
      { status: 500 }
    );
  }
}

