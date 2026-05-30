import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import EmailVerificationToken from "../models/EmailVerificationToken.js";
import { sendEmail } from "../config/nodemailer.js";
import { otpTemplate, welcomeTemplate } from "../utils/emailTemplates.js";

const createOtp = () => String(Math.floor(100000 + Math.random() * 900000));

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const safeRole = role === "writer" ? "writer" : "user";
    const otp = createOtp();

    await PendingUser.deleteMany({ email: email.toLowerCase().trim() });
    const pendingUser = await PendingUser.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: safeRole,
      otp,
    });

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      sendEmail(
        pendingUser.email,
        "BookVerse OTP Verification",
        otpTemplate(otp)
      ).catch(console.error);
    }

    res.status(201).json({
      message: "OTP sent to your email. Verify to complete registration.",
      email: pendingUser.email
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (user) {
       return res.status(400).json({ message: "Email already verified and account exists" });
    }

    const pendingUser = await PendingUser.findOne({ email: email?.toLowerCase().trim() });
    if (!pendingUser) {
       return res.status(404).json({ message: "Pending registration not found. Please sign up again." });
    }

    const otp = createOtp();
    pendingUser.otp = otp;
    pendingUser.createdAt = new Date();
    await pendingUser.save();

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      sendEmail(
        pendingUser.email,
        "BookVerse OTP Verification",
        otpTemplate(otp)
      ).catch(console.error);
    }

    res.json({
      message: "New OTP sent to your email."
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });

    if (user && await user.matchPassword(password)) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        favoriteGenres: user.favoriteGenres,
        settings: user.settings,
        token: generateToken(user._id),
        isEmailVerified: user.isEmailVerified,
      });
    }

    res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const pendingUser = await PendingUser.findOne({ 
      email: email.toLowerCase().trim(),
      otp: String(otp)
    });

    if (!pendingUser) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: pendingUser.role,
      isEmailVerified: true
    });

    await PendingUser.deleteOne({ _id: pendingUser._id });

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      sendEmail(user.email, "Welcome to BookVerse", welcomeTemplate(user.name)).catch(console.error);
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      favoriteGenres: user.favoriteGenres,
      settings: user.settings,
      token: generateToken(user._id),
      isEmailVerified: user.isEmailVerified,
    });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const doc = await EmailVerificationToken.findOne({ token, used: false });
    if (!doc || doc.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    await User.findByIdAndUpdate(doc.user, { isEmailVerified: true });
    doc.used = true;
    await doc.save();
    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ message: "Email verification failed" });
  }
};
