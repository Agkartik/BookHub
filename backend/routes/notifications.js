import express from "express";
import { protect } from "../middleware/auth.js";
import { getMyNotifications, markNotificationRead } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.put("/:id/read", protect, markNotificationRead);

export default router;
