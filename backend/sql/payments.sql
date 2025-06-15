-- =========================
-- 5. Payments Table
-- =========================

CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(128) NOT NULL,
    user_email VARCHAR(128) NOT NULL,
    property_name VARCHAR(255) NOT NULL,
    imageUrl VARCHAR(512) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    razorpay_order_id VARCHAR(100) NOT NULL,
    razorpay_payment_id VARCHAR(100) NOT NULL,
    razorpay_signature VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    payment_status ENUM('success', 'failed', 'pending') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM payments;