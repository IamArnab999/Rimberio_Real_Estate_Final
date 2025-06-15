import express from "express";
import multer from "multer";
import { saveUserAvatar, getUserAvatar } from "../models/mysqlModel.js";
import { updateUserSettings } from "../controllers/userController.js";
import { getUserRoleByEmail, enableDashboardForInactiveTeam } from "../controllers/userController.js";
import { uploadToAzure } from "../utils/AzureStorage.js";
import { updateUserImage } from "../models/userModel.js";

const router = express.Router();
const upload = multer();

// Azure Blob Storage profile picture upload endpoint
router.post("/upload-profile-picture", upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    // Upload to Azure Blob Storage
    const azureResult = await uploadToAzure(req.file, req.file.originalname, "profile-pictures");
    if (!azureResult.success) {
      return res.status(500).json({ message: "Failed to upload image to Azure", error: azureResult.error });
    }
    // Persist the new image URL in the user_settings table if firebase_uid is provided
    const { firebase_uid } = req.body;
    if (firebase_uid) {
      try {
        await updateUserImage(firebase_uid, azureResult.url);
      } catch (dbErr) {
        // Log DB error but still return image URL
        console.error("Failed to update user image in DB:", dbErr);
      }
    }
    res.json({ imageUrl: azureResult.url });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload profile picture", error: error.message });
  }
});

// Endpoint to get avatar blob
router.get("/users/avatar/:firebase_uid", async (req, res) => {
  try {
    const { firebase_uid } = req.params;
    const avatarBlob = await getUserAvatar(firebase_uid);
    if (!avatarBlob) return res.status(404).send("Not found");
    res.set("Content-Type", "image/jpeg"); // or detect type
    res.send(avatarBlob);
  } catch (error) {
    res.status(500).send("Error fetching avatar");
  }
});

// Add/update user settings (profile info)
router.post("/update-profile", updateUserSettings);
// Get user role by email (for UserContext and role sync)
router.get("/users/role", getUserRoleByEmail);
// Enable dashboard for inactive team members
router.get("/enable-dashboard-inactive", enableDashboardForInactiveTeam);

export default router;