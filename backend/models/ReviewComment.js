import mongoose from "mongoose";

const reviewCommentSchema = new mongoose.Schema(
  {
    review: { type: mongoose.Schema.Types.ObjectId, ref: "Review", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "ReviewComment", default: null },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("ReviewComment", reviewCommentSchema);
