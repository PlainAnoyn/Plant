import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Plant from '@/models/Plant';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

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

// Update plant (admin only)
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
    const plantId = resolvedParams.id;

    const body = await request.json();
    const updatedPlant = await Plant.findByIdAndUpdate(
      plantId,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedPlant) {
      return NextResponse.json(
        { success: false, error: 'Plant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      plant: {
        _id: updatedPlant._id.toString(),
        name: updatedPlant.name,
        description: updatedPlant.description,
        price: updatedPlant.price,
        category: updatedPlant.category,
        imageUrl: updatedPlant.imageUrl,
        stock: updatedPlant.stock,
        careInstructions: updatedPlant.careInstructions,
        sunlight: updatedPlant.sunlight,
        water: updatedPlant.water,
        updatedAt: updatedPlant.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Admin update plant error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update plant' },
      { status: 500 }
    );
  }
}

// Delete plant (admin only)
export async function DELETE(
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
    const plantId = resolvedParams.id;

    const deletedPlant = await Plant.findByIdAndDelete(plantId);

    if (!deletedPlant) {
      return NextResponse.json(
        { success: false, error: 'Plant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Plant deleted successfully',
    });
  } catch (error: any) {
    console.error('Admin delete plant error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete plant' },
      { status: 500 }
    );
  }
}

