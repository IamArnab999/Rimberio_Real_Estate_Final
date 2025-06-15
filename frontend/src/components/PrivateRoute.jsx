import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext.jsx"; // Adjust the path if needed

const PrivateRoute = ({ children, requiredRole }) => {
  const { user } = useContext(UserContext); // Access user from context

  // If not logged in, redirect to login
  if (!user) return <Navigate to="/login" />;

  // If a requiredRole is specified, check if user has access
  if (requiredRole) {
    if (!user.role || ![...requiredRole].includes(user.role.toLowerCase())) {
      // If trying to access dashboard/admin and not admin/owner, redirect to home
      return <Navigate to="/" />;
    }
  }

  return children;
};

export default PrivateRoute;
