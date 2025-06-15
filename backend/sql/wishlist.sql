-- =========================
-- 7. Wishlist Table
-- =========================
CREATE TABLE IF NOT EXISTS wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id VARCHAR(32) NOT NULL,
  property_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  price VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL,
  beds VARCHAR(16),
  baths VARCHAR(16),
  sqft VARCHAR(32),
  user_name VARCHAR(128) NOT NULL,
  user_email VARCHAR(128) NOT NULL,
  image_url VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_property_user (property_id, user_email)
);

DROP TABLE wishlist;
SELECT * FROM wishlist;