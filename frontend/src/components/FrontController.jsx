import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "./UserContext.jsx";

// This component acts as a front controller for all routes except /login and /register
const FrontController = ({ children }) => {
  const { user, loading } = useContext(UserContext);
  const location = useLocation();

  // Allow access to login and register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return children;
  }

  // Wait for auth state to resolve
  if (loading) return null;

  // Check sessionStorage for refresh detection
  const isAuthenticated = sessionStorage.getItem("isAuthenticated");

  // If not authenticated, redirect to login (but allow refresh if session flag is set)
  if (!user && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Authenticated: render children
  return children;
};

export default FrontController;
