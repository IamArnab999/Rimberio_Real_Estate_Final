import { addReview, getReviews, updateReviewHelpfulness, deleteReview, deleteAllReviews, updateReviewVerification } from "../models/mysqlModel.js";

// Add a new review
export const createReview = async (req, res) => {
  try {
    const { firebase_uid, avatar, user_name, title, review, rating, images } = req.body;
    const reviewId = await addReview({ firebase_uid, avatar, user_name, title, review, rating, images: JSON.stringify(images) });
    res.status(201).json({ message: "Review added successfully", reviewId });
  } catch (error) {
    res.status(500).json({ message: "Failed to add review" });
  }
};

// Get all reviews
export const fetchReviews = async (req, res) => {
  try {
    const reviews = await getReviews();
    res.json(reviews.map((review) => ({ ...review, images: JSON.parse(review.images || "[]") })));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// Update review helpfulness
export const markReviewHelpful = async (req, res) => {
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
};

// Delete a single review by ID
export const removeReview = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteReview(id);
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review" });
  }
};

// Delete all reviews
export const removeAllReviews = async (req, res) => {
  try {
    await deleteAllReviews();
    res.status(200).json({ message: "All reviews deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete all reviews" });
  }
};

// Update review verification status
export const verifyReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    await updateReviewVerification(id, verified);
    res.status(200).json({ message: "Review verification updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update verification status" });
  }
};
