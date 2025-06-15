// React and Router imports
import React, { useState, useEffect } from "react";
import { initAnalytics } from "./firebase/analytics";
import { Route, Routes, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

// Third-party library imports
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Component imports
import ScrollToTop from "./components/ScrollToTop.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import { UserProvider } from "./components/UserContext.jsx";
import UpdateProfileForm from "./components/UpdateProfileForm.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Layout from "./components/Layout.jsx";
import FrontController from "./components/FrontController.jsx";
//import Payment from "./components/Payment.jsx";

// Authentication pages
import Login from "./auth/login.jsx";
import Signup from "./auth/register.jsx";

// General pages
import Home from "./pages/Home.jsx";
import Discover from "./pages/discover.jsx";
import HowItWorks from "./pages/HowItWorks.jsx";
import PropertySections from "./pages/SeeMore.jsx";
import Team from "./pages/Team.jsx";
// import HelpPage from "./pages/help.jsx";
import Reviews from "./pages/ReviewPage.jsx";
//import WriteReview from "./pages/WriteReview.jsx";
import Notify from "./pages/notify.jsx";
import Visits from "./pages/Visits.jsx";
import WishlistPage from "./pages/wishlist.jsx";
import InstructionDetails from "./pages/InstructionDetails";
// import Payment from "./pages/Payment.jsx";
import SettingPage from "./pages/SettingPage.jsx";
import Support from "./pages/Support.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import License from "./pages/License.jsx";
import Investors from "./pages/Investors.jsx";
import Documentation from "./pages/Documentation.jsx";

// Site Panel pages
import SitePanel from "./pages/SitePanel.jsx";
//import Inquiries from "./site_panel/MyInquiries.jsx";
//import ScheduledVisits from "./site_panel/ScheduledVisits.jsx";
import Notifications from "./site_panel/Notifications.jsx";
import Wishlist from "./site_panel/MyWishlist.jsx";
import HelpSupport from "./site_panel/HelpSupport.jsx";
import Settings from "./site_panel/Settings.jsx";
//import MyOrders from "./site_panel/MyOrders.jsx";

// Admin pages
import Analytics from "./admin/Analytics";
import Properties from "./admin/Properties";
import Clients from "./admin/Clients";
import ChatHistory from "./admin/ChatHistory";
import Calendar from "./admin/Calendar";
import ClientConversions from "./admin/ClientConversions";
import NewLeads from "./admin/NewLeads";
import SalesCount from "./admin/SalesCount";
import TotalRevenue from "./admin/TotalRevenue";

// Styles
import "./App.css";

const App = () => {
  // State to manage cookie consent
  const [isConsentGiven, setIsConsentGiven] = useState(false);
  const navigate = useNavigate();

  // Enable analytics only if consent is given
  useEffect(() => {
    const enableAnalyticsIfConsented = () => {
      if (Cookies.get("analytics") === "enabled") {
        initAnalytics();
      }
    };
    enableAnalyticsIfConsented();
    document.addEventListener(
      "cookieConsentUpdated",
      enableAnalyticsIfConsented
    );
    return () => {
      document.removeEventListener(
        "cookieConsentUpdated",
        enableAnalyticsIfConsented
      );
    };
  }, []);

  useEffect(() => {
    const handleOpenPropertyMap = (e) => {
      const property = e.detail;
      navigate("/see_more", {
        state: { property_id: property.property_id || property.id, property },
      });
    };
    window.addEventListener("openPropertyMap", handleOpenPropertyMap);
    return () => {
      window.removeEventListener("openPropertyMap", handleOpenPropertyMap);
    };
  }, [navigate]);

  // Handle changes in cookie consent
  const handleConsentChange = (consent) => {
    setIsConsentGiven(consent);
    if (consent) {
      console.log("Consent given: Enabling analytics and chatbot.");
    } else {
      console.log("Consent denied: Disabling analytics and chatbot.");
    }
  };

  return (
    <UserProvider>
      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false} // Fix for removalReason error
        draggable
        pauseOnHover
        limit={1} // Prevent duplicate toasts
        onClose={() => {}} // Prevents react-toastify from trying to mutate undefined toast
      />

      {/* Cookie consent banner */}
      {/* <CookieConsent
        onConsentChange={(consent) => {
          setIsConsentGiven(consent === "accepted");
          if (consent === "accepted") {
            console.log("Consent given: Enabling analytics and chatbot.");
          } else {
            console.log("Consent denied: Disabling analytics and chatbot.");
          }
        }}
      /> */}

      {/* Scroll to top on route change */}
      <ScrollToTop />

      {/* Application routes */}
      <Routes>
        {/* Authentication routes (public) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        {/* All other routes are protected by FrontController, including home and all subpages */}
        <Route
          path="/*"
          element={
            <FrontController>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="discover" element={<Discover />} />
                  <Route path="how_it_works" element={<HowItWorks />} />
                  <Route path="see_more" element={<PropertySections />} />
                  <Route path="property/:id" element={<PropertySections />} />
                  <Route path="teams" element={<Team />} />
                  <Route path="review" element={<Reviews />} />
                  <Route
                    path="instruction-details"
                    element={<InstructionDetails />}
                  />
                  <Route path="site-panel" element={<SitePanel />} />
                  <Route path="site-panel/dashboard" element={<Dashboard />} />
                  <Route
                    path="site-panel/notifications"
                    element={<Notifications />}
                  />
                  <Route path="site-panel/wishlist" element={<Wishlist />} />
                  <Route
                    path="site-panel/help-support"
                    element={<HelpSupport />}
                  />
                  <Route path="site-panel/settings" element={<Settings />} />
                  <Route path="visits" element={<Visits />} />
                  <Route path="notify" element={<Notify />} />
                  <Route path="wishlist" element={<WishlistPage />} />
                  <Route path="settingpage" element={<SettingPage />} />
                  <Route path="Support" element={<Support />} />
                  <Route path="license" element={<License />} />
                  <Route path="investors" element={<Investors />} />
                  <Route path="documentation" element={<Documentation />} />
                  {/* Admin routes */}
                  <Route
                    path="dashboard"
                    element={
                      <PrivateRoute requiredRole={["admin", "owner"]}>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="admin/Analytics"
                    element={
                      <PrivateRoute requiredRole={["admin", "owner"]}>
                        <Analytics />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="admin/Properties"
                    element={
                      <PrivateRoute requiredRole={["admin", "owner"]}>
                        <Properties />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="admin/Clients"
                    element={
                      <PrivateRoute requiredRole={["admin", "owner"]}>
                        <Clients />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="admin/ChatHistory"
                    element={
                      <PrivateRoute requiredRole={["admin", "owner"]}>
                        <ChatHistory />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="admin/Calendar"
                    element={
                      <PrivateRoute requiredRole={["admin", "owner"]}>
                        <Calendar />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="admin/ClientConversions"
                    element={
                      <PrivateRoute requiredRole={["admin", "owner"]}>
                        <ClientConversions />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="admin/NewLeads"
                    element={
                      <PrivateRoute requiredRole={["admin", "owner"]}>
                        <NewLeads />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="admin/SalesCount"
                    element={
                      <PrivateRoute requiredRole={["admin", "owner"]}>
                        <SalesCount />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="admin/TotalRevenue"
                    element={
                      <PrivateRoute requiredRole={["admin", "owner"]}>
                        <TotalRevenue />
                      </PrivateRoute>
                    }
                  />
                  {/* Catch-all route for undefined paths */}
                  <Route path="*" element={<ErrorPage />} />
                </Route>
              </Routes>
            </FrontController>
          }
        />
      </Routes>
    </UserProvider>
  );
};

export default App;
