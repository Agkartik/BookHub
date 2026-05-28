import express from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  toggleLike,
  getLikedBooks,
  getMe,
  updateMe,
  getMySettings,
  updateMySettings,
  postReadingHeartbeat,
  updateReadingGoal,
  uploadProfilePic,
  deleteProfilePic
} from "../controllers/userController.js";

const router = express.Router();
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.post("/me/profile-pic", protect, upload.single("profilePic"), uploadProfilePic);
router.delete("/me/profile-pic", protect, deleteProfilePic);
router.get("/settings", protect, getMySettings);
router.put("/settings", protect, updateMySettings);
router.put("/like/:id", protect, toggleLike);
router.get("/liked-books", protect, getLikedBooks);
router.post("/heartbeat", protect, postReadingHeartbeat);
router.put("/reading-goal", protect, updateReadingGoal);
export default router;
