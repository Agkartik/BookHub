import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // automatically delete after 10 minutes
});

export default mongoose.model("PendingUser", pendingUserSchema);
