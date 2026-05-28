import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const connectWithUri = async (uri) => {
  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
  });
};

const connectDB = async () => {
  const attempts = [];

  if (process.env.USE_LOCAL_MONGO === "true" && process.env.MONGO_URI_LOCAL) {
    attempts.push({ label: "Local", uri: process.env.MONGO_URI_LOCAL });
  }

  if (process.env.MONGO_URI) {
    attempts.push({ label: "Atlas SRV", uri: process.env.MONGO_URI });
  }

  if (process.env.MONGO_URI_DIRECT) {
    attempts.push({ label: "Atlas Direct", uri: process.env.MONGO_URI_DIRECT });
  }

  if (!attempts.length) {
    console.error("No MongoDB URI configured. Check backend/.env");
    process.exit(1);
  }

  let lastError;

  for (const { label, uri } of attempts) {
    try {
      console.log(`Trying MongoDB (${label})...`);
      const conn = await connectWithUri(uri);
      console.log(`MongoDB Connected (${label}): ${conn.connection.host}`);
      console.log(`Database: ${conn.connection.name}`);
      return;
    } catch (err) {
      lastError = err;
      console.warn(`  → failed: ${err.message}`);
    }
  }

  console.error("\nMongoDB connection failed:", lastError?.message);
  console.error("\n=== FASTEST FIX (local, 2 commands) ===");
  console.error("docker run -d -p 27017:27017 --name bookverse-mongo mongo:7");
  console.error("Set in .env: USE_LOCAL_MONGO=true");
  console.error("Then: npm run seed && npm run dev");
  console.error("\n=== ATLAS FIX (bad auth) ===");
  console.error("1. Atlas → Database Access → ADD user: bookverse_app");
  console.error("2. Password: BookVerse2026 | Role: readWriteAnyDatabase");
  console.error("3. Connect → Drivers → copy connection string into MONGO_URI");
  console.error("4. Set USE_LOCAL_MONGO=false");
  process.exit(1);
};

export default connectDB;
