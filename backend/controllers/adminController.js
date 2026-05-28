import User from "../models/User.js";
import Book from "../models/Book.js";
import Review from "../models/Review.js";
import ModerationReport from "../models/ModerationReport.js";

export const getAdminOverview = async (req, res) => {
  try {
    const [users, books, reviews, writers, pendingReports] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      Review.countDocuments(),
      User.countDocuments({ role: "writer" }),
      ModerationReport.countDocuments({ status: "open" }),
    ]);
    res.json({ users, books, reviews, writers, pendingReports });
  } catch (error) {
    res.status(500).json({ message: "Failed to load admin overview" });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getAdminBooks = async (req, res) => {
  try {
    const books = await Book.find().populate("user", "name role").sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

export const updateAdminBook = async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Book not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Failed to update book" });
  }
};

export const deleteAdminBook = async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book deleted" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete book" });
  }
};

export const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (String(id) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cascade delete user's books if they are a writer
    if (user.role === "writer") {
      await Book.deleteMany({ user: user._id });
    }

    // Delete all reviews submitted by this user
    await Review.deleteMany({ user: user._id });

    // Delete the user
    await User.findByIdAndDelete(id);

    res.json({ message: "User removed successfully" });
  } catch (error) {
    console.error("deleteAdminUser error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
