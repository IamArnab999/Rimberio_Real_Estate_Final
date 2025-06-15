// filepath: c:\Users\rarna\Desktop\real-estate-backend-part-4\frontend\src\components\Layout.jsx
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Loading from "./Loading";
import { Outlet } from "react-router-dom";
import Cookies from "js-cookie";


const Layout = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Simulate a 2-second loading delay
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen w-full bg-white dark:bg-gray-900">
          <Loading message="Launching Real Estate Experience..." />
        </div>
      ) : (
        <main className="mt-14 animate-fade-in">
          <Navbar />
          <Outlet />
          <Footer />
        </main>
      )}
    </>
  );
};

export default Layout;
