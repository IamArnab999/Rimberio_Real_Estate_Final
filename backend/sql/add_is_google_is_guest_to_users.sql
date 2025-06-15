-- Add is_google and is_guest columns to users table
ALTER TABLE users
  ADD COLUMN is_google TINYINT(1) DEFAULT 0,
  ADD COLUMN is_guest TINYINT(1) DEFAULT 0;
