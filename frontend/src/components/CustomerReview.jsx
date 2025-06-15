import { useState, useEffect, useRef } from "react";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

const CustomerReview = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedCount, setAnimatedCount] = useState(0);
  const reviewCountRef = useRef(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch reviews from backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/reviews`
        );
        if (!res.ok) throw new Error("Failed to fetch reviews");
        let data = await res.json();
        setReviews(data);
      } catch (err) {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Calculate stats from reviews
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews === 0
      ? 0
      : (
          reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) /
          totalReviews
        ).toFixed(1);
  const ratings = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percent = totalReviews ? Math.round((count / totalReviews) * 100) : 0;
    return { stars: star, percent, count };
  });

  useEffect(() => {
    setIsVisible(true);
    // Animate the review count
    let start = 0;
    const end = totalReviews;
    const duration = 1200;
    let startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      setAnimatedCount(value);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setAnimatedCount(end);
      }
    }
    window.requestAnimationFrame(step);
  }, [totalReviews]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="text-amber-400 fill-amber-400"
          size={24}
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="text-gray-200 fill-gray-200" size={24} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="text-amber-400 fill-amber-400" size={24} />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="text-gray-200" size={24} />
      );
    }

    return stars;
  };

  return (
    <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div
          className={`bg-white rounded-xl border border-gray-100 shadow-sm p-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-800">
                  Customer Feedback
                </h2>
                <p className="text-gray-500">
                  Based on{" "}
                  <span
                    id="review-count"
                    ref={reviewCountRef}
                    className="inline-block transition-all duration-500 ease-in-out text-blue-600 font-bold animate-pulse"
                  >
                    {animatedCount}+
                  </span>{" "}
                  verified reviews
                </p>
              </div>

              <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                <span className="text-4xl font-bold text-gray-800">
                  {averageRating}
                </span>
                <div className="flex flex-col">
                  <div className="flex space-x-1">
                    {renderStars(averageRating)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Overall rating</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {ratings.map((rating) => (
                <div key={rating.stars} className="flex items-center gap-3">
                  <div className="w-20 flex items-center gap-1">
                    <Star
                      size={16}
                      className={
                        rating.stars >= 1
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200"
                      }
                    />
                    <span className="font-medium text-gray-700">
                      {rating.stars}
                    </span>
                  </div>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: isVisible ? `${rating.percent}%` : "0%",
                      }}
                    />
                  </div>
                  <div className="w-16 text-sm font-medium text-gray-600 text-right">
                    {rating.count}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Ratings collected from verified customer purchases
                </p>
                <div className="flex gap-4">
                  <Link
                    to="/review"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View All Reviews
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReview;
