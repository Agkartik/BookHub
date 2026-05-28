import express from "express";
import upload from "../middleware/upload.js";
import { protect, writerOrAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, writerOrAdmin, upload.single("file"), (req, res) => {
  res.json({
    file: `/uploads/${req.file.filename}`
  });
});

export default router;
