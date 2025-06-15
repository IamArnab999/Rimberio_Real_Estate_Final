import { useEffect } from "react";
import React from "react";

const HowItWorks = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      title: "First-Time Home Buying",
      img: "/assets/images/VERT_first_time_home.webp",
      alt: "First-Time Home Buying",
      desc: "Dive into this comprehensive guide designed for first-time homebuyers. Learn about budgeting, mortgage options, finding the perfect location, and negotiating the best deal to turn your dream of homeownership into reality.",
    },
    {
      title: "Real Estate Investment Strategies for 2025",
      img: "/assets/images/VERT_Real Estate Investment.webp",
      alt: "Real Estate Investment Strategies",
      desc: "Discover the most lucrative ways to invest in real estate this year. From flipping houses to rental properties and REITs, this guide covers everything you need to know to maximize your returns.",
    },
    {
      title: "Luxury Living",
      img: "/assets/images/VERT_Luxury Living.webp",
      alt: "Luxury Living",
      desc: "Step into the world of opulence as we showcase the finest luxury properties across the globe. From beachfront villas to penthouses in the sky, experience the epitome of elegance and design.",
    },
    {
      title: "How to Sell Your Home Fast",
      img: "/assets/images/VERT_Sell Your Home.webp",
      alt: "Sell Your Home Fast",
      desc: "Ready to sell? Learn expert tips on staging, pricing, and marketing your home effectively to attract the right buyers and close the deal quickly, all while maximizing your home's value.",
    },
  ];

  return (
    <section className="how-it-works bg-gray-100 py-10">
      <div className="w-full max-w-full px-2 sm:px-4 md:px-8 mx-auto">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-12 mt-12 animate-fade-in">
          How It Works
        </h1>
        <div className="flex flex-col gap-8 mb-16 w-full">
          {/* Feature Cards */}
          {features.map((feature, idx) => (
            <div
              key={feature.title}
              className="relative bg-white rounded-2xl shadow-xl p-5 md:p-8 w-full max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-8 transition-transform duration-500 hover:scale-105 animate-fade-in"
              style={{
                animationDelay: `${idx * 0.2}s`,
                animationFillMode: "both",
              }}
            >
              <div className="flex-1 flex justify-center items-center min-w-[180px]">
                <img
                  src={feature.img}
                  alt={feature.alt}
                  className="rounded-xl shadow-md w-full max-w-[320px] h-[120px] md:h-[180px] object-cover animate-fade-in"
                  style={{
                    animationDelay: `${idx * 0.2 + 0.1}s`,
                    animationFillMode: "both",
                  }}
                />
              </div>
              <div className="flex-1 w-full">
                <h2
                  className="text-xl md:text-2xl font-extrabold text-gray-800 mb-3 animate-fade-in"
                  style={{
                    animationDelay: `${idx * 0.2 + 0.2}s`,
                    animationFillMode: "both",
                  }}
                >
                  {feature.title}
                </h2>
                <p
                  className="text-gray-600 text-base md:text-lg animate-fade-in"
                  style={{
                    animationDelay: `${idx * 0.2 + 0.3}s`,
                    animationFillMode: "both",
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        {/* Extra Feature: Call to Action */}
        <div
          className="text-center mt-10 animate-fade-in"
          style={{
            animationDelay: `${features.length * 0.2 + 0.5}s`,
            animationFillMode: "both",
          }}
        >
          <h3 className="text-2xl font-extrabold mb-5 text-gray-800">
            Ready to get started?
          </h3>
          <a
            href="/register"
            className="inline-block px-8 py-3 rounded-xl shadow-xl font-extrabold text-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-gray-500 hover:from-blue-600 hover:to-pink-600 transition-all duration-300 animate-fade-in relative overflow-hidden group"
            style={{
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
              letterSpacing: "0.02em",
            }}
          >
            <span
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg group-hover:from-blue-600 group-hover:to-pink-600 transition-all duration-300 text-white"
              style={{
                fontWeight: 800,
                fontSize: "1.25rem",
                display: "inline-block",
              }}
            >
              Create Your Free Account
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
