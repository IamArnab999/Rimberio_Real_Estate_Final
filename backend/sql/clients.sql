-- =========================
-- 1. Clients Table
-- =========================

CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(15),
    status VARCHAR(50),
    type VARCHAR(50),
    last_activity DATETIME
);

SELECT * FROM clients;