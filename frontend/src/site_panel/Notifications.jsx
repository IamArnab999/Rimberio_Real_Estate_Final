import React from "react";
import { InboxIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

const Notifications = () => {
    return (
        <Link to="/notify">
        <div className="cursor-pointer">
            <div className="flex items-center mb-4">
                <InboxIcon className="h-6 w-6 text-gray-800" />
                <h2 className="text-2xl font-bold text-gray-800 ml-2">Notifications</h2>
            </div>
            <p className="text-gray-600">Stay updated with the latest alerts and updates related to your account and activities.</p>
        </div>
        </Link>
    );
};

export default Notifications;
