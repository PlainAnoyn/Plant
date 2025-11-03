import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
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

  const isAdmin = user.role === 'admin' || 
                  user.email === 'admin@gmail.com' || 
                  user.username === 'admin';
  
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized - Admin access required' };
  }

  return { success: true, userId: decoded.userId };
}

// Get all reviews (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

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
    const filter = searchParams.get('filter'); // 'all', 'blocked', 'active'

    let query: any = {};
    if (filter === 'blocked') {
      query.isBlocked = true;
    } else if (filter === 'active') {
      query.isBlocked = false;
    }

    const reviews = await Review.find(query)
      .populate('user', 'name email profilePicture')
      .populate('plant', 'name imageUrl')
      .populate('replies.user', 'name email profilePicture role')
      .populate('reactions.user', 'name email profilePicture role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments(query);

    return NextResponse.json({
      success: true,
      reviews: reviews.map((review) => ({
        _id: review._id.toString(),
        user: {
          _id: review.user._id.toString(),
          name: review.user.name,
          email: review.user.email,
          profilePicture: review.user.profilePicture,
        },
        plant: {
          _id: review.plant._id.toString(),
          name: review.plant.name,
          imageUrl: review.plant.imageUrl,
        },
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        helpful: review.helpful || 0,
        verifiedPurchase: review.verifiedPurchase || false,
        replies: review.replies?.map((reply: any) => ({
          _id: reply._id?.toString(),
          user: {
            _id: reply.user._id.toString(),
            name: reply.user.name,
            email: reply.user.email,
            profilePicture: reply.user.profilePicture,
            role: reply.user.role,
          },
          comment: reply.comment,
          createdAt: reply.createdAt,
        })) || [],
        reactions: review.reactions?.map((reaction: any) => ({
          _id: reaction._id?.toString(),
          user: {
            _id: reaction.user._id.toString(),
            name: reaction.user.name,
            role: reaction.user.role,
          },
          type: reaction.type,
          createdAt: reaction.createdAt,
        })) || [],
        isBlocked: review.isBlocked || false,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Admin get reviews error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get reviews' },
      { status: 500 }
    );
  }
}


