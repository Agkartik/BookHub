import express from "express";
import { protect, admin } from "../middleware/auth.js";
import { deleteAdminBook, deleteAdminUser, getAdminBooks, getAdminOverview, getAdminUsers, updateAdminBook } from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, admin);
router.get("/overview", getAdminOverview);
router.get("/users", getAdminUsers);
router.delete("/users/:id", deleteAdminUser);
router.get("/books", getAdminBooks);
router.put("/books/:id", updateAdminBook);
router.delete("/books/:id", deleteAdminBook);

export default router;
