import Review from "../models/Review.js";
import Book from "../models/Book.js";
import ReviewComment from "../models/ReviewComment.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendEmail } from "../config/nodemailer.js";
import { reviewNotificationTemplate } from "../utils/emailTemplates.js";

const recalculateBookRating = async (bookId) => {
  const stats = await Review.aggregate([
    { $match: { book: bookId } },
    {
      $group: {
        _id: "$book",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats[0]?.avg || 0;
  const reviewCount = stats[0]?.count || 0;
  await Book.findByIdAndUpdate(bookId, { averageRating, reviewCount });
};

export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const review = await Review.create({
      rating: Number(rating),
      comment: (comment || "").trim(),
      user: req.user._id,
      book: req.params.bookId,
    });

    await recalculateBookRating(review.book);
    const book = await Book.findById(review.book).select("title user");
    if (book && String(book.user) !== String(req.user._id)) {
      await Notification.create({
        user: book.user,
        type: "review",
        title: "New review on your book",
        message: `${req.user.name} reviewed "${book.title}"`,
        meta: { bookId: book._id, reviewId: review._id },
      });

      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const owner = await User.findById(book.user).select("email settings");
        if (owner?.email && owner?.settings?.emailNotifications !== false) {
          try {
            await sendEmail(
              owner.email,
              `New review on "${book.title}"`,
              reviewNotificationTemplate({
                reviewer: req.user.name || "Reader",
                bookTitle: book.title,
                rating: review.rating,
                comment: review.comment,
              })
            );
          } catch {
            // non-blocking
          }
        }
      }
    }
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: "Failed to add review" });
  }
};

export const addReviewComment = async (req, res) => {
  try {
    const { comment, parent } = req.body;
    if (!comment?.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const newComment = await ReviewComment.create({
      review: req.params.reviewId,
      user: req.user._id,
      parent: parent || null,
      comment: comment.trim(),
    });

    const book = await Book.findById(review.book).select("title user");
    if (book && String(book.user) !== String(req.user._id)) {
      await Notification.create({
        user: book.user,
        type: "discussion",
        title: "New discussion on your review thread",
        message: `${req.user.name} commented on "${book.title}"`,
        meta: { bookId: book._id, reviewId: review._id, commentId: newComment._id },
      });
    }

    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ message: "Failed to add comment" });
  }
};

export const getReviewComments = async (req, res) => {
  try {
    const comments = await ReviewComment.find({ review: req.params.reviewId })
      .sort({ createdAt: 1 })
      .populate("user", "name role");
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .sort({ createdAt: -1 })
      .populate("user", "name role");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (String(review.user) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to edit this review" });
    }

    if (rating) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment.trim();

    await review.save();
    await recalculateBookRating(review.book);

    res.json(review);
  } catch (error) {
    res.status(400).json({ message: "Failed to update review", error: error.message });
  }
};
