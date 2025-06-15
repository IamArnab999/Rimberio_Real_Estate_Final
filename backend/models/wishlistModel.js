import pool from "../config/mysqlConfig.js";

// Wishlist-related functions
export const getWishlistItems = async () => {
  const [rows] = await pool.query("SELECT * FROM wishlist ORDER BY id ASC");
  return rows;
};

export const addWishlistItem = async (item) => {
  const {
    property_id, property_name, location, price, status, beds, baths, sqft, user_name, user_email, image_url
  } = item;
  // Check for existing wishlist item for this property and user
  const [existing] = await pool.query(
    `SELECT id FROM wishlist WHERE property_id = ? AND user_email = ?`,
    [property_id, user_email]
  );
  if (existing.length > 0) {
    // Already exists, do not insert duplicate
    return null;
  }
  const [result] = await pool.query(
    `INSERT INTO wishlist 
      (property_id, property_name, location, price, status, beds, baths, sqft, user_name, user_email, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [property_id, property_name, location, price, status, beds, baths, sqft, user_name, user_email, image_url]
  );
  return result.insertId;
};
