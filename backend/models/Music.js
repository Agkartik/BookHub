import mongoose from "mongoose";

const musicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, default: "Ambient", trim: true },
    url: { type: String, required: true },
    category: {
      type: String,
      enum: ["calm", "focus", "ambient", "custom", "writer_curated"],
      default: "ambient",
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" }, // optional for writer-curated themes
  },
  { timestamps: true }
);

export default mongoose.model("Music", musicSchema);
