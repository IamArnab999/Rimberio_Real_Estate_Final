import pool from "../config/mysqlConfig.js";
import admin from "../config/firebaseAdmin.js";
import { fetchAllUsers, createNewUser } from "../services/mysqlService.js";

// Controller to fetch all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await fetchAllUsers();
    console.log("Fetched users:", users); // Debug log
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Failed to fetch users");
  }
};

// Controller to add a new user
export const createUser = async (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUserByEmail(email);
      console.log("Firebase user already exists:", firebaseUser);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        firebaseUser = await admin.auth().createUser({
          email,
          displayName: name,
        });
        console.log("Firebase user created:", firebaseUser);
      } else {
        throw error;
      }
    }
    // Insert into users table if not present (for Team Members)
    const avatar = firebaseUser.photoURL || "/assets/Others/user.png";
    // Check if user already exists in users table
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    let userId;
    if (existing.length === 0) {
      const [insertResult] = await pool.query(
        "INSERT INTO users (firebase_uid, name, email, role, avatar, joined_at, last_active, is_google, is_guest) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          firebaseUser.uid,
          firebaseUser.displayName || name,
          email,
          role,
          avatar,
          new Date().toISOString().slice(0, 19).replace("T", " "),
          new Date().toISOString().slice(0, 19).replace("T", " "),
          "0", // is_google
          "0", // is_guest
        ]
      );
      userId = insertResult.insertId;
    } else {
      // Always update name, avatar, and role to keep users table in sync with Firebase/profile
      await pool.query(
        "UPDATE users SET name = ?, avatar = ?, role = ? WHERE id = ?",
        [firebaseUser.displayName || name, avatar, role, existing[0].id]
      );
      userId = existing[0].id;
    }
    // After user is inserted, ensure at least one admin exists
    await ensureAtLeastOneAdmin(email);
    console.log("User created/updated in MySQL:", {
      id: userId,
      firebase_uid: firebaseUser.uid,
      name: firebaseUser.displayName || name,
      email,
      role,
      avatar,
    });
    res.status(201).json({
      id: userId,
      firebase_uid: firebaseUser.uid,
      name,
      email,
      role,
      avatar,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Failed to create user", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }
  try {
    const [result] = await pool.query(
      "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?",
      [name, email, role, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User updated in MySQL:", {
      id,
      name,
      email,
      role,
    });
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// Helper: Ensure at most one admin exists, and assign admin to first Google user only
async function ensureAtLeastOneAdmin(email) {
  // Check if any admin/owner exists
  const [existingAdmins] = await pool.query(
    "SELECT * FROM users WHERE role = 'admin'"
  );
  if (existingAdmins.length === 0) {
    // Only promote if the user is a Google user and not a guest
    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND is_google = '1' AND (is_guest = '0' OR is_guest IS NULL)",
      [email]
    );
    if (users.length > 0) {
      await pool.query(
        "UPDATE users SET role = 'admin', dashboard_enabled = 1 WHERE email = ?",
        [email]
      );
      // Also update any null/empty name to the email prefix for visibility
      await pool.query(
        "UPDATE users SET name = IFNULL(NULLIF(name, ''), SUBSTRING_INDEX(email, '@', 1)) WHERE email = ?",
        [email]
      );
      return true;
    }
    // If not a Google user, do not promote to admin
    return false;
  }
  // If an admin already exists, do not promote anyone else
  return false;
}

// Utility: Ensure user exists in users table, insert if not
async function ensureUserInUsersTable(email, isGoogle = false) {
  try {
    // Check if user exists
    const [existing] = await pool.query(
      "SELECT id, role, is_google, is_guest FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) return existing[0];
    // Check if any team members exist
    const [teamMembers] = await pool.query("SELECT id FROM users");
    let role = "member";
    let is_guest = "1";
    let is_google = "0";
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUserByEmail(email);
      is_google =
        isGoogle ||
        (firebaseUser.providerData &&
          firebaseUser.providerData.some(
            (p) => p.providerId && p.providerId.includes("google")
          ))
          ? "1"
          : "0";
      is_guest = is_google === "1" ? "0" : "1";
    } catch (error) {
      // Not a valid Firebase user, treat as guest
      firebaseUser = {
        uid: "",
        displayName: email.split("@")[0],
        photoURL: "/assets/Others/user.png",
      };
    }
    // If no team members exist, guest user is 'member', Google user is 'admin'
    if (teamMembers.length === 0) {
      if (is_google === "1") {
        role = "admin";
      } else {
        role = "member";
      }
    } else {
      // If team members exist, Google user is 'member', guest is 'member'
      role = "member";
    }
    const avatar = firebaseUser.photoURL || "/assets/Others/user.png";
    const name = firebaseUser.displayName || email.split("@")[0];
    const [insertResult] = await pool.query(
      "INSERT INTO users (firebase_uid, name, email, role, avatar, joined_at, last_active, is_google, is_guest) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        firebaseUser.uid,
        name,
        email,
        role,
        avatar,
        new Date().toISOString().slice(0, 19).replace("T", " "),
        new Date().toISOString().slice(0, 19).replace("T", " "),
        is_google,
        is_guest,
      ]
    );
    // If this is the first Google user, ensure only one admin
    if (role === "admin") {
      await pool.query(
        "UPDATE users SET role = 'member' WHERE email != ? AND role = 'admin'",
        [email]
      );
    }
    return { id: insertResult.insertId };
  } catch (err) {
    console.error("[ensureUserInUsersTable] Error:", err);
    return null;
  }
}

export const getUserRoleByEmail = async (req, res) => {
  const { email } = req.query;
  console.log("[getUserRoleByEmail] Called with email:", email);
  if (!email) return res.status(400).json({ message: "Email is required" });
  try {
    let [rows] = await pool.query(
      "SELECT role FROM users WHERE TRIM(LOWER(email)) = TRIM(LOWER(?))",
      [email]
    );
    console.log("[getUserRoleByEmail] Query result:", rows);
    if (rows.length === 0) {
      // Try to auto-insert user if not found
      await ensureUserInUsersTable(email);
      [rows] = await pool.query(
        "SELECT role FROM users WHERE TRIM(LOWER(email)) = TRIM(LOWER(?))",
        [email]
      );
      if (rows.length === 0)
        return res.status(404).json({ message: "User not found" });
    }
    res.json({ role: rows[0].role });
  } catch (err) {
    console.error("Error fetching user role:", err);
    res.status(500).json({ message: "Failed to fetch user role" });
  }
};

// Controller to update user settings (profile info)
export const updateUserSettings = async (req, res) => {
  let { id, firebase_uid, first_name, last_name, email, image } = req.body;
  if (!firebase_uid || !email) {
    return res
      .status(400)
      .json({ success: false, error: "firebase_uid and email are required" });
  }
  // Convert empty strings to null for DB fields
  first_name =
    typeof first_name === "string" && first_name.trim() === ""
      ? null
      : first_name;
  last_name =
    typeof last_name === "string" && last_name.trim() === "" ? null : last_name;
  image = typeof image === "string" && image.trim() === "" ? null : image;
  try {
    // Log the incoming payload for debugging
    console.log("[updateUserSettings] Payload:", req.body);
    // Check if email is already used by another user
    const [existing] = await pool.query(
      "SELECT id FROM user_settings WHERE email = ? AND firebase_uid != ?",
      [email, firebase_uid]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Email already in use by another user.",
      });
    }
    // If id is not a valid number, use null to trigger auto-increment
    const idValue = id && Number.isInteger(Number(id)) ? Number(id) : null;
    // Upsert user settings
    const [result] = await pool.query(
      `INSERT INTO user_settings (id, firebase_uid, first_name, last_name, email, image)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         first_name = VALUES(first_name),
         last_name = VALUES(last_name),
         email = VALUES(email),
         image = VALUES(image),
         updated_at = CURRENT_TIMESTAMP`,
      [idValue, firebase_uid, first_name, last_name, email, image]
    );
    // Also update the users table for name and avatar (profile picture)
    const fullName = [first_name, last_name].filter(Boolean).join(" ").trim();
    await pool.query(
      "UPDATE users SET name = ?, avatar = ? WHERE firebase_uid = ? OR email = ?",
      [fullName, image, firebase_uid, email]
    );
    // Log the result for debugging
    console.log("[updateUserSettings] Query result:", result);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Controller to enable dashboard for all team members if no one has logged in for a long time
export const enableDashboardForInactiveTeam = async (req, res) => {
  try {
    // Define inactivity threshold (e.g., 30 days)
    const thresholdDays = 30;
    // Get all users
    const [users] = await pool.query("SELECT * FROM users");
    // Check if no one is online (all last_active older than threshold) or no user has a role
    const now = new Date();
    let allInactive = true;
    let hasRole = false;
    for (const user of users) {
      if (user.role && user.role !== "" && user.role !== "guest") {
        hasRole = true;
      }
      if (user.last_active) {
        const lastActiveDate = new Date(user.last_active);
        const diffDays = Math.floor(
          (now - lastActiveDate) / (1000 * 60 * 60 * 24)
        );
        if (diffDays < thresholdDays) {
          allInactive = false;
        }
      }
    }
    if (!hasRole || allInactive) {
      // Enable dashboard for all team members
      await pool.query(
        "UPDATE users SET dashboard_enabled = 1 WHERE role IN ('member', 'admin')"
      );
      return res.json({ dashboardEnabled: true });
    } else {
      return res.json({ dashboardEnabled: false });
    }
  } catch (error) {
    console.error("Error enabling dashboard for inactive team:", error);
    res
      .status(500)
      .json({ message: "Failed to enable dashboard for inactive team" });
  }
};
