import express from "express";
import { protect } from "../middleware/auth.js";
import { getRecommendations, getMoodRecommendations } from "../controllers/recommendationController.js";

const router = express.Router();

router.get("/", protect, getRecommendations);
router.get("/mood", protect, getMoodRecommendations);

export default router;
