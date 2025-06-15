import pool from "../config/mysqlConfig.js";

// User-related functions
export const getUsers = async () => {
  const [rows] = await pool.query("SELECT * FROM users");
  return rows;
};

export const addUser = async (user) => {
  const { firebase_uid, name, email, role, avatar, joined_at, last_active } = user;
  const [result] = await pool.query(
    "INSERT INTO users (firebase_uid, name, email, role, avatar, joined_at, last_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [firebase_uid, name, email, role, avatar, joined_at, last_active]
  );
  return result.insertId;
};

export const addOrUpdateUser = async (user) => {
  const {
    firebase_uid, name, email, avatar, role,
    joined_at, last_active, provider, is_guest, is_google
  } = user;
  await pool.query(
    `INSERT INTO users (firebase_uid, name, email, avatar, role, joined_at, last_active, provider, is_guest, is_google)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       avatar = VALUES(avatar),
       role = VALUES(role),
       last_active = VALUES(last_active),
       provider = VALUES(provider),
       is_guest = VALUES(is_guest),
       is_google = VALUES(is_google)`,
    [firebase_uid, name, email, avatar, role, joined_at, last_active, provider, is_guest, is_google]
  );
};

export const saveUserAvatar = async (firebase_uid, avatarBlob) => {
  await pool.query(
    "UPDATE users SET avatar_blob = ? WHERE firebase_uid = ?",
    [avatarBlob, firebase_uid]
  );
};

export const getUserAvatar = async (firebase_uid) => {
  const [rows] = await pool.query(
    "SELECT avatar_blob FROM users WHERE firebase_uid = ?",
    [firebase_uid]
  );
  return rows[0]?.avatar_blob || null;
};

// Update the image field in user_settings for a given firebase_uid
export const updateUserImage = async (firebase_uid, imageUrl) => {
  await pool.query(
    "UPDATE user_settings SET image = ?, updated_at = CURRENT_TIMESTAMP WHERE firebase_uid = ?",
    [imageUrl, firebase_uid]
  );
};
