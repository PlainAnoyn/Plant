import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Plant from '@/models/Plant';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Get reviews for a plant
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const plantId = searchParams.get('plantId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!plantId) {
      return NextResponse.json(
        { success: false, error: 'Plant ID is required' },
        { status: 400 }
      );
    }

    // Get reviews with user information
    const reviews = await Review.find({ plant: plantId })
      .populate('user', 'name email profilePicture')
      .sort({ createdAt: -1, helpful: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Review.countDocuments({ plant: plantId });

    // Calculate average rating
    const ratingStats = await Review.aggregate([
      { $match: { plant: new mongoose.Types.ObjectId(plantId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating',
          },
        },
      },
    ]);

    let averageRating = 0;
    let totalReviews = 0;
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (ratingStats.length > 0) {
      averageRating = Math.round((ratingStats[0].averageRating || 0) * 10) / 10;
      totalReviews = ratingStats[0].totalReviews || 0;
      ratingStats[0].ratingDistribution.forEach((rating: number) => {
        if (rating >= 1 && rating <= 5) {
          ratingDistribution[rating as keyof typeof ratingDistribution]++;
        }
      });
    }

    return NextResponse.json({
      success: true,
      reviews: reviews.map((review) => ({
        _id: review._id.toString(),
        user: {
          _id: review.user._id.toString(),
          name: review.user.name || 'Anonymous',
          email: review.user.email,
          profilePicture: review.user.profilePicture,
        },
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        helpful: review.helpful || 0,
        verifiedPurchase: review.verifiedPurchase || false,
        createdAt: review.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        averageRating,
        totalReviews,
        ratingDistribution,
      },
    });
  } catch (error: any) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get reviews' },
      { status: 500 }
    );
  }
}

// Create a new review
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get user from token
    const token = cookies().get('token')?.value;

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
    const { plantId, orderId, rating, title, comment } = body;

    // Validate required fields
    if (!plantId || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Plant ID, rating, and comment are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
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

    // Check if user already reviewed this plant
    const existingReview = await Review.findOne({
      user: decoded.userId,
      plant: plantId,
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this plant' },
        { status: 400 }
      );
    }

    // Check if user has purchased this plant (verified purchase)
    let verifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        user: decoded.userId,
        'orderItems.plantId': plantId,
      });
      verifiedPurchase = !!order;
    } else {
      // Check if user has any order with this plant
      const order = await Order.findOne({
        user: decoded.userId,
        'orderItems.plantId': plantId,
      });
      verifiedPurchase = !!order;
    }

    // Create review
    const review = await Review.create({
      user: decoded.userId,
      plant: plantId,
      order: orderId,
      rating,
      title: title?.trim() || undefined,
      comment: comment.trim(),
      verifiedPurchase,
    });

    // Update plant's average rating (we'll calculate it dynamically, but we can cache it)
    // For now, we'll just return the review and calculate stats on demand

    return NextResponse.json({
      success: true,
      review: {
        _id: review._id.toString(),
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        helpful: review.helpful,
        verifiedPurchase: review.verifiedPurchase,
        createdAt: review.createdAt,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create review error:', error);
    
    // Handle duplicate review error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this plant' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
}

