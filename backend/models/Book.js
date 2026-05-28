import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  categories: [{ type: String, trim: true }],
  moods: [{ type: String, trim: true }],
  coverImage: { type: String, default: "" },
  pdf: { type: String, default: "" },
  pages: { type: Number, default: 0 },
  language: { type: String, default: "English" },
  publishedYear: { type: Number, default: null },
  format: { type: String, default: "Paperback" },
  condition: { type: String, enum: ["New", "Gently Used", "Used"], default: "New" },
  mrp: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 20 },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  chapters: [
    {
      title: { type: String, required: true },
      content: { type: String, required: true },
    },
  ],
  musicTrack: { type: mongoose.Schema.Types.ObjectId, ref: "Music" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.model("Book", bookSchema);
