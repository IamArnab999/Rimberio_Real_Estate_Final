import React from 'react';
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import {Link} from "react-router-dom";

const Settings = () => {
  return (
    <Link to="/settingpage">
      <div className="cursor-pointer">
        <div className="flex items-center mb-4">
          <Cog6ToothIcon className="h-6 w-6 text-gray-800" />
          <h2 className="text-2xl font-bold text-gray-800 ml-2">Settings</h2>
        </div>
        <p className="text-gray-600">
          Customize your preferences, update your account details, and manage your privacy settings here.
        </p>
      </div>
    </Link>
  );
};

export default Settings;