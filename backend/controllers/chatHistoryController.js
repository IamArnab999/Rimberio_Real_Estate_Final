import db from "../config/mysqlConfig.js";
import fetch from "node-fetch";
import PDFDocument from "pdfkit";

const BACKEND_URL = process.env.VITE_BACKEND_URL  || "http://localhost:5000";

// Save a chat message
export const saveChatMessage = async (req, res) => {
  try {
    const { firebase_uid, name, role, chat_time, user_message } = req.body;
    console.log("[saveChatMessage] firebase_uid:", firebase_uid, "user_message:", user_message);
    if (!firebase_uid || !user_message) {
      return res.status(400).json({ error: "firebase_uid and user_message are required" });
    }
    // Call Gemini API to get bot reply
    const geminiRes = await fetch(`${BACKEND_URL}/api/gemini-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: user_message, user: { firebase_uid, name, role } })
    });
    if (!geminiRes.ok) {
      throw new Error("Failed to get bot reply from Gemini API");
    }
    const geminiData = await geminiRes.json();
    const bot_reply = geminiData.reply || "";
    // Save both user_message and bot_reply to DB
    const [result] = await db.query(
      "INSERT INTO chat_history (firebase_uid, name, role, chat_time, user_message, bot_reply) VALUES (?, ?, ?, ?, ?, ?)",
      [firebase_uid, name, role, chat_time, user_message, bot_reply]
    );
    console.log("[saveChatMessage] Insert result:", result);
    res.status(201).json({ success: true, bot_reply });
  } catch (err) {
    console.error("Error saving chat message:", err);
    res.status(500).json({ error: "Failed to save chat message" });
  }
};

// Fetch chat history for a user or all (admin/owner)
export const getChatHistory = async (req, res) => {
  try {
    const { firebase_uid, role, type } = req.query;
    console.log("[getChatHistory] firebase_uid:", firebase_uid, "role:", role, "type:", type);
    let rows;
    if (role === "admin" || role === "owner") {
      if (type === "member") {
        // Only member chats
        [rows] = await db.query(
          "SELECT * FROM chat_history WHERE role = 'member' ORDER BY chat_time ASC"
        );
      } else if (type === "admin") {
        // Only admin chats
        [rows] = await db.query(
          "SELECT * FROM chat_history WHERE role = 'admin' ORDER BY chat_time ASC"
        );
      } else {
        // All chats (default)
        [rows] = await db.query(
          "SELECT * FROM chat_history ORDER BY chat_time ASC"
        );
      }
    } else if (firebase_uid) {
      // Member: fetch only their own chat history
      [rows] = await db.query(
        "SELECT * FROM chat_history WHERE firebase_uid = ? ORDER BY chat_time ASC",
        [firebase_uid]
      );
    } else {
      return res.status(400).json({ error: "Missing firebase_uid or role" });
    }
    res.json(rows);
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

// Clear chat history for a user
export const clearChatHistory = async (req, res) => {
  try {
    const { firebase_uid } = req.body;
    await db.query("DELETE FROM chat_history WHERE firebase_uid = ?", [firebase_uid]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error clearing chat history:", err);
    res.status(500).json({ error: "Failed to clear chat history" });
  }
};

// Export chat history as JSON
export const exportChatHistoryJson = async (req, res) => {
  try {
    const { firebase_uid, role, type } = req.query;
    let rows;
    if (role === "admin" || role === "owner") {
      if (type === "member") {
        [rows] = await db.query(
          "SELECT * FROM chat_history WHERE role = 'member' ORDER BY chat_time ASC"
        );
      } else if (type === "admin") {
        [rows] = await db.query(
          "SELECT * FROM chat_history WHERE role = 'admin' ORDER BY chat_time ASC"
        );
      } else {
        [rows] = await db.query(
          "SELECT * FROM chat_history ORDER BY chat_time ASC"
        );
      }
    } else if (firebase_uid) {
      [rows] = await db.query(
        "SELECT * FROM chat_history WHERE firebase_uid = ? ORDER BY chat_time ASC",
        [firebase_uid]
      );
    } else {
      return res.status(400).json({ error: "Missing firebase_uid or role" });
    }
    res.setHeader("Content-Disposition", "attachment; filename=chat_history.json");
    res.setHeader("Content-Type", "application/json");
    res.json(rows);
  } catch (err) {
    console.error("Error exporting chat history as JSON:", err);
    res.status(500).json({ error: "Failed to export chat history as JSON" });
  }
};

// Export chat history as PDF
export const exportChatHistoryPdf = async (req, res) => {
  try {
    const { firebase_uid, role, type } = req.query;
    let rows;
    if (role === "admin" || role === "owner") {
      if (type === "member") {
        [rows] = await db.query(
          "SELECT * FROM chat_history WHERE role = 'member' ORDER BY chat_time ASC"
        );
      } else if (type === "admin") {
        [rows] = await db.query(
          "SELECT * FROM chat_history WHERE role = 'admin' ORDER BY chat_time ASC"
        );
      } else {
        [rows] = await db.query(
          "SELECT * FROM chat_history ORDER BY chat_time ASC"
        );
      }
    } else if (firebase_uid) {
      [rows] = await db.query(
        "SELECT * FROM chat_history WHERE firebase_uid = ? ORDER BY chat_time ASC",
        [firebase_uid]
      );
    } else {
      return res.status(400).json({ error: "Missing firebase_uid or role" });
    }
    res.setHeader("Content-Disposition", "attachment; filename=chat_history.pdf");
    res.setHeader("Content-Type", "application/pdf");
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    doc.pipe(res);
    doc.fontSize(18).fillColor('#2563eb').text('Chat History', { align: 'left' });
    doc.moveDown();
    rows.forEach((chat, idx) => {
      doc.fontSize(10).fillColor('#333');
      doc.text(
        `${chat.chat_time ? new Date(chat.chat_time).toLocaleString() : chat.timestamp || ''}`,
        { continued: false }
      );
      doc.moveDown(0.2);
      doc.font('Helvetica-Bold').text(`${chat.name || 'User'}${chat.role ? ` (${chat.role})` : ''}: `, { continued: true });
      doc.font('Helvetica').text(chat.user_message || chat.userMessage || '', { continued: false });
      doc.moveDown(0.2);
      doc.font('Helvetica-Bold').fillColor('#2563eb').text('Bot:', { continued: true });
      doc.font('Helvetica').fillColor('#333').text(' ' + (chat.bot_reply || chat.botReply || ''), { continued: false });
      doc.moveDown(0.5);
      if (idx < rows.length - 1) doc.moveDown(0.5);
      if (doc.y > 750) { doc.addPage(); doc.moveDown(); }
    });
    doc.end();
  } catch (err) {
    console.error("Error exporting chat history as PDF:", err);
    res.status(500).json({ error: "Failed to export chat history as PDF" });
  }
};