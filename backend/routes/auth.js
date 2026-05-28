import express from "express";
import { register, login, verifyEmail, verifyOtp, resendOtp } from "../controllers/authController.js";
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
export default router;
