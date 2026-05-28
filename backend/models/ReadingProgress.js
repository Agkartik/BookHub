import mongoose from "mongoose";

const readingProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    progressPercent: { type: Number, min: 0, max: 100, default: 0 },
    lastPage: { type: Number, min: 0, default: 0 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

readingProgressSchema.index({ user: 1, book: 1 }, { unique: true });

export default mongoose.model("ReadingProgress", readingProgressSchema);
