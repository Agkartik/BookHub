import dotenv from "dotenv";
import connectDB from "../config/database.js";

dotenv.config();

await connectDB();
console.log("Database check OK");
process.exit(0);
