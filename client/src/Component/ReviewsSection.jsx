import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaComment, FaPencilAlt, FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';

function ReviewsSection({ listingId, currentUser, isOwner }) {
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  
  // Popup state
  const [popup, setPopup] = useState({
    isOpen: false,
    message: '',
    type: 'success',
    isVisible: false
  });

  // Format a date string
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), 'MMMM dd, yyyy');
  };

  // Calculate average rating
  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };
  
  const averageRating = calculateAverageRating(reviews);
  
  // Popup effect - handle auto-close and animations
  useEffect(() => {
    if (popup.isOpen) {
      setPopup(prev => ({ ...prev, isVisible: true }));
      
      const timer = setTimeout(() => {
        setPopup(prev => ({ ...prev, isVisible: false }));
        setTimeout(() => {
          setPopup(prev => ({ ...prev, isOpen: false }));
        }, 300); // Slight delay to allow the fade-out animation
      }, 4000); // Auto close after 4 seconds
      
      return () => clearTimeout(timer);
    }
  }, [popup.isOpen]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewLoading(true);
        const res = await fetch(`/api/reviews/${listingId}`);
        const data = await res.json();
        if (data.success === false) {
          console.error('Failed to load reviews');
          setReviewLoading(false);
          return;
        }
        setReviews(data);
        setReviewLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviewLoading(false);
      }
    };

    fetchReviews();
  }, [listingId]);

  const handleRate = (newRating) => {
    setSelectedRating(newRating);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, isVisible: false }));
    setTimeout(() => {
      setPopup(prev => ({ ...prev, isOpen: false }));
    }, 300);
  };

  const showPopup = (message, type = 'success') => {
    setPopup({
      isOpen: true,
      isVisible: false, // Will be set to true in useEffect
      message,
      type
    });
  };

  const submitReview = async () => {
    if (!currentUser) {
      showPopup('Please login to leave a review', 'error');
      return;
    }

    if (selectedRating === 0) {
      showPopup('Please select a rating', 'error');
      return;
    }

    try {
      const response = await fetch('/api/reviews/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          userId: currentUser._id,
          username: currentUser.username,
          rating: selectedRating,
          comment,
          createdAt: new Date(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setReviews([...reviews, {
          _id: data.reviewId,
          userId: currentUser._id,
          username: currentUser.username,
          rating: selectedRating,
          comment,
          createdAt: new Date(),
        }]);
        setComment('');
        setSelectedRating(0);
        showPopup('Review submitted successfully!');
      } else {
        showPopup(data.message || 'Failed to submit review', 'error');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showPopup('An error occurred while submitting your review', 'error');
    }
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
      {/* Custom Popup - integrated into ReviewsSection */}
      {popup.isOpen && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
            popup.isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
        >
          <div 
            className={`bg-white rounded-lg shadow-xl transform transition-all duration-300 ${
              popup.isVisible ? 'scale-100' : 'scale-95'
            } max-w-md w-full mx-4`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  {popup.type === 'success' ? (
                    <FaCheckCircle className="text-green-500 text-2xl mr-3" />
                  ) : (
                    <FaTimesCircle className="text-red-500 text-2xl mr-3" />
                  )}
                  <h3 className="text-lg font-medium text-gray-900">
                    {popup.type === 'success' ? 'Success' : 'Error'}
                  </h3>
                </div>
                <button
                  onClick={closePopup}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4">
                <p className="text-gray-700">{popup.message}</p>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closePopup}
                  className={`px-4 py-2 ${
                    popup.type === 'success' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  } text-white rounded-lg transition-colors text-sm font-medium`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Reviews & Ratings</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
          {reviews.length} Reviews
        </span>
      </div>
      
      {reviewLoading ? (
        <div className="flex justify-center py-6">
          <div className="w-8 h-8 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
              <div className="flex items-start">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-9 w-9 flex items-center justify-center rounded-full text-white font-bold text-sm">
                  {review.username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-800 text-sm">{review.username}</p>
                    <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                  </div>
                  <div className="flex mt-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <FaComment className="mx-auto text-3xl text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">No reviews yet. Be the first to review this property!</p>
        </div>
      )}
      
      {/* Add Review Form */}
      {currentUser && !isOwner && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center text-sm">
            <FaPencilAlt className="mr-2 text-blue-500" />
            Write a Review
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRate(star)}
                    className="text-xl focus:outline-none mr-1"
                  >
                    {star <= selectedRating ? (
                      <FaStar className="text-yellow-400" />
                    ) : (
                      <FaRegStar className="text-gray-300 hover:text-yellow-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
              <textarea
                id="comment"
                value={comment}
                onChange={handleCommentChange}
                rows="3"
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Share your experience with this property..."
              ></textarea>
            </div>
            <button
              onClick={submitReview}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewsSection;
