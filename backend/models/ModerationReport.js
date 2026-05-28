import mongoose from "mongoose";

const moderationReportSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: ["book", "review", "user"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true, trim: true },
    details: { type: String, default: "" },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["open", "resolved"], default: "open" },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    resolutionNote: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("ModerationReport", moderationReportSchema);
