-- =========================
-- 3. Chat History Table
-- =========================

CREATE TABLE IF NOT EXISTS chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(100),
    chat_time DATETIME NOT NULL,
    user_message TEXT,
    bot_reply TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
drop table chat_history;
SELECT * FROM chat_history;