import Book from "../models/Book.js";
import Review from "../models/Review.js";
import ReadingProgress from "../models/ReadingProgress.js";

export const getWriterDashboard = async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).select("_id title averageRating reviewCount createdAt");
    const bookIds = books.map((b) => b._id);

    const totalReviews = await Review.countDocuments({ book: { $in: bookIds } });
    const avg = books.length
      ? books.reduce((acc, b) => acc + (b.averageRating || 0), 0) / books.length
      : 0;

    const activeReaders = await ReadingProgress.countDocuments({
      book: { $in: bookIds },
      progressPercent: { $gt: 0, $lt: 100 },
    });

    res.json({
      totalBooks: books.length,
      totalReviews,
      averageRating: Number(avg.toFixed(2)),
      activeReaders,
      recentBooks: books.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};
