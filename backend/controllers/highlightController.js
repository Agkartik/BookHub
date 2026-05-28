import Highlight from "../models/Highlight.js";

// GET /api/highlights/:bookId  — get all highlights for this user+book+chapter
export const getHighlights = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { chapterIndex } = req.query;
    const query = { user: req.user._id, book: bookId };
    if (chapterIndex !== undefined) query.chapterIndex = Number(chapterIndex);
    const highlights = await Highlight.find(query).sort({ chapterIndex: 1, paraIndex: 1 });
    res.json(highlights);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch highlights" });
  }
};

// POST /api/highlights/:bookId  — create a highlight
export const createHighlight = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { chapterIndex, paraIndex, text, color, comment } = req.body;
    if (!text || text.trim().length === 0) return res.status(400).json({ message: "Text is required" });
    const hl = await Highlight.create({
      user: req.user._id,
      book: bookId,
      chapterIndex: chapterIndex ?? 0,
      paraIndex: paraIndex ?? 0,
      text: text.trim(),
      color: color || "yellow",
      comment: comment || "",
    });
    res.status(201).json(hl);
  } catch (err) {
    res.status(500).json({ message: "Failed to create highlight" });
  }
};

// PUT /api/highlights/:id  — update color/comment
export const updateHighlight = async (req, res) => {
  try {
    const hl = await Highlight.findOne({ _id: req.params.id, user: req.user._id });
    if (!hl) return res.status(404).json({ message: "Highlight not found" });
    const { color, comment } = req.body;
    if (color) hl.color = color;
    if (comment !== undefined) hl.comment = comment;
    await hl.save();
    res.json(hl);
  } catch (err) {
    res.status(500).json({ message: "Failed to update highlight" });
  }
};

// DELETE /api/highlights/:id
export const deleteHighlight = async (req, res) => {
  try {
    const hl = await Highlight.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!hl) return res.status(404).json({ message: "Highlight not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete highlight" });
  }
};
