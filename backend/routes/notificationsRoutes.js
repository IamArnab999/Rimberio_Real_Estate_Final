import express from "express";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead
} from "../controllers/mysqlController.js";
import { getUnreadNotificationCount, deleteAllNotifications } from "../controllers/notificationController.js";

const router = express.Router();

// Get all notifications for a user
router.get("/user/:firebase_uid", getUserNotifications);

// Get unread notification count for a user
router.get("/user/:firebase_uid/unread-count", getUnreadNotificationCount);

// Create a new notification
router.post("/", createNotification);

// Mark a notification as read
router.patch( "/:notification_id/read", markAsRead);

// Mark all notifications as read for a user
router.patch("/user/:firebase_uid/readall", markAllAsRead);

// Delete all notifications for a user
router.delete("/user/:firebase_uid", deleteAllNotifications);

export default router;
