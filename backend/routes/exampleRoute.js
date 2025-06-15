import express from "express";
import multer from "multer";
import fs from "fs/promises";
import { uploadToAzure } from "../utils/Azure.js";
// adjust path if needed

const router = express.Router();
const upload = multer({ dest: "temp/" }); // store file temporarily

router.post("/post", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const formData = req.body;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read file as buffer to pass to Azure
    const buffer = await fs.readFile(file.path);

    // Upload to Azure
    const result = await uploadToAzure(buffer, file.originalname, "images");

    // Delete temp file
    await fs.unlink(file.path);

    res.status(200).json({
      message: "Data and file received",
      formData,
      fileUrl: result.url,
      fileName: result.name,
    });
  } catch (err) {
    console.error("Error in /post route:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

export default router;
