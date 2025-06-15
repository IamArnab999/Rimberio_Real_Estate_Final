import admin from "../config/firebaseAdmin.js";
import jwt from "jsonwebtoken";
import db from "../config/mysqlConfig.js"; // or your MongoDB connection




const MAX_INACTIVITY_DAYS = 30;

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch user from DB
    const [user] = await db.query("SELECT * FROM users WHERE id = ?", [decoded.id]);
    if (!user) return res.status(401).json({ error: "User not found" });

    // Check inactivity
    const lastActivity = new Date(user.lastActivity);
    const now = new Date();
    const diffInDays = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
    if (diffInDays >= MAX_INACTIVITY_DAYS) {
      return res.status(401).json({ error: "Session expired due to inactivity" });
    }

    // Update lastActivity
    await db.query("UPDATE users SET lastActivity = ? WHERE id = ?", [now, user.id]);

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach decoded user info to the request
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(403).json({ message: "Unauthorized", error: error.message });
  }
};

