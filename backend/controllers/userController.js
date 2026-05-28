import User from "../models/User.js";
import Book from "../models/Book.js";
import fs from "fs";
import path from "path";

export const toggleLike = async (req, res) => {
  const user = await User.findById(req.user._id);
  const id = req.params.id;

  const liked = user.likedBooks.includes(id);
  liked ? user.likedBooks.pull(id) : user.likedBooks.push(id);

  await user.save();
  res.json({ liked: !liked });
};

export const getLikedBooks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("likedBooks");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.likedBooks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name?.trim() || user.name;
    user.bio = req.body.bio ?? user.bio;
    if (Array.isArray(req.body.favoriteGenres)) {
      user.favoriteGenres = req.body.favoriteGenres.filter(Boolean);
    }
    if (req.body.settings && typeof req.body.settings === "object") {
      user.settings = {
        ...user.settings,
        ...req.body.settings,
      };
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio,
      favoriteGenres: updatedUser.favoriteGenres,
      settings: updatedUser.settings,
      isEmailVerified: updatedUser.isEmailVerified,
      profilePicture: updatedUser.profilePicture,
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to update profile" });
  }
};

export const getMySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("settings");
    res.json(user?.settings || {});
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

export const updateMySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.settings) {
      user.settings = {};
    }

    if (req.body.theme !== undefined) user.settings.theme = req.body.theme;
    if (req.body.reduceMotion !== undefined) user.settings.reduceMotion = req.body.reduceMotion;
    if (req.body.glassmorphism !== undefined) user.settings.glassmorphism = req.body.glassmorphism;
    if (req.body.emailNotifications !== undefined) user.settings.emailNotifications = req.body.emailNotifications;
    if (req.body.publicProfile !== undefined) user.settings.publicProfile = req.body.publicProfile;

    user.markModified("settings");
    await user.save();
    res.json(user.settings);
  } catch (error) {
    console.error("updateMySettings error:", error);
    res.status(400).json({ message: "Failed to update settings" });
  }
};

export const postReadingHeartbeat = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.totalReadingTime = (user.totalReadingTime || 0) + 1;

    const today = new Date();
    const formatDate = (date) => date.toISOString().split("T")[0];
    const todayStr = formatDate(today);

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    if (!user.lastActiveDate) {
      user.streak = 1;
      user.lastActiveDate = todayStr;
    } else if (user.lastActiveDate === yesterdayStr) {
      user.streak += 1;
      user.lastActiveDate = todayStr;
    } else if (user.lastActiveDate !== todayStr) {
      user.streak = 1;
      user.lastActiveDate = todayStr;
    }

    await user.save();
    res.json({
      streak: user.streak,
      lastActiveDate: user.lastActiveDate,
      totalReadingTime: user.totalReadingTime,
      readingGoalBooks: user.readingGoalBooks || 12
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update heartbeat" });
  }
};

export const updateReadingGoal = async (req, res) => {
  try {
    const { goal } = req.body;
    if (goal === undefined || isNaN(goal)) {
      return res.status(400).json({ message: "Valid goal is required" });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.readingGoalBooks = Number(goal);
    await user.save();
    res.json({ readingGoalBooks: user.readingGoalBooks });
  } catch (error) {
    res.status(500).json({ message: "Failed to update goal" });
  }
};

export const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image file" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old profile picture file if it exists
    if (user.profilePicture) {
      const oldPath = path.resolve(user.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    user.profilePicture = req.file.path.replace(/\\/g, "/"); // normalize path separator
    await user.save();

    res.json({
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error(error);
    res.status(500).json({ message: "Failed to upload profile picture" });
  }
};

export const deleteProfilePic = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.profilePicture) {
      const oldPath = path.resolve(user.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      user.profilePicture = "";
      await user.save();
    }

    res.json({ message: "Profile picture removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete profile picture" });
  }
};
