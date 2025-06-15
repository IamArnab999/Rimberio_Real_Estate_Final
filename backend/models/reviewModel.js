import pool from "../config/mysqlConfig.js";

// Review-related functions
export const addReview = async (review) => {
  const {
    firebase_uid,
    avatar,
    user_name,
    title,
    review: reviewText,
    rating,
    images,
  } = review;
  const [result] = await pool.query(
    `INSERT INTO reviews 
      (firebase_uid, avatar, user_name, title, review, rating, images) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [firebase_uid, avatar, user_name, title, reviewText, rating, images]
  );
  return result.insertId;
};

export const getReviews = async () => {
  const [rows] = await pool.query("SELECT * FROM reviews ORDER BY created_at DESC");
  return rows;
};

export const deleteReview = async (reviewId) => {
  const [result] = await pool.query(
    "DELETE FROM reviews WHERE id = ?",
    [reviewId]
  );
  return result.affectedRows > 0;
};

export const deleteAllReviews = async () => {
  const [result] = await pool.query(
    "DELETE FROM reviews"
  );
  return result.affectedRows > 0;
};

export const updateReviewHelpfulness = async (reviewId, type) => {
  let column;
  if (type === "yes") {
    column = "helpfulYes";
  } else if (type === "no") {
    column = "helpfulNo";
  } else {
    throw new Error("Invalid helpfulness type");
  }
  const [result] = await pool.query(
    `UPDATE reviews SET ${column} = IFNULL(${column}, 0) + 1 WHERE id = ?`,
    [reviewId]
  );
  return result.affectedRows > 0;
};

export const updateReviewVerification = async (reviewId, verified = true) => {
  const [result] = await pool.query(
    `UPDATE reviews SET verified = ? WHERE id = ?`,
    [verified, reviewId]
  );
  return result.affectedRows > 0;
};
