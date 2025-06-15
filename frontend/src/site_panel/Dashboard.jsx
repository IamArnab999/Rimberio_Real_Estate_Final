import React from "react";
import { MdSpaceDashboard } from "react-icons/md";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <Link to="/dashboard">
      <div className="cursor-pointer">
        <div className="flex items-center mb-4">
          <MdSpaceDashboard className="h-6 w-6 text-gray-800" />
          <h2 className="text-2xl font-bold text-gray-800 ml-2">
            Dashboard
          </h2>
        </div>
        <p className="text-gray-600">
          Keep track of your property inquiries, follow up on potential buyers, and never miss an opportunity.
        </p>
      </div>
    </Link>
  );
};

export default Dashboard;
