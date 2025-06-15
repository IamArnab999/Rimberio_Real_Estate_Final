import React from 'react';
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

const HelpSupport = () => {
  return (
    <Link to="/Support">
      <div className="cursor-pointer">
        <div className="flex items-center mb-4">
          <QuestionMarkCircleIcon className="h-6 w-6 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-800 ml-2">Help & Support</h2>
        </div>
        <p className="text-gray-600">Here you can view and manage your orders.</p>
      </div>
    </Link>
  );
};

export default HelpSupport;