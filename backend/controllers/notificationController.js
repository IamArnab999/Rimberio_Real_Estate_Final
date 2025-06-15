import {
  addNotification,
  getNotificationsByUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationById,
  deleteAllNotificationsByUser
} from "../models/mysqlModel.js";
import { getUnreadCountByUser } from "../models/notificationModel.js";

// Add a new notification
export const createNotification = async (req, res) => {
  const { notification_id, firebase_uid, message, status = "Unread", created_at, date, property_name = null } = req.body;
  if (!notification_id || !firebase_uid || !message || !created_at || !date) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const id = await addNotification({ notification_id, firebase_uid, message, status, created_at, date, property_name });
    res.status(201).json({ id, notification_id, firebase_uid, message, status, created_at, date, property_name });
  } catch (err) {
    console.error("Error adding notification:", err);
    res.status(500).json({ message: "Failed to add notification" });
  }
};

// Get all notifications for a user
export const getUserNotifications = async (req, res) => {
  const { firebase_uid } = req.params;
  try {
    const notifications = await getNotificationsByUser(firebase_uid);
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  const { notification_id } = req.params;
  try {
    const success = await markNotificationAsRead(notification_id);
    if (success) {
      res.status(200).json({ message: "Notification marked as read" });
    } else {
      res.status(404).json({ message: "Notification not found" });
    }
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

// Mark all notifications as read for a user
export const markAllAsRead = async (req, res) => {
  const { firebase_uid } = req.params;
  try {
    const count = await markAllNotificationsAsRead(firebase_uid);
    res.status(200).json({ message: `${count} notifications marked as read` });
  } catch (err) {
    console.error("Error marking all as read:", err);
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};

// Delete a single notification by notification_id
export const deleteNotification = async (req, res) => {
  const { notification_id } = req.params;
  try {
    const success = await deleteNotificationById(notification_id);
    if (success) {
      res.status(200).json({ message: "Notification deleted successfully" });
    } else {
      res.status(404).json({ message: "Notification not found" });
    }
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

// Delete all notifications for a user
export const deleteAllNotifications = async (req, res) => {
  const { firebase_uid } = req.params;
  try {
    const success = await deleteAllNotificationsByUser(firebase_uid);
    if (success) {
      res.status(200).json({ message: "All notifications deleted successfully" });
    } else {
      res.status(404).json({ message: "No notifications found for user" });
    }
  } catch (err) {
    console.error("Error deleting all notifications:", err);
    res.status(500).json({ message: "Failed to delete all notifications" });
  }
};

// Get unread notification count for a user
export const getUnreadNotificationCount = async (req, res) => {
  const { firebase_uid } = req.params;
  try {
    const count = await getUnreadCountByUser(firebase_uid);
    res.json({ unreadCount: count });
  } catch (err) {
    console.error("Error fetching unread notification count:", err);
    res.status(500).json({ message: "Failed to fetch unread notification count" });
  }
};
