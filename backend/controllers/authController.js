import User from "../models/User.js";
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
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: safeRole,
      isEmailVerified: false,
    });

    const token = crypto.randomBytes(24).toString("hex");
    const otp = createOtp();
    await EmailVerificationToken.deleteMany({ user: user._id, used: false });
    await EmailVerificationToken.create({
      user: user._id,
      token,
      otp,
      purpose: "signup",
      expiresAt: new Date(Date.now() + 1000 * 60 * 10),
    });

    let emailSent = false;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await sendEmail(
          user.email,
          "BookVerse OTP Verification",
          otpTemplate(otp)
        );
        emailSent = true;
      } catch (e) {
        emailSent = false;
      }
    }

    res.status(201).json({
      message: emailSent
        ? "OTP sent to your email. Verify to complete registration."
        : "Email service not configured, use dev OTP to continue verification.",
      email: user.email,
      ...(!emailSent ? { devOtp: otp } : {}),
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isEmailVerified) return res.status(400).json({ message: "Email already verified" });

    const token = crypto.randomBytes(24).toString("hex");
    const otp = createOtp();
    await EmailVerificationToken.deleteMany({ user: user._id, used: false, purpose: "signup" });
    await EmailVerificationToken.create({
      user: user._id,
      token,
      otp,
      purpose: "signup",
      expiresAt: new Date(Date.now() + 1000 * 60 * 10),
    });

    let emailSent = false;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await sendEmail(
          user.email,
          "BookVerse OTP Verification",
          otpTemplate(otp)
        );
        emailSent = true;
      } catch {
        emailSent = false;
      }
    }

    res.json({
      message: emailSent ? "New OTP sent to your email." : "Email service not configured, use dev OTP.",
      ...(!emailSent ? { devOtp: otp } : {}),
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
      // if (!user.isEmailVerified) {
      //   return res.status(403).json({ message: "Please verify OTP sent to your email first." });
      // }
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

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpDoc = await EmailVerificationToken.findOne({
      user: user._id,
      otp: String(otp),
      used: false,
      purpose: "signup",
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isEmailVerified = true;
    await user.save();
    otpDoc.used = true;
    await otpDoc.save();

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await sendEmail(user.email, "Welcome to BookVerse", welcomeTemplate(user.name));
      } catch {
        // non-blocking
      }
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
