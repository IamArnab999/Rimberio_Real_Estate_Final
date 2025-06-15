-- backend/sql/properties.sql
CREATE TABLE IF NOT EXISTS real_estate_db.properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(128) NOT NULL , -- Firebase user ID for authentication
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role ENUM('member', 'admin', 'owner') NOT NULL,
    title VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    beds VARCHAR(16),
    baths VARCHAR(16),
    sqft VARCHAR(32),
    price VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    mapUrl VARCHAR(512),
    imageUrl VARCHAR(512) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from properties;

