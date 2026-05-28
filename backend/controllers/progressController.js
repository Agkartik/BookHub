import ReadingProgress from "../models/ReadingProgress.js";

export const getMyProgress = async (req, res) => {
  try {
    const items = await ReadingProgress.find({ user: req.user._id })
      .populate("book", "title author coverImage categories")
      .sort({ updatedAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reading progress" });
  }
};

export const upsertProgress = async (req, res) => {
  try {
    const { progressPercent = 0, lastPage = 0 } = req.body;
    const completed = Number(progressPercent) >= 100;
    const updated = await ReadingProgress.findOneAndUpdate(
      { user: req.user._id, book: req.params.bookId },
      {
        user: req.user._id,
        book: req.params.bookId,
        progressPercent: Number(progressPercent),
        lastPage: Number(lastPage),
        completed,
      },
      { upsert: true, new: true, runValidators: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Failed to save progress" });
  }
};
