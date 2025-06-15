import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({});
  const targetDate = new Date("2025-08-16T00:00:00").getTime();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLearnMore = () => {
    navigate("/instruction-details"); // Navigate to the new instruction details page
  };
 const handleNavigation = (id) => {
    if (location.pathname === "/") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/", { state: { scrollTo: id } });
    }
  };
  return (
   <div className="relative w-full h-[70vh] sm:h-[75vh] md:h-[80vh] lg:h-[85vh] overflow-hidden bg-gray-900">
    {/* Background Section */}
    <div className="absolute inset-0">
      <img
        src="/assets/Others/discover_count_down_time.jpg"
        alt="Upcoming Project"
        className="w-full h-full object-cover blur-sm"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90"></div>
    </div>

    {/* Content Section */}
    <div className="relative z-10 flex flex-col justify-center items-center h-full text-white px-4 sm:px-6 text-center">
      <h2 className=" text-2xl md:text-4xl font-bold mb-4 drop-shadow-lg sm:mt-9">
        Grand Launch of Our Upcoming Project
      </h2>
      <p className="text-lg sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 drop-shadow-md">
        Experience luxury living like never before. Be the first to explore our new property.
      </p>
        {/* Countdown Timer */}
        <div className="grid grid-cols-4 md:grid-cols-4 gap-6 text-lg sm:text-2xl font-semibold sm:grid-cols-4 sm:gap-6">
          <div className="flex flex-col items-center">
            <span className=" text-2xl md:text-6xl font-bold text-pink-500 drop-shadow-lg">
              {timeLeft.days}
            </span>
            <span className="uppercase tracking-wide">Days</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-6xl font-bold text-green-400 drop-shadow-lg">
              {timeLeft.hours}
            </span>
            <span className="uppercase tracking-wide">Hours</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-6xl font-bold text-yellow-400 drop-shadow-lg">
              {timeLeft.minutes}
            </span>
            <span className="uppercase tracking-wide">Minutes</span>
          </div>
          <div className="flex flex-col items-center">
            <span className=" text-2xl md:text-6xl font-bold text-blue-400 drop-shadow-lg">
              {timeLeft.seconds}
            </span>
            <span className="uppercase tracking-wide">Seconds</span>
          </div>
        </div>

        {/* Call to Action Buttons */}
<div className="mt-8 flex  sm:flex-row sm:justify-center gap-4 sm:gap-6 sm:mt-8 w-full max-w-[90%] mx-auto">
  <button
    onClick={handleLearnMore}
    className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-medium rounded-lg shadow-lg hover:scale-105 transition-transform sm:text-xl"
  >
    Learn More
  </button>
  <button
    onClick={() => handleNavigation("contact")}
    className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white text-lg font-medium rounded-lg shadow-lg hover:scale-105 transition-transform sm:text-xl"
  >
    Contact Us
  </button>
</div>
      </div>
    </div>
  );
};

export default CountdownTimer;