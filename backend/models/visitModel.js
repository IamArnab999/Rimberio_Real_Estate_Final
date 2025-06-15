import pool from "../config/mysqlConfig.js";

// Visit-related functions
export const addVisit = async (visit) => {
  const {
    property_id,
    property_name,
    propertyImage,
    imageUrl, // new
    mapUrl,   // new
    location,
    price,
    beds,
    baths,
    sqft,
    date,
    time,
    firebase_uid,
    user_name,
    user_email,
    status,
    lat = null,
    lng = null,
  } = visit;
  if (!property_id) {
    throw new Error("property_id is required and cannot be null");
  }
  const [result] = await pool.query(
    `INSERT INTO visits 
      (firebase_uid,
      property_id,
      property_name,
      location,
      price,
      status,
      beds,
      baths,
      sqft,
      propertyImage,
      imageUrl,
      mapUrl,
      user_name,
      user_email,
      date,
      time,
      lat,
      lng)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [firebase_uid, property_id, property_name, location, price, status, beds, baths, sqft, propertyImage, imageUrl, mapUrl, user_name, user_email, date, time, lat, lng]
  );
  return result.insertId;
};

export const getVisitsByUser = async (firebase_uid) => {
  const [rows] = await pool.query(
    `SELECT * FROM visits WHERE firebase_uid = ? ORDER BY date DESC, time DESC`,
    [firebase_uid]
  );
  return rows;
};

export const deleteVisitById = async (id) => {
  const [result] = await pool.query(
    `DELETE FROM visits WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

export const deleteAllVisitsByUser = async (firebase_uid) => {
  const [result] = await pool.query(
    `DELETE FROM visits WHERE firebase_uid = ?`,
    [firebase_uid]
  );
  return result.affectedRows > 0;
};

export const getAllVisitsWithUser = async () => {
  const [rows] = await pool.query(
    `SELECT v.*, u.name as user_name, u.avatar as user_avatar, u.is_google, u.is_guest
     FROM visits v
     LEFT JOIN users u ON v.firebase_uid = u.firebase_uid
     ORDER BY v.date DESC, v.time DESC`
  );
  return rows;
};
