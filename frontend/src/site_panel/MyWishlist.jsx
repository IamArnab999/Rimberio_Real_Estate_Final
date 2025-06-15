import React from 'react';
import { HeartIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
const Wishlist = () => {
  return (
    <Link to="/wishlist">
      <div className="cursor-pointer">
        <div className="flex items-center mb-4">
          <HeartIcon className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-800 ml-2">Wishlist</h2>
        </div>
        <p className="text-gray-600">
          Browse and manage the items you’ve saved for later. Add them to your cart when you're ready to purchase.
        </p>
      </div>
    </Link>
  );
};

export default Wishlist;