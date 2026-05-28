import express from "express";
import { protect, admin } from "../middleware/auth.js";
import { createModerationReport, getAdminReports, resolveAdminReport } from "../controllers/moderationController.js";

const router = express.Router();

router.post("/report", protect, createModerationReport);
router.get("/admin/reports", protect, admin, getAdminReports);
router.put("/admin/reports/:id/resolve", protect, admin, resolveAdminReport);

export default router;
