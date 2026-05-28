import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import userRoutes from "./routes/users.js";
import reviewRoutes from "./routes/reviews.js";
import uploadRoutes from "./routes/upload.js";
import progressRoutes from "./routes/progress.js";
import recommendationRoutes from "./routes/recommendations.js";
import notificationRoutes from "./routes/notifications.js";
import dashboardRoutes from "./routes/dashboard.js";
import adminRoutes from "./routes/admin.js";
import moderationRoutes from "./routes/moderation.js";
import highlightRoutes from "./routes/highlights.js";
import chatRoutes from "./routes/chat.js";
import musicRoutes from "./routes/music.js";

dotenv.config();

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/highlights", highlightRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/music", musicRoutes);

// Global Error Handler for upload validation & generic errors
app.use((err, req, res, next) => {
  if (err.name === "MulterError" || err.message.includes("must be a")) {
    return res.status(400).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const start = async () => {
  await connectDB();
  
  // Auto-patch the broken Unsplash cover image if it exists in the database
  try {
    const Book = (await import("./models/Book.js")).default;
    await Book.updateOne(
      { coverImage: "https://images.unsplash.com/photo-1508349689140-030f92965d48?auto=format&fit=crop&w=800&q=80" },
      { coverImage: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=800&q=80" }
    );
  } catch (err) {
    console.error("Auto-patch image update error:", err);
  }

  app.listen(process.env.PORT, () =>
    console.log("Server running on " + process.env.PORT)
  );
};

start();
