import mongoose from "mongoose";

const emailVerificationTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    otp: { type: String, default: null },
    purpose: { type: String, enum: ["signup", "email_link"], default: "signup" },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("EmailVerificationToken", emailVerificationTokenSchema);
