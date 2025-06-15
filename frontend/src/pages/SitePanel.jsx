import React, { useState, useContext, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { Card, Typography } from "@material-tailwind/react";
import { UserContext } from "../components/UserContext";
import Sidebar from "../components/Sidebar";
import Dashboard from "../site_panel/Dashboard";
import ScheduledVisits from "../site_panel/ScheduledVisits";
import Notifications from "../site_panel/Notifications";
import Wishlist from "../site_panel/MyWishlist";
import HelpSupport from "../site_panel/HelpSupport";
import Settings from "../site_panel/Settings";

const SitePanel = () => {
  const { user } = useContext(UserContext);
  const [openAccordion, setOpenAccordion] = useState(0);
  const prevRole = useRef(user?.role);

  useEffect(() => {
    if (user?.role && prevRole.current && user.role !== prevRole.current) {
      toast.info(`You are now logged in as ${user.role.toLowerCase()}`);
    }
    prevRole.current = user?.role;
  }, [user?.role]);

  const handleAccordionOpen = (value) => {
    setOpenAccordion(openAccordion === value ? 0 : value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col md:flex-row">
      {/* Sidebar: Hide on small screens, show toggle button if needed */}
      <div className="md:block hidden w-full md:w-1/4 lg:w-1/5">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 sm:p-8 md:p-12 max-w-7xl mx-auto">
        <Typography
          variant="h4"
          color="blue-gray"
          className="text-center mt-2 mb-8 font-bold text-2xl sm:text-3xl md:text-4xl text-blue-700 tracking-tight"
        >
          Site Panel
        </Typography>

        {/* Responsive Grid */}
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[
            Dashboard,
            ScheduledVisits,
            Notifications,
            Wishlist,
            HelpSupport,
            Settings,
          ].map((Component, idx) => (
            <Card
              key={idx}
              className="p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow bg-white border border-blue-50"
            >
              <Component />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SitePanel;
