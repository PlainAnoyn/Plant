import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Plant from '@/models/Plant';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { logAudit } from '@/lib/audit';

const JWT_SECRET = process.env.JWT_SECRET ;

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

  const isAdmin =
    user.role === 'admin' ||
    user.email === 'admin@gmail.com' ||
    user.username === 'admin';

  if (!isAdmin) {
    return { success: false, error: 'Unauthorized - Admin access required' };
  }

  return { success: true, userId: decoded.userId };
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const adminCheck = await checkAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.error?.includes('Unauthorized') ? 403 : 401 }
      );
    }

    const body = await request.json();
    const { section, add = [], remove = [] } = body as {
      section?: 'featured' | 'freeDelivery';
      add?: string[];
      remove?: string[];
    };

    if (!section || (add.length === 0 && remove.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Section and at least one plant ID are required' },
        { status: 400 }
      );
    }

    const field = section === 'featured' ? 'isFeatured' : 'isFreeDelivery';

    if (add.length) {
      await Plant.updateMany(
        { _id: { $in: add } },
        { $set: { [field]: true } }
      );
    }

    if (remove.length) {
      await Plant.updateMany(
        { _id: { $in: remove } },
        { $set: { [field]: false } }
      );
    }

    const affectedIds = [...new Set([...add, ...remove])];
    const updatedPlants = await Plant.find({ _id: { $in: affectedIds } })
      .select('_id isFeatured isFreeDelivery name updatedAt')
      .lean();

    const user = await User.findById(adminCheck.userId).lean();
    await logAudit({
      action: 'update',
      resource: 'plant-section',
      resourceId: 'bulk',
      userId: adminCheck.userId!,
      userEmail: user?.email,
      changes: {
        section,
        added: add,
        removed: remove,
      },
      request,
    });

    return NextResponse.json({
      success: true,
      updatedPlants: updatedPlants.map((plant) => ({
        _id: plant._id.toString(),
        isFeatured: Boolean(plant.isFeatured),
        isFreeDelivery: Boolean(plant.isFreeDelivery),
      })),
    });
  } catch (error: any) {
    console.error('Admin bulk update plants error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update plant sections' },
      { status: 500 }
    );
  }
}


