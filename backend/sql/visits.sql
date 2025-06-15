-- =========================
-- 8. Visits Table
-- =========================

CREATE TABLE IF NOT EXISTS visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(255) NOT NULL,
    property_id VARCHAR(32) NOT NULL,
    property_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    price VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    beds VARCHAR(16),
    baths VARCHAR(16),
    sqft VARCHAR(32),
    propertyImage VARCHAR(512),
    imageUrl VARCHAR(512), -- new: property image url
    mapUrl VARCHAR(512),   -- new: property map url
    user_name VARCHAR(128) NOT NULL,
    user_email VARCHAR(128) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(16) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE visits ADD COLUMN lat DOUBLE, ADD COLUMN lng DOUBLE;
ALTER TABLE visits
  ADD COLUMN imageUrl VARCHAR(255),
  ADD COLUMN mapUrl VARCHAR(255);
-- Remove lat/lng columns if they exist
-- ALTER TABLE visits DROP COLUMN lat; 
-- ALTER TABLE visits DROP COLUMN lng;

SELECT * FROM visits;