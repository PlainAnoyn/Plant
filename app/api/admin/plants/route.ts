import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Plant from '@/models/Plant';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ;

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

// Create plant (admin only)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const plant = await Plant.create(body);

    return NextResponse.json({
      success: true,
      plant: {
        _id: plant._id.toString(),
        name: plant.name,
        description: plant.description,
        price: plant.price,
        category: plant.category,
        discountPercentage: plant.discountPercentage || 0,
        imageUrl: plant.imageUrl,
        stock: plant.stock,
        isFeatured: plant.isFeatured || false,
        isFreeDelivery: plant.isFreeDelivery || false,
        careInstructions: plant.careInstructions,
        sunlight: plant.sunlight,
        water: plant.water,
        createdAt: plant.createdAt,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Admin create plant error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create plant' },
      { status: 500 }
    );
  }
}

// Get all plants with pagination (admin)
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const plants = await Plant.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Plant.countDocuments();

    return NextResponse.json({
      success: true,
      plants: plants.map((plant) => ({
        _id: plant._id.toString(),
        name: plant.name,
        description: plant.description,
        price: plant.price,
        category: plant.category,
        discountPercentage: plant.discountPercentage || 0,
        imageUrl: plant.imageUrl,
        stock: plant.stock,
        isFeatured: plant.isFeatured || false,
        isFreeDelivery: plant.isFreeDelivery || false,
        careInstructions: plant.careInstructions,
        sunlight: plant.sunlight,
        water: plant.water,
        createdAt: plant.createdAt,
        updatedAt: plant.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Admin get plants error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get plants' },
      { status: 500 }
    );
  }
}

