-- settings.sql
-- Table for user settings (profile info)
CREATE TABLE IF NOT EXISTS user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(128) NOT NULL UNIQUE,
    first_name VARCHAR(64),
    last_name VARCHAR(64),
    email VARCHAR(128) NOT NULL UNIQUE,
    image VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS user_settings;
SELECT * FROM user_settings;
-- Recreate the user_settings table 


-- Index for quick lookup
CREATE INDEX idx_user_settings_firebase_uid ON user_settings(firebase_uid);
CREATE INDEX idx_user_settings_email ON user_settings(email);
