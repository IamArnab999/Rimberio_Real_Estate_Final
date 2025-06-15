import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import { useNotification } from "./NotificationContext.jsx";
import {
  Card,
  Typography,
  Input,
  List,
  ListItem,
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon,
  InboxIcon,
  HeartIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  PowerIcon,
  Squares2X2Icon,
  ChartBarIcon,
  FolderIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  UserGroupIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaRegCircleQuestion, FaRegCalendarCheck } from "react-icons/fa6";

const Sidebar = () => {
  const { user, logout } = useContext(UserContext);
  const { unreadCount } = useNotification();
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const [suggestions, setSuggestions] = useState([]); // State for suggestions
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar visibility
  const [dashboardOpen, setDashboardOpen] = useState(false); // State for dashboard expansion
  const navigate = useNavigate();
  const location = useLocation(); // Get current route

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  // Admin dashboard links (Dashboard dropdown)
  const adminDashboardLinks = [
    {
      label: "Properties",
      path: "/admin/properties",
      icon: <FolderIcon className="h-4 w-4 mr-2" />,
    },
    {
      label: "Clients",
      path: "/admin/clients",
      icon: <UserGroupIcon className="h-4 w-4 mr-2" />,
    },
    {
      label: "Chat History",
      path: "/admin/chathistory",
      icon: <InboxIcon className="h-4 w-4 mr-2" />,
    },
    {
      label: "Calendar",
      path: "/admin/calendar",
      icon: <CalendarIcon className="h-4 w-4 mr-2" />,
    },
    {
      label: "Analytics",
      path: "/admin/analytics",
      icon: <ChartBarIcon className="h-4 w-4 mr-2" />,
    },
  ];

  // User section links (MAIN sidebar, outside dashboard)
  let userLinks = [
    {
      label: "Scheduled Visits",
      path: "/visits",
      icon: <FaRegCalendarCheck className="h-5 w-5 mr-2" />,
      description: "View or manage upcoming property tours.",
    },
    {
      label: "Wishlist",
      path: "/wishlist",
      icon: <HeartIcon className="h-5 w-5 text-red-500 mr-2" />,
      description: "Save properties you like and revisit them anytime.",
    },
  ];

  // Add "My Properties" section for agent/owner
  // if (user && (user.role === "agent" || user.role === "owner")) {
  //   userLinks.unshift({
  //     label: "My Properties",
  //     path: "/my-properties",
  //     icon: <HomeIcon className="h-5 w-5 mr-2" />,
  //     description: "Manage your property listings.",
  //   });
  // }

  // Main universal links (not Dashboard, not user)
  const mainLinks = [
    {
      label: "Notifications",
      path: "/notify",
      icon: (
        <span className="relative">
          <InboxIcon className="h-5 w-5 mr-2" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 animate-pulse"
              style={{
                minWidth: 18,
                minHeight: 18,
                lineHeight: "18px",
                textAlign: "center",
              }}
            >
              {unreadCount}
            </span>
          )}
        </span>
      ),
    },
    {
      label: "Help & Support",
      path: "/Support",
      icon: <QuestionMarkCircleIcon className="h-5 w-5 text-green-500 mr-2" />,
    },
    {
      label: "Settings",
      path: "/settingpage",
      icon: <Cog6ToothIcon className="h-5 w-5 mr-2" />,
    },
  ];

  // For search: everything except Log out
  const allLinksForSearch = [
    ...adminDashboardLinks,
    ...userLinks,
    ...mainLinks,
  ];

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Show suggestions if query length is 2 or more
    if (query.length >= 2) {
      const filteredSuggestions = allLinksForSearch.filter((option) =>
        option.label.toLowerCase().includes(query)
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (path) => {
    navigate(path);
    setSearchQuery(""); // Clear search query
    setSuggestions([]); // Clear suggestions
  };

  // Only show Dashboard section if user is admin or owner
  const canSeeDashboard =
    user &&
    user.role &&
    ["admin", "owner"].includes(user.role.toLowerCase().trim());

  // Determine if current route is in adminDashboardLinks
  const isDashboardRouteActive = canSeeDashboard && adminDashboardLinks.some(link => location.pathname.startsWith(link.path));

  // Open dashboard if current route is in dashboard links
  React.useEffect(() => {
    if (isDashboardRouteActive) setDashboardOpen(true);
    else setDashboardOpen(false); // Ensure it closes if not in dashboard
  }, [isDashboardRouteActive]);

  // Debug: Show user and role in console
  if (user) {
    console.log("Sidebar user:", user);
    console.log("Sidebar user.role:", user.role);
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      {isSidebarOpen && (
        <Card className="h-[calc(120vh-2rem)] w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 md:mt-8">
          <div className="mb-2 flex items-center gap-4 p-4 ">
            <img
              src="/assets/Others/logo2.png"
              alt="brand"
              className="h-10 w-10 rounded-full"
            />
            <Typography variant="h5" color="blue-gray">
              Real Estate
            </Typography>
          </div>
          <div className="p-2 relative">
            <div className="flex items-center gap-2">
              <Input
                icon={<MagnifyingGlassIcon className="h-10 w-5" />}
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            {suggestions.length > 0 && (
              <div className="absolute bg-white border rounded-md shadow-lg mt-2 w-full z-10">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => handleSuggestionClick(suggestion.path)}
                  >
                    {suggestion.icon}
                    <span>{suggestion.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <List>
            {/* Dashboard section ONLY admin/owner links */}
            {canSeeDashboard && (
              <ListItem>
                <div className="flex flex-col">
                  <div
                    onClick={() => setDashboardOpen(!dashboardOpen)}
                    className="flex items-center justify-between p-1 hover:bg-gray-200 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <Squares2X2Icon className="h-5 w-5 mr-2" />
                      <span>Dashboard</span>
                    </div>
                    <div>
                      {dashboardOpen ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                  {dashboardOpen && (
                    <div className="ml-6 flex flex-col">
                      {adminDashboardLinks.map((option, idx) => {
                        const isActive = location.pathname.startsWith(option.path);
                        return (
                          <Link
                            key={option.label + idx}
                            to={option.path}
                            className={`flex items-center p-1 hover:bg-gray-200 rounded-md ${isActive ? "bg-blue-100 text-blue-700 font-semibold" : ""}`}
                            style={isActive ? { fontWeight: "bold", background: "#e0e7ff", color: "#1d4ed8" } : {}}
                          >
                            {option.icon}
                            <span>{option.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </ListItem>
            )}
            {/* User real estate actions as separate main items */}
            {userLinks.map((option, idx) => (
              <ListItem key={option.label + idx}>
                <Link
                  to={option.path}
                  className="flex items-center p-1 hover:bg-gray-200"
                  title={option.description || option.label}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </Link>
              </ListItem>
            ))}
            {/* Main non-dashboard links (universal links) */}
            {mainLinks.map((option, idx) => (
              <ListItem key={option.label + idx}>
                <Link
                  to={option.path}
                  className="flex items-center p-1 hover:bg-gray-200"
                >
                  {option.icon}
                  {option.label}
                </Link>
              </ListItem>
            ))}
            {/* Log Out Button */}
            <ListItem>
              <button
                onClick={handleLogout}
                className="flex items-center p-1 hover:bg-gray-200"
              >
                <PowerIcon className="h-5 w-5 mr-2" />
                Log Out
              </button>
            </ListItem>
          </List>
        </Card>
      )}

      {/* Toggle Button */}
      {/* <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="p-2 bg-blue-gray-500 text-white rounded-full shadow-lg fixed top-5 left-4 z-50 justify-center items-center"
      >
        {isSidebarOpen ? <ChevronLeftIcon className="h-6 w-6" /> : <ChevronRightIcon className="h-6 w-6" />}
      </button> */}
    </div>
  );
};

export default Sidebar;
