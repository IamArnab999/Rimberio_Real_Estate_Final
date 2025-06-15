import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import { useNotification } from "./NotificationContext.jsx";
import logo from "/assets/Others/logo2.png";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const Navbar = () => {
  const { user, logout } = useContext(UserContext);
  const { unreadCount } = useNotification();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();
  const location = useLocation();
  const defaultProfileImage = "/assets/Others/VERT_user.webp";

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  const handleScroll = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    element
      ? element.scrollIntoView({ behavior: "smooth" })
      : window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigation = (id) => {
    setActiveSection(id);
    location.pathname === "/"
      ? id === "teams"
        ? navigate("/teams")
        : handleScroll(id)
      : navigate(id === "teams" ? "/teams" : "/", { state: { scrollTo: id } });
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    Cookies.remove("authToken");
    toast.success("Logged out successfully");
    navigate("/");
  };

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest(".dropdown") && !e.target.closest(".menu-toggle")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  const prevRole = React.useRef(user?.role);

  useEffect(() => {
    if (user?.role && prevRole.current && user.role !== prevRole.current) {
      toast.info(`You are now logged in as ${user.role.toLowerCase()}`);
    }
    prevRole.current = user?.role;
  }, [user?.role]);

  useEffect(() => {
    // Show toast if just logged in (e.g., after login redirect)
    if (location.state?.justLoggedIn) {
      // toast.success("Logged in successfully");
      // Remove the state so the toast doesn't show again on refresh
      navigate("/");
    }
  }, [location, navigate]);

  useEffect(() => {
    if (location.pathname === "/") {
      // Scroll-based active section for homepage
      const handleSectionScroll = () => {
        const sectionIds = ["home", "services", "teams", "about", "contact"];
        let found = "home";
        for (const id of sectionIds) {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 80 && rect.bottom > 80) {
              found = id;
              break;
            }
          }
        }
        setActiveSection(found);
      };
      window.addEventListener("scroll", handleSectionScroll);
      return () => window.removeEventListener("scroll", handleSectionScroll);
    } else {
      // Route-based active section for other pages
      if (location.pathname.startsWith("/teams")) setActiveSection("teams");
      else if (location.pathname.startsWith("/about"))
        setActiveSection("about");
      else if (location.pathname.startsWith("/contact"))
        setActiveSection("contact");
      else setActiveSection("");
    }
  }, [location.pathname]);

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900 fixed w-full z-50 top-0">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <button
          onClick={() => handleNavigation("home")}
          className="flex items-center space-x-3 rtl:space-x-reverse"
          style={{ cursor: "pointer" }}
        >
          <img src={logo} className="h-10 rounded-full" alt="Logo" />
        </button>

        <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          {!isAuthPage &&
            (user ? (
              <div className="relative inline-block dropdown">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="relative z-10 flex items-center p-2 text-sm text-white bg-gray-800 border border-transparent rounded-md focus:border-blue-500 focus:ring-opacity-40 focus:ring-blue-300 focus:outline-none menu-toggle"
                >
                  <img
                    className="w-8 h-8 rounded-full mr-2"
                    src={
                      user?.avatar
                        ? `${user.avatar}?t=${new Date().getTime()}`
                        : defaultProfileImage
                    }
                    alt="User Avatar"
                  />
                  <span className="mx-1">{user.name || "Guest"}</span>
                  <svg
                    className={`w-5 h-5 mx-1 transform transition-transform duration-300 ${
                      isDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 15.713L18.01 9.70299L16.597 8.28799L12 12.888L7.40399 8.28799L5.98999 9.70199L12 15.713Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div
                    className="absolute right-0 z-20 w-64 py-3 mt-2 overflow-hidden origin-top-right bg-gray-800 text-white rounded-md shadow-xl"
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <Link
                      to="/site-panel"
                      className="flex items-center p-3 -mt-2 text-sm text-white transition-colors duration-300 transform hover:bg-gray-700"
                    >
                      <img
                        className="flex-shrink-0 object-cover mx-1 rounded-full w-10 h-10"
                        src={
                          user?.avatar
                            ? `${user.avatar}?t=${new Date().getTime()}`
                            : defaultProfileImage
                        }
                        alt="User Avatar"
                      />
                      <div className="mx-1">
                        <h1 className="text-sm font-semibold text-white">
                          {user.name || "Guest"}
                        </h1>
                        <p className="text-sm text-gray-300">
                          {user.email || "guest@example.com"}
                        </p>
                      </div>
                    </Link>
                    <hr className="border-gray-700" />
                    {(user?.role?.toLowerCase() === "admin" ||
                      user?.role?.toLowerCase() === "owner") && (
                      <Link
                        to="/Dashboard"
                        className="block px-4 py-2 text-sm text-white capitalize transition-colors duration-300 transform hover:bg-gray-700"
                      >
                        <i className="fas fa-tachometer-alt mr-2"></i> Dashboard
                      </Link>
                    )}
                    <Link
                      to="/Visits"
                      className="block px-4 py-2 text-sm text-white capitalize transition-colors duration-300 transform hover:bg-gray-700"
                    >
                      <i className="fas fa-calendar-check mr-2"></i> Scheduled
                      Visits
                    </Link>
                    <Link
                      to="/notify"
                      className="block px-4 py-2 text-sm text-white capitalize transition-colors duration-300 transform hover:bg-gray-700 relative"
                    >
                      <i className="fas fa-bell mr-2"></i> Notifications
                      {unreadCount > 0 && (
                        <span
                          className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 animate-pulse"
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
                    </Link>
                    <Link
                      to="/wishlist"
                      className="block px-4 py-2 text-sm text-white capitalize transition-colors duration-300 transform hover:bg-gray-700"
                    >
                      <i className="fas fa-heart mr-2"></i> Wishlist
                    </Link>
                    <Link
                      to="/Support"
                      className="block px-4 py-2 text-sm text-white capitalize transition-colors duration-300 transform hover:bg-gray-700"
                    >
                      <i className="fas fa-question-circle mr-2"></i> Help &
                      Support
                    </Link>
                    <Link
                      to="/settingpage"
                      className="block px-4 py-2 text-sm text-white capitalize transition-colors duration-300 transform hover:bg-gray-700"
                    >
                      <i className="fas fa-cog mr-2"></i> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
              >
                Login
              </Link>
            ))}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="menu-toggle inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>

        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } items-center justify-between w-full md:flex md:w-auto md:order-1`}
        >
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <button
                onClick={() => handleNavigation("home")}
                className={`block px-4 py-2 transition-all duration-200 relative
        ${
          activeSection === "home"
            ? "text-blue-900 dark:text-white font-semibold border-b-2 border-blue-600 md:border-b-4 md:border-blue-600"
            : "text-blue-900 dark:text-white hover:underline hover:underline-offset-8 hover:decoration-blue-600 dark:hover:text-cyan-400"
        }`}
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("services")}
                className={`block px-4 py-2 transition-all duration-200 relative
        ${
          activeSection === "services"
            ? "text-blue-900 dark:text-white font-semibold border-b-2 border-blue-600 md:border-b-4 md:border-blue-600"
            : "text-blue-900 dark:text-white hover:underline hover:underline-offset-8 hover:decoration-blue-600 dark:hover:text-cyan-400"
        }`}
              >
                Services
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("teams")}
                className={`block px-4 py-2 transition-all duration-200 relative
        ${
          activeSection === "teams"
            ? "text-blue-900 dark:text-white font-semibold border-b-2 border-blue-600 md:border-b-4 md:border-blue-600"
            : "text-blue-900 dark:text-white hover:underline hover:underline-offset-8 hover:decoration-blue-600 dark:hover:text-cyan-400"
        }`}
              >
                Find a Team
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("about")}
                className={`block px-4 py-2 transition-all duration-200 relative
        ${
          activeSection === "about"
            ? "text-blue-900 dark:text-white font-semibold border-b-2 border-blue-600 md:border-b-4 md:border-blue-600"
            : "text-blue-900 dark:text-white hover:underline hover:underline-offset-8 hover:decoration-blue-600 dark:hover:text-cyan-400"
        }`}
              >
                About Us
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("contact")}
                className={`block px-4 py-2 transition-all duration-200 relative
        ${
          activeSection === "contact"
            ? "text-blue-900 dark:text-white font-semibold border-b-2 border-blue-600 md:border-b-4 md:border-blue-600"
            : "text-blue-900 dark:text-white hover:underline hover:underline-offset-8 hover:decoration-blue-600 dark:hover:text-cyan-400"
        }`}
              >
                Contact Us
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
