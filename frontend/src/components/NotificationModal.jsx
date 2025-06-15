import React, { useState } from "react";

const NotificationModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    const notificationHandler = (show) => {
        setIsOpen(show);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            {/* Button to open modal */}
            <div className="py-8">
                <button
                    onClick={() => notificationHandler(true)}
                    className="focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 focus:outline-none py-2 px-10 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    Open Modal
                </button>
            </div>

            {/* Overlay + Modal */}
            <div
                className={`fixed inset-0 z-40 bg-gray-800 bg-opacity-90 ${isOpen ? "" : "hidden"
                    }`}
            >
                <div
                    className={`absolute right-0 top-0 h-full w-full max-w-md bg-gray-50 z-50 shadow-lg transform transition-transform duration-700 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    <div className="p-8 overflow-y-auto h-full">
                        <div className="flex items-center justify-between">
                            <p className="text-2xl font-semibold text-gray-800">
                                Notifications
                            </p>
                            {/* Close Button */}
                            <button
                                onClick={() => notificationHandler(false)}
                                className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-md"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-gray-600 hover:text-gray-800"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Notifications */}
                        <div className="mt-8 space-y-4">
                            <div className="bg-white p-3 rounded flex items-start">
                                <div className="w-8 h-8 border rounded-full border-gray-200 flex items-center justify-center">
                                    ❤️
                                </div>
                                <div className="pl-3">
                                    <p className="text-sm">
                                        <span className="text-indigo-700">James Doe</span>{" "}
                                        favourited an <span className="text-indigo-700">item</span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                                </div>
                            </div>

                            {/* Add more notifications here */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;