import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReviewReply {
  user: mongoose.Types.ObjectId;
  comment: string;
  createdAt: Date;
}

export interface IReviewReaction {
  user: mongoose.Types.ObjectId;
  type: 'like' | 'dislike' | 'love' | 'angry';
  createdAt: Date;
}

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  plant: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId; // Optional: Link to the order this review is for
  rating: number; // 1-5 stars
  title?: string;
  comment: string;
  helpful: number; // Number of helpful votes
  verifiedPurchase: boolean; // Whether the user actually purchased this product
  replies: IReviewReply[]; // Admin replies to this review
  reactions: IReviewReaction[]; // Admin reactions to this review
  isBlocked: boolean; // Whether this review is blocked/hidden
  blockedBy?: mongoose.Types.ObjectId; // Admin who blocked it
  blockedAt?: Date; // When it was blocked
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plant: {
      type: Schema.Types.ObjectId,
      ref: 'Plant',
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
    replies: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Reply cannot exceed 500 characters'],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    reactions: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      type: {
        type: String,
        enum: ['like', 'dislike', 'love', 'angry'],
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    blockedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ReviewSchema.index({ plant: 1, createdAt: -1 });
ReviewSchema.index({ user: 1, plant: 1 }); // Ensure one review per user per plant

// Compound index to prevent duplicate reviews
ReviewSchema.index({ user: 1, plant: 1 }, { unique: true });

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;

