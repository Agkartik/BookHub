import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import connectDB from "../config/database.js";
import User from "../models/User.js";
import Music from "../models/Music.js";

dotenv.config();

const srcDir = "C:\\Windows\\Media";
const destDir = "uploads";

// Ensure destination uploads directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const copyFileSafe = (srcName, destName) => {
  const srcPath = path.join(srcDir, srcName);
  const destPath = path.join(destDir, destName);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${srcName} to ${destPath}`);
    return destPath.replace(/\\/g, "/"); // Return clean path for DB
  } else {
    console.warn(`Source file not found: ${srcPath}`);
    return null;
  }
};

const run = async () => {
  try {
    await connectDB();

    // Find or create admin to associate uploads
    let adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      adminUser = await User.findOne({});
    }
    if (!adminUser) {
      console.error("No user found in database. Please seed users first.");
      process.exit(1);
    }

    console.log(`Using user ${adminUser.name} (${adminUser.role}) for uploads.`);

    // Copy system sounds
    const calmPath = copyFileSafe("Windows Logon.wav", "calm_seeding.wav");
    const focusPath = copyFileSafe("Windows Foreground.wav", "focus_seeding.wav");
    const ambientPath = copyFileSafe("Windows Background.wav", "ambient_seeding.wav");
    const morningBirdsPath = copyFileSafe("Alarm01.wav", "morning_birds.wav");
    const cozyFireplacePath = copyFileSafe("Alarm02.wav", "cozy_fireplace.wav");
    const synthWavesPath = copyFileSafe("Ring01.wav", "synth_waves.wav");
    const cyberpunkPulsePath = copyFileSafe("Ring02.wav", "cyberpunk_pulse.wav");
    const celestialBellsPath = copyFileSafe("chimes.wav", "celestial_bells.wav");
    const loungePadsPath = copyFileSafe("chord.wav", "lounge_pads.wav");

    // Clean out existing seeded global tracks to avoid duplicates
    await Music.deleteMany({
      category: { $in: ["calm", "focus", "ambient"] },
      uploadedBy: adminUser._id
    });

    const tracksToSeed = [];

    if (calmPath) {
      tracksToSeed.push({
        title: "Ocean Calmness",
        artist: "Nature Sounds",
        url: calmPath,
        category: "calm",
        uploadedBy: adminUser._id
      });
    }

    if (focusPath) {
      tracksToSeed.push({
        title: "Deep Focus Flow",
        artist: "Mellow Waves",
        url: focusPath,
        category: "focus",
        uploadedBy: adminUser._id
      });
    }

    if (ambientPath) {
      tracksToSeed.push({
        title: "Rainy Library Desk",
        artist: "Atmosphere",
        url: ambientPath,
        category: "ambient",
        uploadedBy: adminUser._id
      });
    }

    if (morningBirdsPath) {
      tracksToSeed.push({
        title: "Morning Birds",
        artist: "Ambient Whispers",
        url: morningBirdsPath,
        category: "calm",
        uploadedBy: adminUser._id
      });
    }

    if (cozyFireplacePath) {
      tracksToSeed.push({
        title: "Cozy Fireplace",
        artist: "Warmth",
        url: cozyFireplacePath,
        category: "calm",
        uploadedBy: adminUser._id
      });
    }

    if (synthWavesPath) {
      tracksToSeed.push({
        title: "Synth Waves",
        artist: "Retro Flow",
        url: synthWavesPath,
        category: "focus",
        uploadedBy: adminUser._id
      });
    }

    if (cyberpunkPulsePath) {
      tracksToSeed.push({
        title: "Cyberpunk Pulse",
        artist: "Neo-City Rhythm",
        url: cyberpunkPulsePath,
        category: "focus",
        uploadedBy: adminUser._id
      });
    }

    if (celestialBellsPath) {
      tracksToSeed.push({
        title: "Celestial Bells",
        artist: "Chime Meditations",
        url: celestialBellsPath,
        category: "ambient",
        uploadedBy: adminUser._id
      });
    }

    if (loungePadsPath) {
      tracksToSeed.push({
        title: "Lounge Pads",
        artist: "Soft Chord Drift",
        url: loungePadsPath,
        category: "ambient",
        uploadedBy: adminUser._id
      });
    }

    if (tracksToSeed.length > 0) {
      await Music.insertMany(tracksToSeed);
      console.log(`Successfully seeded ${tracksToSeed.length} ambient music tracks!`);
    } else {
      console.error("No media files could be copied. Seeding aborted.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding music:", error);
    process.exit(1);
  }
};

run();
