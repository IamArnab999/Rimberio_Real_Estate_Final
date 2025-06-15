import express from "express";
import { addWishlistItem,getWishlistItems } from "../models/mysqlModel.js";
import pool from "../config/mysqlConfig.js";
const router = express.Router();



// GET all wishlist items
router.get("/", async (req, res) => {
  try {
    const rows = await getWishlistItems();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

// Add image_url to wishlist table if not present
router.get("/init-table", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        property_id VARCHAR(32) NOT NULL,
        property_name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        price VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL,
        beds VARCHAR(16),
        baths VARCHAR(16),
        sqft VARCHAR(32),
        user_name VARCHAR(128) NOT NULL,
        user_email VARCHAR(128) NOT NULL,
        image_url VARCHAR(512),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Remove this line for MySQL compatibility (handled by CREATE TABLE above)
    // await pool.query(`ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS image_url VARCHAR(512)`);
    res.json({ success: true, message: "Wishlist table ensured with image_url." });
  } catch (err) {
    res.status(500).json({ error: "Failed to create/alter wishlist table" });
  }
});

// Update addWishlistItem to store image_url
router.post("/", async (req, res) => {
    const item = req.body;
    try {
        const {
          property_id, property_name, location, price, status, beds, baths, sqft, user_name, user_email, image_url
        } = item;
        // Validate required fields
        if (!property_id || !property_name || !location || !price || !status || !beds || !baths || !sqft || !user_name || !user_email || !image_url) {
          return res.status(400).json({ error: "Missing required fields in wishlist item." });
        }
        await addWishlistItem(item);
        res.json({ success: true, message: "Wishlist item saved!" });
    } catch (err) {
        if (err && err.code === 'ER_DUP_ENTRY') {
          return res.status(200).json({ success: false, message: "Wishlist item already exists for this property and user." });
        }
        console.error("Error saving wishlist item:", err);
        res.status(500).json({ error: "Failed to save wishlist item" });
    }
});

// Delete from wishlist
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query("DELETE FROM wishlist WHERE property_id = ?", [id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete wishlist item" });
    }
  });
  
  // Reorder wishlist (update position/order)
  router.put("/reorder", async (req, res) => {
    const { items } = req.body;
    try {
      for (const { id, order } of items) {
        await pool.query("UPDATE wishlist SET position = ? WHERE property_id = ?", [order, id]);
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to reorder wishlist" });
    }
  });
  
  // Delete all wishlist items
router.delete("/", async (req, res) => {
  try {
    await pool.query("DELETE FROM wishlist");
    res.json({ success: true, message: "All wishlist items deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete all wishlist items" });
  }
});

export default router;