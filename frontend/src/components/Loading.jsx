import React from "react";

const Loading = ({ message = "Preparing Your Experience..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 animate-fade-in px-4 sm:px-0">
      {/* Logo or Icon */}
      <div className="mb-6">
        <img
          src="/assets/Others/logo2.png"
          alt="Real Estate Logo"
          className="h-16 w-16 sm:h-20 sm:w-20 animate-bounce rounded-full shadow-lg object-cover"
        />
      </div>

      {/* Loading Text */}
      <p className="text-lg sm:text-xl font-bold text-blue-700 mb-4 animate-pulse text-center">
        {message}
      </p>

      {/* Spinner Animation */}
      <div className="relative h-16 w-16 sm:h-20 sm:w-20">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-500 border-t-transparent shadow-inner"></div>
        <div className="absolute inset-2 animate-pulse rounded-full border-4 border-blue-300"></div>
      </div>
    </div>
  );
};

export default Loading;