-- =========================
-- 10. Notifications Table
-- =========================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(128) NOT NULL,
    notification_id VARCHAR(16) NOT NULL UNIQUE,
    date DATE NOT NULL,
    message TEXT NOT NULL,
    status ENUM('Unread', 'Read') DEFAULT 'Unread',
    created_at DATETIME NOT NULL
);

ALTER TABLE notifications MODIFY notification_id VARCHAR(64);
ALTER TABLE notifications ADD COLUMN property_name VARCHAR(255) DEFAULT NULL;
SELECT * FROM notifications;