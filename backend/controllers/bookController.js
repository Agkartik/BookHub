import Book from "../models/Book.js";

export const getBooks = async (req, res) => {
  try {
    const { search, category, language, minRating, sort = "latest", mood } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
      query.categories = category;
    }
    if (mood) {
      query.moods = mood;
    }
    if (language) {
      query.language = language;
    }
    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    const sortMap = {
      latest: { createdAt: -1 },
      top: { averageRating: -1, reviewCount: -1 },
      title: { title: 1 },
      oldest: { createdAt: 1 },
    };

    const books = await Book.find(query)
      .sort(sortMap[sort] || sortMap.latest)
      .populate("user", "name role");

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("user", "name role")
      .populate("musicTrack");
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch the book" });
  }
};

export const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your books" });
  }
};

export const createBook = async (req, res) => {
  try {
    const categories = req.body.categories
      ? JSON.parse(req.body.categories)
      : [];
    const moods = req.body.moods
      ? JSON.parse(req.body.moods)
      : [];

    const book = await Book.create({
      title: req.body.title,
      author: req.user.name,
      description: req.body.description,
      categories,
      moods,
      pages: Number(req.body.pages || 0),
      language: req.body.language || "English",
      publishedYear: req.body.publishedYear ? Number(req.body.publishedYear) : null,
      coverImage: req.files?.coverImage?.[0]?.path || "",
      pdf: req.files?.pdfFile?.[0]?.path || "",
      musicTrack: req.body.musicTrack && req.body.musicTrack !== "none" ? req.body.musicTrack : undefined,
      user: req.user._id,
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: "Failed to create book", error: error.message });
  }
};
