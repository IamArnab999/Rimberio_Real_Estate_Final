import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-blue-950 min-h-screen flex items-center justify-center">
            <div className="container px-6 py-12 mx-auto lg:flex lg:items-center lg:gap-12">
                {/* Left Section */}
                <div className="w-full lg:w-1/2 text-center lg:text-left">
                    <p className="text-lg font-bold text-blue-300">404 error</p>
                    <h1 className="mt-3 text-4xl font-extrabold text-white md:text-5xl">
                        Page Not Found
                    </h1>
                    <p className="mt-4 text-blue-200">
                        Sorry, the page you are looking for doesn't exist. Here are some helpful links:
                    </p>
                    <div className="flex items-center justify-center lg:justify-start mt-6 gap-x-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-5 py-2 text-sm text-gray-700 bg-white border rounded-lg hover:bg-gray-100"
                        >
                            Go back
                        </button>
                        <button
                            onClick={() => navigate("/")}
                            className="px-5 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            Take me home
                        </button>
                    </div>
                </div>

                {/* Right Section */}
                <div className="relative w-full mt-8 lg:w-1/2 lg:mt-0">
                    <img
                        className="w-full lg:h-[32rem] h-80 md:h-96 rounded-lg object-cover"
                        src="../assets/Others/error_page.jpg" // Replace with the actual path to your image
                        alt="Error Page"
                    />
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;