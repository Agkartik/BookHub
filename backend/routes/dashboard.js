import express from "express";
import { protect, writerOrAdmin } from "../middleware/auth.js";
import { getWriterDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/writer", protect, writerOrAdmin, getWriterDashboard);

export default router;
