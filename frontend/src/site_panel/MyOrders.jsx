
import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBagIcon } from "@heroicons/react/24/solid";

const MyOrders = () => {
    return (
        <Link to="/Orders">
            <div className="cursor-pointer">
                <div className="flex items-center mb-4">
                    <ShoppingBagIcon className="h-6 w-6 text-gray-800" />
                    <h2 className="text-2xl font-bold text-gray-800 ml-2">My Orders</h2>
                </div>
                <p className="text-gray-600">Here you can view and manage your orders.</p>
            </div>
        </Link>
    );
};

export default MyOrders;
