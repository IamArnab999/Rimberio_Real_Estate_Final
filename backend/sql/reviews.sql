-- =========================
-- 4. Reviews Table
-- =========================

CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(128) NOT NULL,
    avatar VARCHAR(255) NOT NULL,
    user_name VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    review TEXT NOT NULL,
    rating INT NOT NULL,
    images TEXT, -- JSON array of image URLs
    image_blob LONGBLOB,
    helpfulYes INT DEFAULT 0,
    helpfulNo INT DEFAULT 0,
    verified BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM reviews;