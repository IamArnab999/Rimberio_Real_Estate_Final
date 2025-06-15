import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { useNotification } from "../components/NotificationContext.jsx";

const getStatusColor = (status) => {
  return status === "Unread"
    ? "bg-yellow-100 text-yellow-800"
    : "bg-gray-100 text-gray-800";
};

export function Notifications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refreshUnreadCount } = useNotification();

  useEffect(() => {
    // Get user_id from authToken cookie (set by login/register)
    const token = Cookies.get("authToken");
    let userId = null;
    if (token) {
      const decoded = jwtDecode(token);
      userId = decoded.id || decoded.user_id || decoded.uid; // adjust to your JWT payload
    }

    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications/user/${userId}`
        );
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.notification_id
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Handler to mark a notification as read
  const handleMarkAsRead = async (notification_id) => {
    try {
      await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/notifications/${notification_id}/read`,
        {
          method: "PATCH",
        }
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notification_id ? { ...n, status: "Read" } : n
        )
      );
      refreshUnreadCount();
    } catch (err) {
      // Optionally handle error
    }
  };

  // Handler to delete all notifications
  const handleDeleteAll = async () => {
    // Optionally: Add a confirmation dialog here
    const token = Cookies.get("authToken");
    let userId = null;
    if (token) {
      const decoded = jwtDecode(token);
      userId = decoded.id || decoded.user_id || decoded.uid;
    }
    if (!userId) {
      setNotifications([]);
      return;
    }
    try {
      // Call the backend to delete all notifications for this user
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/user/${userId}`,
        {
          method: "DELETE",
        }
      );
      setNotifications([]);
      refreshUnreadCount();
    } catch (err) {
      // Optionally handle error
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex-1 space-y-6 p-6 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="mt-4 md:mt-12 text-2xl md:text-3xl font-bold text-blue-700 tracking-tight">
              Notifications
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              View your notification history
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="border border-gray-300 rounded px-3 py-2 text-xs md:text-base flex items-center bg-white hover:bg-blue-50 transition-colors duration-150 shadow"
              onClick={() => window.location.reload()}
            >
              <span className="mr-2">↻</span>
              Refresh
            </button>
            <button
              className="border border-gray-300 rounded px-3 py-2 text-xs md:text-base flex items-center bg-white hover:bg-blue-50 transition-colors duration-150 shadow"
              onClick={handleDeleteAll}
            >
              <span className="mr-2">🗑️</span>
              Delete All Notifications
            </button>
          </div>
        </div>

        {/* Search and Table Section */}
        <div className="border rounded-xl shadow-lg bg-white">
          <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-base md:text-xl font-semibold text-blue-600">
              Notification History
            </h2>
            <div className="w-full md:w-64">
              <input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded px-3 py-2 text-xs md:text-base focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Table Section for Desktop */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 md:px-4 py-2 border text-left text-xs md:text-base">
                    Notification ID
                  </th>
                  <th className="px-2 md:px-4 py-2 border text-left text-xs md:text-base">
                    Date
                  </th>
                  <th className="px-2 md:px-4 py-2 border text-left text-xs md:text-base">
                    Message
                  </th>
                  <th className="px-2 md:px-4 py-2 border text-left text-xs md:text-base">
                    Status
                  </th>
                  <th className="px-2 md:px-4 py-2 border"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="h-24 text-center text-xs md:text-base"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <tr
                      key={notification.notification_id}
                      className="hover:bg-blue-50 transition-colors duration-100"
                    >
                      <td className="px-2 md:px-4 py-2 border text-xs md:text-base font-medium">
                        {notification.notification_id}
                      </td>
                      <td className="px-2 md:px-4 py-2 border text-xs md:text-base">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-2 md:px-4 py-2 border text-xs md:text-base">
                        {notification.message}
                        {notification.property_name && (
                          <span className="block text-xs text-blue-600 mt-1 font-semibold">
                            Property: {notification.property_name}
                          </span>
                        )}
                      </td>
                      <td className="px-2 md:px-4 py-2 border">
                        <span
                          className={`px-2 py-1 rounded text-xs md:text-sm font-medium ${getStatusColor(
                            notification.status
                          )}`}
                        >
                          {notification.status}
                        </span>
                      </td>
                      <td className="px-2 md:px-4 py-2 border text-center">
                        <button
                          className="border rounded px-2 py-1 text-xs md:text-sm bg-white hover:bg-blue-50 transition-colors duration-150 shadow"
                          onClick={() =>
                            handleMarkAsRead(notification.notification_id)
                          }
                          disabled={notification.status === "Read"}
                        >
                          Mark as Read
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="h-24 text-center text-xs md:text-base"
                    >
                      No notifications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Card layout for Mobile */}
          <div className="flex flex-col gap-4 sm:hidden p-4">
            {loading ? (
              <div className="text-center text-xs py-8">Loading...</div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.notification_id}
                  className="border rounded-lg p-4 shadow bg-blue-50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-bold text-blue-700 text-xs">
                      {notification.notification_id}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        notification.status
                      )}`}
                    >
                      {notification.status}
                    </span>
                  </div>
                  <div className="text-gray-600 text-xs mb-1">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-gray-800 text-xs mb-2">
                    {notification.message}
                    {notification.property_name && (
                      <span className="block text-xs text-blue-600 mt-1 font-semibold">
                        Property: {notification.property_name}
                      </span>
                    )}
                  </div>
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs mt-2 disabled:opacity-50"
                    onClick={() =>
                      handleMarkAsRead(notification.notification_id)
                    }
                    disabled={notification.status === "Read"}
                  >
                    Mark as Read
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No notifications found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
