import express from "express";
import { protect } from "../middleware/auth.js";
import { getMyProgress, upsertProgress } from "../controllers/progressController.js";

const router = express.Router();

router.get("/", protect, getMyProgress);
router.put("/:bookId", protect, upsertProgress);

export default router;
