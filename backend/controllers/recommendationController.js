import Book from "../models/Book.js";
import User from "../models/User.js";

export const getRecommendations = async (req, res) => {
  try {
    const me = await User.findById(req.user._id).select("likedBooks favoriteGenres");
    const favoredGenre = me.favoriteGenres?.[0];
    const likedBooks = me.likedBooks || [];

    const query = {
      _id: { $nin: likedBooks },
    };

    if (favoredGenre) {
      query.categories = favoredGenre;
    }

    const books = await Book.find(query).sort({ averageRating: -1, reviewCount: -1 }).limit(12);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
};

export const getMoodRecommendations = async (req, res) => {
  try {
    const mood = (req.query.mood || "focus").toLowerCase();
    const moodToCategories = {
      focus: ["Productivity", "Technology", "Business"],
      thrill: ["Mystery", "Adventure", "Science Fiction"],
      calm: ["Poetry", "Literary Fiction", "Self Help"],
      inspire: ["Self Help", "Biography", "History"],
      escape: ["Fantasy", "Science Fiction", "Fiction"],
    };

    const categories = moodToCategories[mood] || moodToCategories.focus;
    const books = await Book.find({ categories: { $in: categories } })
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(12);

    res.json({
      mood,
      categories,
      rationale: `Picked books from ${categories.join(", ")} based on your selected mood.`,
      books,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch mood recommendations" });
  }
};
