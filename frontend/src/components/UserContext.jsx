import React, { createContext, useState, useEffect } from "react";
import { auth } from "../firebase/config.js";
import {
  getRedirectResult,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import Cookies from "js-cookie";
import { updateEmailAddress } from "../firebase/firebase.js";
import { useLocation } from "react-router-dom";
const MAX_INACTIVITY_DAYS = 30;

const checkInactivityAndLogout = () => {
  const lastActivity = Cookies.get("lastActivity");
  if (lastActivity) {
    const lastActivityDate = new Date(lastActivity);
    const currentDate = new Date();
    const diffInDays = Math.floor(
      (currentDate - lastActivityDate) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays >= MAX_INACTIVITY_DAYS) {
      Cookies.remove("authToken"); // Remove auth token
      Cookies.remove("lastActivity"); // Remove last activity
      toast.warn("You have been logged out due to inactivity.");
      window.location.href = "/login"; // Redirect to login page
    }
  }
};

const updateLastActivity = () => {
  const currentDate = new Date().toISOString();
  Cookies.set("lastActivity", currentDate, { expires: MAX_INACTIVITY_DAYS });
};

export const UserContext = createContext();
// Export fetchToken function
export const fetchToken = async () => {
  console.log("Fetching token...");
  console.log("auth.currentUser:", auth.currentUser); // Debug log
  if (!auth.currentUser) {
    console.warn("No current user found. Redirecting to login...");
    return null;
  }
  try {
    const token = await auth.currentUser.getIdToken();
    Cookies.set("authToken", token); // Store token in cookies for API requests
    console.log("Token fetched successfully:", token);
    return token;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Helper to fetch role from backend if missing
  const fetchAndSetUserRole = async (email) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/users/role?email=${encodeURIComponent(email)}`
      );
      if (!response.ok)
        throw new Error("Failed to fetch user role from backend");
      const data = await response.json();
      Cookies.set("userRole", data.role, { expires: 7 });
      setUser((prevUser) => ({ ...prevUser, role: data.role }));
    } catch (err) {
      console.error("Error fetching backend role:", err);
    }
  };

  // Helper to refresh user role from cookie (for role change)
  const refreshUserRole = () => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      const backendRole = Cookies.get("userRole");
      return {
        ...prevUser,
        role: backendRole,
      };
    });
  };

  const login = (userData) => {
    // Always get the latest role from cookie (set after backend login)
    const backendRole = Cookies.get("userRole");
    setUser({
      ...userData,
      avatar: userData.avatar || "/assets/Others/VERT_user.webp",
      role: backendRole, // Always use backend/cookie role
    });
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const checkRedirectResult = async () => {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const user = result.user;
        const backendRole = Cookies.get("userRole");
        setUser({
          name: user.displayName,
          email: user.email,
          avatar: user.photoURL || "/assets/Others/VERT_user.webp",
          role: backendRole, // Always use backend/cookie role
        });
      }
    } catch (error) {
      console.error("Error handling redirect result:", error);
    }
  };
  useEffect(() => {
    checkInactivityAndLogout();
    const handleActivity = () => {
      updateLastActivity();
    };
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    const token = Cookies.get("authToken");
    if (token) {
      setUser((prevUser) => ({
        ...prevUser,
        token,
      }));
    }
    const fetchAndSyncUser = async (currentUser) => {
      if (currentUser) {
        const token = await currentUser.getIdToken();
        Cookies.set("authToken", token); // Store token in cookies
        let userRole;
        // Always fetch latest role from backend
        if (currentUser.email) {
          try {
            const response = await fetch(
              `${import.meta.env.VITE_BACKEND_URL}/api/users/role?email=${encodeURIComponent(currentUser.email)}`
            );
            if (!response.ok) throw new Error("Failed to fetch user role from backend");
            const data = await response.json();
            userRole = data.role;
            Cookies.set("userRole", userRole, { expires: 7 });
          } catch (err) {
            console.error("Error fetching user role from backend:", err);
            userRole = Cookies.get("userRole") || (user && user.role) || "member";
          }
        }
        setUser(currentUser ? {
          uid: currentUser.uid, // Add this line to include Firebase UID
          firebase_uid: currentUser.uid,
          name: currentUser.displayName,
          email: currentUser.email,
          avatar: currentUser.photoURL || "/assets/Others/VERT_user.webp",
          token: currentUser.accessToken || currentUser.stsTokenManager.accessToken,
          role: userRole, // Always use backend/cookie/last-known role
        } : null);
      } else {
        checkRedirectResult();
      }
      setLoading(false); // Stop loading after auth state is determined
    };
    const unsubscribe = auth.onAuthStateChanged(fetchAndSyncUser);
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      unsubscribe();
    };
  }, []);

  // Fetch latest role from backend on every route change
  useEffect(() => {
    const fetchLatestRole = async () => {
      if (user && user.email) {
        try {
          const response = await fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/users/role?email=${encodeURIComponent(user.email)}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.role && data.role !== user.role) {
              Cookies.set("userRole", data.role, { expires: 7 });
              setUser((prevUser) => ({ ...prevUser, role: data.role }));
            }
          }
        } catch (err) {
          console.error(
            "Error fetching latest user role on route change:",
            err
          );
        }
      }
    };
    fetchLatestRole();
    // eslint-disable-next-line
  }, [location.pathname]);

  // Listen for roleChanged event and refresh user role
  useEffect(() => {
    const handleRoleChange = () => {
      if (typeof refreshUserRole === "function") refreshUserRole();
    };
    window.addEventListener("roleChanged", handleRoleChange);
    return () => window.removeEventListener("roleChanged", handleRoleChange);
  }, []);

  // Update user profile (name, photo, email)
  const updateUserProfile = async (name, photoURL, email) => {
    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photoURL || "/assets/Others/VERT_user.webp",
      });
      // Update the user's email if provided and different from the current email
      if (email && email !== auth.currentUser.email) {
        await updateEmailAddress(email);
        console.log("Email updated successfully");
      }
      console.log("Profile updated successfully");
      setUser((prevUser) => ({
        ...prevUser,
        name: name || prevUser.name,
        avatar: photoURL || "/assets/Others/VERT_user.webp",
        email: email || prevUser.email,
      }));
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // if (loading) {
  //   return <div>Loading...</div>; // Show a loading indicator while determining auth state
  // }

  // console.log("Google Sign-In Result:", result);
  // console.log("User Photo URL:", result.user.photoURL);
  return (
    <UserContext.Provider
      value={{
        user,
        login,
        updateUserProfile,
        fetchToken,
        logout,
        setUser,
        refreshUserRole,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
