'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface ReviewUser {
  _id: string;
  name?: string;
  email?: string;
  profilePicture?: string;
}

interface Review {
  _id: string;
  user: ReviewUser;
  rating: number;
  title?: string;
  comment: string;
  helpful: number;
  verifiedPurchase: boolean;
  createdAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface ReviewsProps {
  plantId: string;
}

export default function Reviews({ plantId }: ReviewsProps) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [plantId, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews?plantId=${plantId}&page=${page}&limit=5`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.reviews);
        setStats(data.stats);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = () => {
    setShowReviewForm(false);
    setPage(1);
    fetchReviews();
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const starSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${starSize} ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 dark:border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-emerald-700 dark:text-emerald-400">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-300">Customer Reviews</h2>
          {isAuthenticated && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors font-semibold"
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          )}
        </div>

        {/* Review Stats */}
        {stats && (
          <div className="bg-cream-50 dark:bg-slate-800/50 rounded-lg p-6 mb-6 border border-emerald-100 dark:border-slate-700">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-900 dark:text-emerald-300">{stats.averageRating.toFixed(1)}</div>
                <div className="mt-2">{renderStars(Math.round(stats.averageRating), 'md')}</div>
                <div className="text-sm text-emerald-700 dark:text-emerald-400 mt-2">{stats.totalReviews} reviews</div>
              </div>
              <div className="flex-1">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-sm text-emerald-900 dark:text-emerald-300 w-12">{rating} star</span>
                        <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-emerald-700 dark:text-emerald-400 w-12 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Form */}
        {showReviewForm && isAuthenticated && (
          <ReviewForm plantId={plantId} onReviewAdded={handleReviewAdded} />
        )}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-cream-50 dark:bg-slate-800/50 rounded-lg border border-emerald-100 dark:border-slate-700">
          <div className="text-5xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-emerald-900 dark:text-emerald-300 mb-2">No Reviews Yet</h3>
          <p className="text-emerald-700 dark:text-emerald-400 mb-4">Be the first to review this plant!</p>
          {!isAuthenticated && (
            <p className="text-sm text-emerald-600 dark:text-emerald-500">Please log in to write a review</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-emerald-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  {review.user.profilePicture ? (
                    <Image
                      src={review.user.profilePicture}
                      alt={review.user.name || 'User'}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-lg">
                      {(review.user.name || review.user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                          {review.user.name || 'Anonymous'}
                        </span>
                        {review.verifiedPurchase && (
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full font-semibold">
                            ✓ Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating, 'sm')}
                        <span className="text-sm text-emerald-700 dark:text-emerald-400">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {review.title && (
                    <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2">{review.title}</h4>
                  )}
                  <p className="text-emerald-800 dark:text-emerald-200 leading-relaxed">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-slate-600 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-emerald-700 dark:text-emerald-300">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-slate-600 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Review Form Component
function ReviewForm({ plantId, onReviewAdded }: { plantId: string; onReviewAdded: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating || !comment.trim()) {
      setError('Please provide a rating and comment');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Comment must be at least 10 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          plantId,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit review');
      }

      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      onReviewAdded();
    } catch (error: any) {
      setError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStarInput = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <svg
              className={`w-8 h-8 ${
                star <= (hoveredRating || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-emerald-200 dark:border-slate-700 mb-6 shadow-sm">
      <h3 className="text-xl font-semibold text-emerald-900 dark:text-emerald-300 mb-4">Write Your Review</h3>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-2">
            Your Rating *
          </label>
          {renderStarInput()}
          {rating > 0 && (
            <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-2">
              {rating === 5 && 'Excellent!'}
              {rating === 4 && 'Good!'}
              {rating === 3 && 'Average'}
              {rating === 2 && 'Poor'}
              {rating === 1 && 'Very Poor'}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="review-title" className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-2">
            Review Title (Optional)
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="w-full px-4 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder="Summarize your experience"
          />
        </div>

        <div>
          <label htmlFor="review-comment" className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-2">
            Your Review * <span className="text-sm font-normal text-emerald-600 dark:text-emerald-500">(min. 10 characters)</span>
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            maxLength={1000}
            required
            className="w-full px-4 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none resize-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder="Share your experience with this plant..."
          />
          <div className="text-sm text-emerald-600 dark:text-emerald-400 mt-1 text-right">
            {comment.length}/1000 characters
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !rating || !comment.trim() || comment.trim().length < 10}
            className="px-6 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={() => {
              setRating(0);
              setTitle('');
              setComment('');
              setError('');
            }}
            className="px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}


