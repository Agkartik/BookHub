import express from "express";
import { protect } from "../middleware/auth.js";
import { createReview, getReviews, addReviewComment, getReviewComments, updateReview } from "../controllers/reviewController.js";

const router = express.Router();
router.post("/:bookId", protect, createReview);
router.get("/:bookId", getReviews);
router.put("/:reviewId", protect, updateReview);
router.post("/:reviewId/comments", protect, addReviewComment);
router.get("/:reviewId/comments", getReviewComments);
export default router;
