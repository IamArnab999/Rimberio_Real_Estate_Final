-- =========================
-- 6. Support Tickets Table
-- =========================

CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(32) NOT NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    avatar VARCHAR(512),
    property_name VARCHAR(255),
    message TEXT,
    emoji VARCHAR(16),
    created_at DATETIME NOT NULL
);

SELECT * FROM support_tickets;