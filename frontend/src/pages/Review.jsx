import React, { useContext, useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { UserContext } from "../components/UserContext";

const Review = ({
  reviews,
  loading,
  helpfulClicks,
  handleHelpfulClick,
  onDelete,
  onDeleteAll,
  onVerify,
}) => {
  const { user } = useContext(UserContext);

  if (loading) return <div>Loading reviews...</div>;
  if (!reviews.length) return <div>No reviews yet.</div>;

  return (
    <div className="space-y-8">
      {reviews.map((review, index) => (
        <div
          key={review.id || index}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300"
        >
          {/* Review content */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div className="flex items-center space-x-4">
                {review.avatar && (
                  <img
                    src={review.avatar}
                    alt={review.user_name || review.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-gray-200"
                  />
                )}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    {review.user_name || review.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {review.created_at
                      ? new Date(review.created_at).toLocaleString()
                      : review.date}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 items-center justify-start sm:justify-end ">
                <span className="text-yellow-500 text-base sm:text-lg">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </span>
                {/* Verification status for admin/owner: toggle button, for member: show status only */}
                {user && (user.role === "admin" || user.role === "owner") ? (
                  <button
                    className={`text-xs rounded-full px-3 py-1 ml-2 ${
                      review.verified
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-700"
                    }`}
                    onClick={() =>
                      onVerify && onVerify(review.id, !review.verified)
                    }
                  >
                    {review.verified ? "Verified" : "Unverified"}
                  </button>
                ) : (
                  <span
                    className={`text-xs rounded-full px-3 py-1 ml-2 ${
                      review.verified
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {review.verified ? "Verified" : "Unverified"}
                  </span>
                )}
                {/* Delete button for admin/owner/member */}
                {user &&
                  (user.role === "admin" ||
                    user.role === "owner" ||
                    user.role === "member") && (
                    <button
                      className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      onClick={() => onDelete && onDelete(review.id)}
                    >
                      Delete
                    </button>
                  )}
              </div>
            </div>
            <p className="text-gray-700 mb-4 text-sm sm:text-base break-words">
              {review.review}
            </p>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(review.images)
                ? review.images
                : typeof review.images === "string"
                ? JSON.parse(review.images || "[]")
                : []
              ).map((image, idx) => (
                <img
                  key={idx}
                  src={image}
                  alt={`Review image ${idx + 1}`}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
          {/* Footer with helpful buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-100 gap-2 sm:gap-0">
            <div className="flex space-x-4 mb-2 sm:mb-0">
              <button
                onClick={() => handleHelpfulClick(index, "yes")}
                className={`flex items-center text-sm font-medium transition-all duration-200 ${
                  helpfulClicks[`${index}-yes`]
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span role="img" aria-label="yes">
                  👍
                </span>{" "}
                {review.helpfulYes || 0}
              </button>
              <button
                onClick={() => handleHelpfulClick(index, "no")}
                className={`flex items-center text-sm font-medium transition-all duration-200 ${
                  helpfulClicks[`${index}-no`]
                    ? "text-red-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span role="img" aria-label="no">
                  👎
                </span>{" "}
                {review.helpfulNo || 0}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Review;
