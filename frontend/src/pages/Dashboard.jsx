import React, { useContext } from "react";
import { UserContext } from "../components/UserContext";
import { Navigate, Link } from "react-router-dom";
import { Home, Users, MessageSquare, Calendar, BarChart3 } from "lucide-react";

const Dashboard = () => {
  const { user } = useContext(UserContext);

  if (
    !user ||
    !user.role ||
    (user.role.toLowerCase() !== "admin" && user.role.toLowerCase() !== "owner")
  ) {
    return <Navigate to="/" replace />;
  }

  const dashboardLinks = [
    {
      to: "/admin/properties",
      label: "Manage Properties",
      icon: <Home className="w-8 h-8 text-blue-600 mb-2" />,
      desc: "Go to manage properties section",
      color:
        "from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 border-blue-200",
    },
    {
      to: "/admin/clients",
      label: "Manage Clients",
      icon: <Users className="w-8 h-8 text-green-600 mb-2" />,
      desc: "Go to manage clients section",
      color:
        "from-green-100 to-green-50 hover:from-green-200 hover:to-green-100 border-green-200",
    },
    {
      to: "/admin/chathistory",
      label: "View Chat History",
      icon: <MessageSquare className="w-8 h-8 text-purple-600 mb-2" />,
      desc: "Go to view chat history section",
      color:
        "from-purple-100 to-purple-50 hover:from-purple-200 hover:to-purple-100 border-purple-200",
    },
    {
      to: "/admin/calendar",
      label: "Calendar",
      icon: <Calendar className="w-8 h-8 text-orange-500 mb-2" />,
      desc: "Go to calendar section",
      color:
        "from-orange-100 to-orange-50 hover:from-orange-200 hover:to-orange-100 border-orange-200",
    },
    {
      to: "/admin/analytics",
      label: "Analytics",
      icon: <BarChart3 className="w-8 h-8 text-pink-600 mb-2" />,
      desc: "Go to analytics section",
      color:
        "from-pink-100 to-pink-50 hover:from-pink-200 hover:to-pink-100 border-pink-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 py-12 px-4">
      <h1 className="text-3xl font-extrabold text-center mb-14 text-gray-900 drop-shadow-lg tracking-tight animate-fade-in">
        Admin <span className="text-blue-600">/</span> Owner Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {dashboardLinks.map((link, index) => (
          <Link
            key={index}
            to={link.to}
            className={`rounded-3xl p-10 bg-gradient-to-br ${link.color} shadow-xl hover:scale-105 transition-all border-2 flex flex-col items-center group relative overflow-hidden`}
          >
            <div className="absolute -top-8 -right-8 opacity-10 text-9xl pointer-events-none select-none">
              {link.icon}
            </div>
            <div className="z-10 flex flex-col items-center">
              {link.icon}
              <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                {link.label}
              </h2>
              <p className="text-gray-600 text-base font-medium group-hover:text-gray-800 transition-colors">
                {link.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
