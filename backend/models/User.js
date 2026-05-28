import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "writer", "admin"], default: "user" },
  bio: { type: String, default: "" },
  favoriteGenres: [{ type: String }],
  isEmailVerified: { type: Boolean, default: false },
  settings: {
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    reduceMotion: { type: Boolean, default: false },
    glassmorphism: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    publicProfile: { type: Boolean, default: true },
  },
  likedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: "" },
  totalReadingTime: { type: Number, default: 0 },
  readingGoalBooks: { type: Number, default: 12 },
  cartItems: [
    {
      book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
      quantity: { type: Number, default: 1, min: 1 },
    },
  ],
  profilePicture: { type: String, default: "" },
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
