import express from "express";
import multer from "multer";
import {
  addReview,
  getReviews,
  updateReviewHelpfulness,
  deleteReview,
  deleteAllReviews,
  updateReviewVerification,
} from "../models/mysqlModel.js";
import { uploadToAzure } from "../utils/AzureStorage.js";

const router = express.Router();

// Configure multer for file uploads (images only)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/reviews", upload.array("media", 10), async (req, res) => {
  try {
    const { title, review, rating, images, firebase_uid, avatar } = req.body;
    const user_name = req.body.user_name || "Anonymous";
    let imageUrls = [];

    // If files are uploaded (multipart/form-data), upload them to Azure
    if (Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        if (file.mimetype.startsWith("image/")) {
          const azureResult = await uploadToAzure(
            file.buffer,
            file.originalname,
            process.env.AZURE_STORAGE_CONTAINER_NAME || "review-images"
          );
          if (azureResult.success) {
            imageUrls.push(azureResult.url);
          } else {
            console.error("Azure upload failed:", azureResult.error);
          }
        }
      }
    } else if (images) {
      // If image URLs are provided in the body (JSON), use them
      if (typeof images === "string") {
        try {
          imageUrls = JSON.parse(images);
        } catch {
          imageUrls = Array.isArray(images) ? images : [images];
        }
      } else if (Array.isArray(images)) {
        imageUrls = images;
      }
    }

    // Add review to the database
    const reviewId = await addReview({
      firebase_uid,
      avatar,
      user_name,
      title,
      review,
      rating,
      images: JSON.stringify(imageUrls),
    });

    res.status(201).json({ message: "Review added successfully", reviewId });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Failed to add review" });
  }
});

router.get("/reviews", async (req, res) => {
  try {
    const reviews = await getReviews();
    res.json(
      reviews.map((review) => ({
        ...review,
        images: JSON.parse(review.images || "[]"),
      }))
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// Upload a single image to Azure Blob Storage and return the URL
router.post("/reviews/upload-image", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file || !file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "No image file uploaded or invalid file type" });
    }
    const azureResult = await uploadToAzure(
      file.buffer,
      file.originalname,
      process.env.AZURE_STORAGE_CONTAINER_NAME || "review-images"
    );
    if (azureResult.success) {
      res.status(200).json({ imageUrl: azureResult.url });
    } else {
      res.status(500).json({ message: "Azure upload failed", error: azureResult.error });
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Failed to upload image" });
  }
});

// Add helpfulness endpoint
router.post("/reviews/:id/helpful", async (req, res) => {
  const { type } = req.body; // "yes" or "no"
  const { id } = req.params;
  if (!["yes", "no"].includes(type)) {
    return res.status(400).json({ message: "Invalid type" });
  }
  try {
    await updateReviewHelpfulness(id, type);
    res.status(200).json({ message: "Helpfulness updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update helpfulness" });
  }
});

// PATCH /api/reviews/:id/verify - update review verification status
router.patch("/reviews/:id/verify", async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    await updateReviewVerification(id, verified);
    res.status(200).json({ message: "Review verification updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update verification status" });
  }
});

// Delete a single review by ID
router.delete("/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteReview(id);
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review" });
  }
});

// Delete all reviews
router.delete("/reviews", async (req, res) => {
  try {
    await deleteAllReviews();
    res.status(200).json({ message: "All reviews deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete all reviews" });
  }
});

export default router;