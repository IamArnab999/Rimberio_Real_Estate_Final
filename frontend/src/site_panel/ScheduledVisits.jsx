import React from "react";
import { FaRegCalendarCheck } from "react-icons/fa6";
import { Link } from "react-router-dom";

const ScheduledVisits = () => {
    return (
        <Link to="/visits">
            <div className="cursor-pointer">
                <div className="flex items-center mb-4">
                <FaRegCalendarCheck className="h-6 w-6 text-gray-800" />
                    <h2 className="text-2xl font-bold text-gray-800 ml-2">Scheduled Visits</h2>
                </div>
                <p className="text-gray-600">
                    View and manage your upcoming property visits here.
                </p>
            </div>
        </Link>
    );
};

export default ScheduledVisits;