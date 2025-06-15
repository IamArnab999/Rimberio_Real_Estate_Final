import pool from "../config/mysqlConfig.js";

// Notification-related functions
export const addNotification = async (notification) => {
  let { notification_id, firebase_uid, message, status = 'Unread', created_at, date, property_name = null } = notification;
  // Ensure notification_id does not exceed 64 chars
  if (typeof notification_id === 'string' && notification_id.length > 64) {
    notification_id = notification_id.slice(0, 64);
  }
  const [result] = await pool.query(
    `INSERT INTO notifications (notification_id, firebase_uid, date, message, status, created_at, property_name)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [notification_id, firebase_uid, date, message, status, created_at, property_name]
  );
  return result.insertId;
};

export const getNotificationsByUser = async (firebase_uid) => {
  const [rows] = await pool.query(
    `SELECT * FROM notifications WHERE firebase_uid = ? ORDER BY created_at DESC`,
    [firebase_uid]
  );
  return rows;
};

export const deleteNotificationById = async (notification_id) => {
  const [result] = await pool.query(
    `DELETE FROM notifications WHERE notification_id = ?`,
    [notification_id]
  );
  return result.affectedRows > 0;
};

export const deleteAllNotificationsByUser = async (firebase_uid) => {
  const [result] = await pool.query(
    `DELETE FROM notifications WHERE firebase_uid = ?`,
    [firebase_uid]
  );
  return result.affectedRows > 0;
};

export const markAllNotificationsAsRead = async (firebase_uid) => {
  const [result] = await pool.query(
    `UPDATE notifications SET status = 'Read' WHERE firebase_uid = ? AND status = 'Unread'`,
    [firebase_uid]
  );
  return result.affectedRows;
};

export const markNotificationAsRead = async (notification_id) => {
  const [result] = await pool.query(
    `UPDATE notifications SET status = 'Read' WHERE notification_id = ? AND status = 'Unread'`,
    [notification_id]
  );
  return result.affectedRows > 0;
};

export const getUnreadCountByUser = async (firebase_uid) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count FROM notifications WHERE firebase_uid = ? AND status = 'Unread'`,
    [firebase_uid]
  );
  return rows[0]?.count || 0;
};
