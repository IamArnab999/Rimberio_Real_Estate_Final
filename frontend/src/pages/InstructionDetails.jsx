import React from "react";
import { useNavigate } from "react-router-dom";

const InstructionDetails = () => {
  const projects = [
    { src: "/assets/new_seemore_images/Luxury Condo.jpg", alt: "Luxury Condo", details: "A modern luxury condo with stunning views." },
    { src: "/assets/new_seemore_images/Luxury Haven.jpeg", alt: "Luxury Haven", details: "A serene haven with world-class amenities." },
    { src: "/assets/new_seemore_images/Green Retreat.jpg", alt: "Green Retreat", details: "Eco-friendly homes surrounded by nature." },
    { src: "/assets/new_seemore_images/Urban Oasis.jpeg", alt: "Urban Oasis", details: "A tranquil oasis in the heart of the city." },
    { src: "/assets/new_seemore_images/Elite Villa.jpg", alt: "Elite Villa", details: "Exclusive villas with premium features." },
    { src: "/assets/new_seemore_images/Seaside Mansion.jpg", alt: "Seaside Mansion", details: "Luxurious mansions by the sea." },
  ];
const navigate = useNavigate();
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
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">
          Upcoming Project Details
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Image */}
          <div>
            <img
              src="/assets/seemore_images/Beachfront Condo.avif"
              alt="Beachfront Condo"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          {/* Project Details */}
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Discover Luxury Living
            </h2>
            <p className="text-gray-600 mb-4">
              Our upcoming project redefines luxury living with state-of-the-art
              amenities, modern architecture, and a prime location. Be the first
              to experience the pinnacle of comfort and elegance.
            </p>
            <ul className="list-none text-gray-600 mb-4 space-y-2">
  <li className="flex items-center">
    <span className="text-blue-500 mr-2">✔️</span>
    Spacious apartments with premium fittings
  </li>
  <li className="flex items-center">
    <span className="text-green-500 mr-2">✔️</span>
    24/7 security and concierge services
  </li>
  <li className="flex items-center">
    <span className="text-yellow-500 mr-2">✔️</span>
    World-class recreational facilities
  </li>
  <li className="flex items-center">
    <span className="text-purple-500 mr-2">✔️</span>
    Prime location with excellent connectivity
  </li>
</ul>
            <button
              onClick={() => handleNavigation("contact")}
              className="px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-lg hover:bg-blue-700 transition"
            >
              Contact Us for More Details
            </button>
          </div>
        </div>

        {/* Additional Images Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
            Explore Our Projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div
                key={index}
                className="relative group overflow-hidden rounded-lg shadow-lg"
              >
                {/* Image */}
                <img
                  src={project.src}
                  alt={project.alt}
                  className="w-full h-auto transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                  <p className="text-white text-lg font-medium">{project.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionDetails;