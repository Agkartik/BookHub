import mongoose from "mongoose";

const highlightSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  book:         { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  chapterIndex: { type: Number, required: true },
  paraIndex:    { type: Number, required: true },
  text:         { type: String, required: true },
  color:        { type: String, enum: ["yellow", "violet", "cyan", "rose"], default: "yellow" },
  comment:      { type: String, default: "" },
}, { timestamps: true });

highlightSchema.index({ user: 1, book: 1, chapterIndex: 1 });

export default mongoose.model("Highlight", highlightSchema);
