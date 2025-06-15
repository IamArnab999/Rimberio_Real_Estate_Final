-- =========================
-- 2. Users Table
-- =========================
USE REAL_ESTATE_DB;
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('member', 'admin', 'owner') NOT NULL,
    avatar VARCHAR(255),
    avatar_blob LONGBLOB,
    joined_at DATETIME NOT NULL,
    last_active DATETIME NOT NULL,
    is_google VARCHAR(255) NOT NULL DEFAULT '0',
    is_guest VARCHAR(255) NOT NULL DEFAULT '0',
    dashboard_enabled BOOLEAN NOT NULL DEFAULT 0
);
ALTER TABLE users MODIFY role ENUM('member', 'admin', 'owner', 'guest') NOT NULL;
ALTER TABLE users MODIFY last_active VARCHAR(32) NOT NULL;
SELECT * FROM users;

ALTER TABLE users ADD COLUMN dashboard_enabled BOOLEAN NOT NULL DEFAULT 0;


ALTER TABLE users MODIFY role ENUM('member', 'admin', 'owner', 'guest') NOT NULL;