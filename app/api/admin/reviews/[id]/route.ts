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

// Update review (react, reply, block, delete)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();

    const adminCheck = await checkAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.error?.includes('Unauthorized') ? 403 : 401 }
      );
    }

    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const { action, ...actionData } = body;

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'react': {
        const { type } = actionData; // 'like', 'dislike', 'love', 'angry'
        if (!['like', 'dislike', 'love', 'angry'].includes(type)) {
          return NextResponse.json(
            { success: false, error: 'Invalid reaction type' },
            { status: 400 }
          );
        }

        // Remove existing reaction from this admin
        review.reactions = (review.reactions || []).filter(
          (r: any) => r.user?.toString() !== adminCheck.userId
        );

        // Add new reaction
        review.reactions.push({
          user: adminCheck.userId,
          type,
          createdAt: new Date(),
        });

        await review.save();
        break;
      }

      case 'reply': {
        const { comment } = actionData;
        if (!comment || comment.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: 'Reply comment is required' },
            { status: 400 }
          );
        }

        if (comment.trim().length > 500) {
          return NextResponse.json(
            { success: false, error: 'Reply cannot exceed 500 characters' },
            { status: 400 }
          );
        }

        if (!review.replies) {
          review.replies = [];
        }

        review.replies.push({
          user: adminCheck.userId,
          comment: comment.trim(),
          createdAt: new Date(),
        });

        await review.save();
        break;
      }

      case 'block': {
        review.isBlocked = true;
        review.blockedBy = adminCheck.userId;
        review.blockedAt = new Date();
        await review.save();
        break;
      }

      case 'unblock': {
        review.isBlocked = false;
        review.blockedBy = undefined;
        review.blockedAt = undefined;
        await review.save();
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Return updated review
    const updatedReview = await Review.findById(id)
      .populate('user', 'name email profilePicture')
      .populate('plant', 'name imageUrl')
      .populate('replies.user', 'name email profilePicture role')
      .populate('reactions.user', 'name email profilePicture role')
      .lean();

    return NextResponse.json({
      success: true,
      review: {
        _id: updatedReview!._id.toString(),
        user: {
          _id: updatedReview!.user._id.toString(),
          name: updatedReview!.user.name,
          email: updatedReview!.user.email,
          profilePicture: updatedReview!.user.profilePicture,
        },
        plant: {
          _id: updatedReview!.plant._id.toString(),
          name: updatedReview!.plant.name,
          imageUrl: updatedReview!.plant.imageUrl,
        },
        rating: updatedReview!.rating,
        title: updatedReview!.title,
        comment: updatedReview!.comment,
        helpful: updatedReview!.helpful || 0,
        verifiedPurchase: updatedReview!.verifiedPurchase || false,
        replies: updatedReview!.replies?.map((reply: any) => ({
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
        reactions: updatedReview!.reactions?.map((reaction: any) => ({
          _id: reaction._id?.toString(),
          user: {
            _id: reaction.user._id.toString(),
            name: reaction.user.name,
            role: reaction.user.role,
          },
          type: reaction.type,
          createdAt: reaction.createdAt,
        })) || [],
        isBlocked: updatedReview!.isBlocked || false,
        createdAt: updatedReview!.createdAt,
        updatedAt: updatedReview!.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Admin update review error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update review' },
      { status: 500 }
    );
  }
}

// Delete review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();

    const adminCheck = await checkAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.error?.includes('Unauthorized') ? 403 : 401 }
      );
    }

    const { id } = await Promise.resolve(params);

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error: any) {
    console.error('Admin delete review error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete review' },
      { status: 500 }
    );
  }
}


