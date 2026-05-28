import express from "express";
import { protect } from "../middleware/auth.js";
import { chatWithBook } from "../controllers/chatController.js";

const router = express.Router();

router.post("/:bookId", protect, chatWithBook);

export default router;
