import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';
import Plant from '@/models/Plant';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Get user's wishlist
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

    // Get or create wishlist
    let wishlist = await Wishlist.findOne({ user: decoded.userId }).lean();

    if (!wishlist) {
      // Create empty wishlist
      wishlist = await Wishlist.create({
        user: decoded.userId,
        items: [],
      });
    }

    // Get plant details for wishlist items
    const plantIds = wishlist.items.map((item: any) => item.plantId);
    const plants = await Plant.find({ _id: { $in: plantIds } }).lean();

    // Map plants to wishlist items
    const wishlistItems = wishlist.items.map((item: any) => {
      const plant = plants.find((p: any) => p._id.toString() === item.plantId.toString());
      return {
        plantId: item.plantId.toString(),
        addedAt: item.addedAt,
        plant: plant ? {
          _id: plant._id.toString(),
          name: plant.name,
          price: plant.price,
          imageUrl: plant.imageUrl,
          category: plant.category,
          stock: plant.stock,
        } : null,
      };
    }).filter((item: any) => item.plant !== null); // Remove items with deleted plants

    return NextResponse.json({
      success: true,
      wishlist: {
        _id: wishlist._id.toString(),
        items: wishlistItems,
        createdAt: wishlist.createdAt,
        updatedAt: wishlist.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Get wishlist error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get wishlist' },
      { status: 500 }
    );
  }
}

// Add item to wishlist
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
    const { plantId } = body;

    if (!plantId) {
      return NextResponse.json(
        { success: false, error: 'Plant ID is required' },
        { status: 400 }
      );
    }

    // Check if plant exists
    const plant = await Plant.findById(plantId);
    if (!plant) {
      return NextResponse.json(
        { success: false, error: 'Plant not found' },
        { status: 404 }
      );
    }

    // Get or create wishlist
    let wishlist = await Wishlist.findOne({ user: decoded.userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: decoded.userId,
        items: [],
      });
    }

    // Check if item already exists
    const existingItem = wishlist.items.find(
      (item: any) => item.plantId.toString() === plantId
    );

    if (existingItem) {
      return NextResponse.json(
        { success: false, error: 'Plant already in wishlist' },
        { status: 400 }
      );
    }

    // Add item to wishlist
    wishlist.items.push({
      plantId,
      addedAt: new Date(),
    });

    await wishlist.save();

    return NextResponse.json({
      success: true,
      message: 'Plant added to wishlist',
      wishlist: {
        _id: wishlist._id.toString(),
        items: wishlist.items.map((item: any) => ({
          plantId: item.plantId.toString(),
          addedAt: item.addedAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('Add to wishlist error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}

// Remove item from wishlist
export async function DELETE(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const plantId = searchParams.get('plantId');

    if (!plantId) {
      return NextResponse.json(
        { success: false, error: 'Plant ID is required' },
        { status: 400 }
      );
    }

    // Get wishlist
    const wishlist = await Wishlist.findOne({ user: decoded.userId });

    if (!wishlist) {
      return NextResponse.json(
        { success: false, error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    // Remove item from wishlist
    wishlist.items = wishlist.items.filter(
      (item: any) => item.plantId.toString() !== plantId
    );

    await wishlist.save();

    return NextResponse.json({
      success: true,
      message: 'Plant removed from wishlist',
      wishlist: {
        _id: wishlist._id.toString(),
        items: wishlist.items.map((item: any) => ({
          plantId: item.plantId.toString(),
          addedAt: item.addedAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('Remove from wishlist error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}


