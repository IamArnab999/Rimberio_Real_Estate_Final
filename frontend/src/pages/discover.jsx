import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Countdown from "../components/CountDown"; // Correct file name// Imported Countdown component

<Countdown targetDate="2025-06-30T23:59:59" />
const services = [
    {
        title: "Agents / Brokers",
        image: "/assets/discover/VERT_agent.webp",
        description: "Hassle-Free Solutions: Buy, Sell, or Rent Your Property with ease. Connect with trusted agents and brokers to navigate the real estate market efficiently and achieve your property goals.",
    },
    {
        title: "Builders / Developers",
        image: "/assets/discover/VERT_builder.webp",
        description: "List of the most trusted and reliable builders who deliver high-quality projects on time. Connect with developers known for their expertise and commitment to excellence in real estate construction.",
    },
    {
        title: "Architects / Architecture",
        image: "/assets/discover/VERT_architect.webp",
        description: "Professional architecture to meet your expectations. Collaborate with experienced architects to design innovative and functional spaces tailored to your needs.",
    },
    {
        title: "Interior Decorators",
        image: "/assets/discover/VERT_interior.webp",
        description: "A One-Stop Solution for all your decor needs. Transform your living or workspace with the help of skilled interior decorators who bring your vision to life.",
    },
    {
        title: "Vaastu Consultant",
        image: "/assets/discover/VERT_vaastu.webp",
        description: "Connect with top consultants for the right direction. Ensure your property aligns with Vaastu principles to bring harmony, prosperity, and positive energy to your space.",
    },
    {
        title: "Building Contractors",
        image: "/assets/discover/VERT_contractor.webp",
        description: "Home repair, remodel, or reconstruction services. Connect with skilled contractors to ensure quality and timely completion of your projects, tailored to your specific needs.",
    },
    {
        title: "Home Inspection",
        image: "/assets/discover/VERT_inspection.webp",
        description: "Complete range of building and home inspection services. Ensure your property is safe and compliant with professional inspection solutions tailored to your needs.",
    },
    {
        title: "Property Consultants",
        image: "/assets/discover/VERT_consultant.webp",
        description: "List of top real estate consultants. Get expert advice and guidance to make informed decisions for your property investments and real estate needs.",
    },
];

const insights = [
    {
        title: "Top Residential Localities",
        image: "/assets/discover/VERT_location.webp",
        description: "Top locations with verified residential properties. Explore the best neighborhoods offering quality living spaces and excellent amenities for your dream home.",
    },
    {
        title: "Top Agents and Brokers",
        image: "/assets/discover/VERT_ratings.webp",
        description: "Verified real estate agents and consultants. Connect with trusted professionals to guide you through buying, selling, or renting properties with confidence.",
    },
    {
        title: "Latest Real Estate News",
        image: "/assets/discover/VERT_news.webp",
        description: "Stay updated with real estate market trends. Get the latest insights, news, and updates to make informed decisions in the ever-changing real estate landscape.",
    },
    {
        title: "Generating Real Estate Leads",
        image: "/assets/discover/VERT_leads.webp",
        description: "Acquire authentic real-estate leads effortlessly. Leverage trusted platforms to connect with genuine buyers and sellers, ensuring seamless and reliable transactions.",
    },
];

const Discover = () => {
    const [expandedIndex, setExpandedIndex] = useState(null); // Track which item is expanded
    const [isLoading, setIsLoading] = useState(false); // Track loading state for the 3-second delay

    // Slick slider settings
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 1250,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true, // Enable autoplay
        autoplaySpeed: 2500, // Set autoplay interval to 3 seconds
        pauseOnHover: true, // Pause sliding when hovered
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };

    const handleReadMore = (index) => {
        setIsLoading(true); // Start loading
        setTimeout(() => {
            setExpandedIndex(index); // Expand the description after 3 seconds
            setIsLoading(false); // Stop loading
        }); // 3-second delay
    };

    const handleReadLess = () => {
        setExpandedIndex(null); // Collapse the description
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div>
            {/* Imported Countdown Component Display */}
            <Countdown />

            {/* Services Section */}
            <section className="p-5 md:bg-[#f8f8f8]">
                <div className="container mx-auto px-4">
                    <h2 className="text-center font-medium md:text-4xl mb-6 mt-20 text-2xl ">
                        Our Real Estate Services
                    </h2>
                    <Slider {...sliderSettings}>
                        {services.map((service, index) => (
                            <div key={index} className="p-4">
                                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="mx-auto mb-4 w-40 h-40 rounded-lg"
                                    />
                                    <h5 className="text-lg font-semibold text-gray-800">{service.title}</h5>
                                    <p className="text-gray-600 mt-2 mb-4">
                                        {expandedIndex === index
                                            ? service.description // Show full description if expanded
                                            : `${service.description.slice(0, 50)}...`} {/* Show truncated description */}
                                    </p>
                                    {expandedIndex === index ? (
                                        <button
                                            onClick={handleReadLess}
                                            className="text-base font-semibold py-2 bg-red-500 px-4 mt-5 shadow-md shadow-red-400 text-white rounded-md"
                                        >
                                            Read Less
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleReadMore(index)}
                                            className="text-base font-semibold py-2 bg-blue-500 px-4 mt-5 shadow-md shadow-cyan-400 text-white rounded-md"
                                            disabled={isLoading} // Disable button while loading
                                        >
                                            {isLoading && expandedIndex === null ? "Loading..." : "Read More"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </section>

            {/* Insights Section */}
            <section className="p-5 mb-5 md:bg-[#f8f8f8]">
                <div className="container mx-auto px-4">
                    <h2 className="text-center font-medium md:text-4xl mb-6 mt-20 text-2xl ">
                        Insights into Real Estate
                    </h2>
                    <Slider {...sliderSettings}>
                        {insights.map((insight, index) => (
                            <div key={index} className="p-4">
                                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                    <img
                                        src={insight.image}
                                        alt={insight.title}
                                        className="mx-auto mb-4 w-40 h-40 rounded-lg"
                                    />
                                    <h5 className="text-lg font-semibold text-gray-800">{insight.title}</h5>
                                    <p className="text-gray-600 mt-2 mb-4">
                                        {expandedIndex === index
                                            ? insight.description // Show full description if expanded
                                            : `${insight.description.slice(0, 50)}...`} {/* Show truncated description */}
                                    </p>
                                    {expandedIndex === index ? (
                                        <button
                                            onClick={handleReadLess}
                                            className="text-base font-semibold py-2 bg-red-500 px-4 mt-5 shadow-md shadow-red-400 text-white rounded-md"
                                        >
                                            Read Less
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleReadMore(index)}
                                            className="text-base font-semibold py-2 bg-blue-500 px-4 mt-5 shadow-md shadow-cyan-400 text-white rounded-md"
                                            disabled={isLoading} // Disable button while loading
                                        >
                                            {isLoading && expandedIndex === null ? "Loading..." : "Read More"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </section>
        </div>
    );
};

export default Discover;