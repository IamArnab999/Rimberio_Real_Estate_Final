import pool from "../config/mysqlConfig.js";

// Payment-related functions
export const addPayment = async (payment) => {
  const {
    firebase_uid, // Firebase UID
    user_email,
    property_name,
    imageUrl,
    user_name,
    phone,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    currency,
    payment_status,
  } = payment;
  const [result] = await pool.query(
    `INSERT INTO payments 
      (firebase_uid, user_email, property_name, imageUrl, user_name, phone, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      firebase_uid,
      user_email,
      property_name,
      imageUrl,
      user_name,
      phone,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      currency,
      payment_status
    ]
  );
  return result.insertId;
};

export const cancelPayment = async (razorpay_payment_id) => {
  const [result] = await pool.query(
    "UPDATE payments SET payment_status = 'failed' WHERE razorpay_payment_id = ?",
    [razorpay_payment_id]
  );
  return result.affectedRows > 0;
};

export const getPayment = async ({ razorpay_payment_id, razorpay_order_id }) => {
  let query = "SELECT * FROM payments WHERE ";
  let params = [];
  if (razorpay_payment_id) {
    query += "razorpay_payment_id = ?";
    params.push(razorpay_payment_id);
  } 
  else if (razorpay_order_id) 
  {
    query += "razorpay_order_id = ?";
    params.push(razorpay_order_id);
  } 
  else 
  {
    throw new Error("Payment ID or Order ID required");
  }
  const [rows] = await pool.query(query, params);
  return rows[0] || null;
};

// Given a Razorpay payment ID, return the property image URL associated with the payment
export const getPropertyImageByPaymentId = async (razorpay_payment_id) => {
  // Now that imageUrl is in the payments table, just fetch it directly
  const [rows] = await pool.query(
    `SELECT imageUrl FROM payments WHERE razorpay_payment_id = ? LIMIT 1`,
    [razorpay_payment_id]
  );
  return rows.length > 0 ? rows[0].imageUrl : null;
};
