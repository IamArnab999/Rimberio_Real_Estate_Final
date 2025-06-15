import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    setLoading(true);
    const token = Cookies.get("authToken");
    let userId = null;
    if (token) {
      const decoded = jwtDecode(token);
      userId = decoded.id || decoded.user_id || decoded.uid;
    }
    if (!userId) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/user/${userId}/unread-count`
      );
      const data = await res.json();
      setUnreadCount(data.unreadCount || 0);
    } catch {
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, loading, refreshUnreadCount: fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}
