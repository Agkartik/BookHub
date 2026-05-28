import express from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { getMusicTracks, getMyUploadedMusic, uploadMusicTrack, deleteMusicTrack } from "../controllers/musicController.js";

const router = express.Router();

router.get("/", protect, getMusicTracks);
router.get("/my-uploads", protect, getMyUploadedMusic);
router.post("/", protect, upload.single("audioFile"), uploadMusicTrack);
router.delete("/:id", protect, deleteMusicTrack);

export default router;
