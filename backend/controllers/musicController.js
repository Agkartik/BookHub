import Music from "../models/Music.js";
import Book from "../models/Book.js";
import fs from "fs";
import path from "path";

// GET /api/music  — get tracks for reading desk
export const getMusicTracks = async (req, res) => {
  try {
    const { bookId } = req.query;

    const query = {
      $or: [
        // 1. Staff curated ambient focus tracks
        { category: { $in: ["ambient", "calm", "focus"] } },
        // 2. Reader's own custom tracks
        { uploadedBy: req.user._id, category: "custom" }
      ]
    };

    // 3. Curated themes uploaded by this book's writer
    if (bookId) {
      query.$or.push({ book: bookId, category: "writer_curated" });
    }

    const tracks = await Music.find(query).sort({ createdAt: -1 });
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch music tracks" });
  }
};

// GET /api/music/my-uploads  — get user's custom uploads
export const getMyUploadedMusic = async (req, res) => {
  try {
    const query = { uploadedBy: req.user._id };
    // If user is a writer, they can see writer_curated as well as custom
    const tracks = await Music.find(query).populate("book", "title").sort({ createdAt: -1 });
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch uploads" });
  }
};

// POST /api/music  — upload a new track
export const uploadMusicTrack = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an audio file" });
    }

    const { title, artist = "Ambient", category = "custom", bookId } = req.body;

    if (!title || title.trim().length === 0) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Title is required" });
    }

    // Role checks and limit checking
    const userRole = req.user.role; // user, writer, admin
    let finalCategory = category;

    if (userRole === "user") {
      // Reader rule: limit to 3 custom tracks
      finalCategory = "custom";
      const customCount = await Music.countDocuments({ uploadedBy: req.user._id, category: "custom" });
      if (customCount >= 3) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          message: "You can only upload up to 3 custom songs. Please delete an existing song first to upload more."
        });
      }
    } else if (userRole === "writer") {
      // Writer rules: can upload custom or writer_curated
      if (category === "writer_curated") {
        if (!bookId) {
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: "Book association is required for writer-curated tracks" });
        }
        // Verify authorship
        const book = await Book.findById(bookId);
        if (!book) {
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          return res.status(404).json({ message: "Associated book not found" });
        }
        if (String(book.user) !== String(req.user._id)) {
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          return res.status(403).json({ message: "You are not authorized as the author of this book" });
        }
      }
    } else if (userRole === "admin") {
      // Admins can upload anything (calm, focus, ambient)
      if (!["calm", "focus", "ambient", "custom", "writer_curated"].includes(category)) {
        finalCategory = "ambient";
      }
    }

    const musicPath = req.file.path;
    const track = await Music.create({
      title: title.trim(),
      artist: artist.trim(),
      url: musicPath,
      category: finalCategory,
      uploadedBy: req.user._id,
      book: finalCategory === "writer_curated" ? bookId : undefined,
    });

    res.status(201).json(track);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error(error);
    res.status(500).json({ message: "Failed to upload music track" });
  }
};

// DELETE /api/music/:id  — delete track
export const deleteMusicTrack = async (req, res) => {
  try {
    const track = await Music.findById(req.params.id);
    if (!track) return res.status(404).json({ message: "Track not found" });

    // Admins can delete any song. Readers/writers can only delete their own.
    if (req.user.role !== "admin" && String(track.uploadedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to delete this track" });
    }

    // Delete local file safely
    const filePath = path.resolve(track.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Music.findByIdAndDelete(track._id);
    res.json({ message: "Track deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete track" });
  }
};
