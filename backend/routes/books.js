import express from "express";
import { getBooks, createBook, getBookById, getMyBooks } from "../controllers/bookController.js";
import { protect, writerOrAdmin } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();
router.get("/", getBooks);
router.get("/mine", protect, getMyBooks);
router.get("/:id", getBookById);
router.post("/", protect, writerOrAdmin, upload.fields([{ name: "coverImage" }, { name: "pdfFile" }]), createBook);
export default router;
