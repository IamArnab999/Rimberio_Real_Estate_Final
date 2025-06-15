import pool from "../config/mysqlConfig.js";

// Newsletter-related functions
export const addOrUpdateNewsletterSubscriber = async (email) => {
  await pool.query(
    `INSERT INTO newsletter_subscribers (email, subscribed, subscribed_at, unsubscribed_at)
     VALUES (?, true, NOW(), NULL)
     ON DUPLICATE KEY UPDATE subscribed = true, subscribed_at = NOW(), unsubscribed_at = NULL`,
    [email]
  );
};

export const unsubscribeNewsletter = async (email) => {
  await pool.query(
    `UPDATE newsletter_subscribers SET subscribed = false, unsubscribed_at = NOW() WHERE email = ?`,
    [email]
  );
};

export const getActiveNewsletterSubscribers = async () => {
  const [rows] = await pool.query(
    `SELECT email FROM newsletter_subscribers WHERE subscribed = true`
  );
  return rows.map(r => r.email);
};

export const getAllNewsletterSubscriptions = async () => {
  const [rows] = await pool.query(
    `SELECT n.email, n.subscribed_at as date, u.name as user_name, u.avatar as user_avatar, u.is_google, u.is_guest
     FROM newsletter_subscribers n
     LEFT JOIN users u ON n.email = u.email
     WHERE n.subscribed = true
     ORDER BY n.subscribed_at DESC`
  );
  return rows;
};
