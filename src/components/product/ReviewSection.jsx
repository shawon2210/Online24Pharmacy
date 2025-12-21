import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "../../stores/authStore";
import { fetchProductReviews, addReview } from "../../utils/api";

export default function ReviewSection({ productId }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: reviewData } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => fetchProductReviews(productId),
  });

  const addReviewMutation = useMutation({
    mutationFn: addReview,
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews", productId]);
      setShowReviewForm(false);
      setComment("");
      setRating(5);
    },
  });

  const handleSubmitReview = (e) => {
    e.preventDefault();
    addReviewMutation.mutate({
      productId,
      rating,
      comment,
    });
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return [...Array(5)].map((_, index) => {
      const filled = index < rating;
      const StarComponent = filled ? StarIcon : StarOutlineIcon;

      return (
        <StarComponent
          key={index}
          className={`w-5 h-5 ${filled ? "text-yellow-400" : "text-gray-300"} ${
            interactive ? "cursor-pointer hover:text-yellow-400" : ""
          }`}
          onClick={interactive ? () => onRate(index + 1) : undefined}
        />
      );
    });
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold">Customer Reviews</h3>
          {reviewData && (
            <div className="flex items-center mt-2">
              <div className="flex">
                {renderStars(Math.round(reviewData.averageRating))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {reviewData.averageRating.toFixed(1)} ({reviewData.totalReviews}{" "}
                reviews)
              </span>
            </div>
          )}
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="btn-primary"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex">{renderStars(rating, true, setRating)}</div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder="Share your experience with this product..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={addReviewMutation.isPending}
              className="btn-primary"
            >
              {addReviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewData?.reviews?.map((review) => (
          <div key={review.id} className="border-b pb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {review.user.firstName} {review.user.lastName[0]}.
                  </span>
                  {review.isVerified && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <div className="flex mt-1">{renderStars(review.rating)}</div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            {review.comment && (
              <p className="text-gray-700">{review.comment}</p>
            )}
          </div>
        ))}

        {reviewData?.reviews?.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No reviews yet. Be the first to review this product!
          </p>
        )}
      </div>
    </div>
  );
}
