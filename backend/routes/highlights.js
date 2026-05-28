import express from "express";
import { protect } from "../middleware/auth.js";
import { getHighlights, createHighlight, updateHighlight, deleteHighlight } from "../controllers/highlightController.js";

const router = express.Router();

router.get("/:bookId", protect, getHighlights);
router.post("/:bookId", protect, createHighlight);
router.put("/:id", protect, updateHighlight);
router.delete("/:id", protect, deleteHighlight);

export default router;
