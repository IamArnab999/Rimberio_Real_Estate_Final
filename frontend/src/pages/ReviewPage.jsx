import React, { useState, useEffect, useContext } from "react";
import WriteReview from "./WriteReview"; // Import the WriteReview component
import Review from "./Review"; // Import the Reviews component
import { UserContext } from "../components/UserContext";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [helpfulClicks, setHelpfulClicks] = useState({});
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useContext(UserContext);

  // Fetch reviews from backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/reviews`
        );
        if (!res.ok) throw new Error("Failed to fetch reviews");
        let data = await res.json();
        // Sort reviews by created_at descending so newest is first
        data = data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setReviews(data);
      } catch (err) {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [refreshKey]);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedClicks = localStorage.getItem("helpfulClicks");
    if (savedClicks) {
      setHelpfulClicks(JSON.parse(savedClicks));
    }
    window.scrollTo(0, 0);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("helpfulClicks", JSON.stringify(helpfulClicks));
  }, [helpfulClicks]);

  const toggleWriteReviewModal = () => {
    setIsWriteReviewOpen(!isWriteReviewOpen);
  };

  const handleReviewSubmit = () => {
    setRefreshKey((prev) => prev + 1);
    setIsWriteReviewOpen(false);
  };

  const handleHelpfulClick = async (index, type) => {
    const reviewId = reviews[index].id;
    if (!reviewId) return;
    const yesKey = `${index}-yes`;
    const noKey = `${index}-no`;

    if (
      (type === "yes" && helpfulClicks[yesKey]) ||
      (type === "no" && helpfulClicks[noKey])
    )
      return;

    try {
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/reviews/${reviewId}/helpful`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        }
      );
      // Local UI update
      const updatedReviews = [...reviews];
      if (type === "yes") {
        if (helpfulClicks[noKey]) {
          updatedReviews[index].helpfulNo = Math.max(
            0,
            (updatedReviews[index].helpfulNo || 0) - 1
          );
        }
        updatedReviews[index].helpfulYes =
          (updatedReviews[index].helpfulYes || 0) + 1;
        setHelpfulClicks({
          ...helpfulClicks,
          [yesKey]: true,
          [noKey]: false,
        });
      } else if (type === "no") {
        if (helpfulClicks[yesKey]) {
          updatedReviews[index].helpfulYes = Math.max(
            0,
            (updatedReviews[index].helpfulYes || 0) - 1
          );
        }
        updatedReviews[index].helpfulNo =
          (updatedReviews[index].helpfulNo || 0) + 1;
        setHelpfulClicks({
          ...helpfulClicks,
          [noKey]: true,
          [yesKey]: false,
        });
      }
      setReviews(updatedReviews);
    } catch (err) {
      // Optionally show error to user
    }
  };

  // Delete a single review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/reviews/${reviewId}`,
        {
          method: "DELETE",
        }
      );
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      // Optionally show error
    }
  };

  // Delete all reviews
  const handleDeleteAllReviews = async () => {
    if (!window.confirm("Are you sure you want to delete ALL reviews?")) return;
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reviews`, {
        method: "DELETE",
      });
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      // Optionally show error
    }
  };

  // Toggle review verification status (admin/owner only)
  const handleVerifyReview = async (reviewId, verified) => {
    try {
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/reviews/${reviewId}/verify`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verified }),
        }
      );
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      // Optionally show error
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 text-center flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Customer Reviews
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleWriteReviewModal}
              className="px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full font-medium shadow-md hover:shadow-lg transition duration-200 transform hover:-translate-y-0.5"
            >
              Write a Review
            </button>
            {user && (user.role === "admin" || user.role === "owner") && (
              <button
                className="px-6 py-3 text-white bg-red-600 rounded-full font-medium shadow-md hover:bg-red-700 transition duration-200 ml-2"
                onClick={handleDeleteAllReviews}
              >
                Delete All
              </button>
            )}
          </div>
        </div>
        {/* Reviews List */}
        {loading ? (
          <div>Loading reviews...</div>
        ) : (
          <Review
            reviews={reviews}
            loading={loading}
            helpfulClicks={helpfulClicks}
            handleHelpfulClick={handleHelpfulClick}
            onDelete={handleDeleteReview}
            onDeleteAll={
              user && (user.role === "admin" || user.role === "owner")
                ? handleDeleteAllReviews
                : undefined
            }
            onVerify={
              user && (user.role === "admin" || user.role === "owner")
                ? handleVerifyReview
                : undefined
            }
          />
        )}
      </div>
      {/* Write Review Modal */}
      {isWriteReviewOpen && (
        <WriteReview
          isOpen={isWriteReviewOpen}
          toggleModal={toggleWriteReviewModal}
          onReviewSubmit={handleReviewSubmit}
        />
      )}
    </section>
  );
};

export default Reviews;
