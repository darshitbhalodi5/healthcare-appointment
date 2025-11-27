// Utility script to clean up unverified users from database
// Run this with: node utils/cleanupUnverifiedUsers.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userModel = require("../models/userModels");
const colors = require("colors");

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected`.bgGreen.white);
  } catch (error) {
    console.log(`MongoDB Server Error: ${error}`.bgRed.white);
  }
};

// Clean up unverified users
const cleanupUnverifiedUsers = async () => {
  try {
    await connectDB();

    console.log("\nSearching for unverified users...".yellow);

    const unverifiedUsers = await userModel.find({ emailVerified: false });

    if (unverifiedUsers.length === 0) {
      console.log("No unverified users found.".green);
    } else {
      console.log(`\nFound ${unverifiedUsers.length} unverified user(s):`.cyan);
      unverifiedUsers.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}, Created: ${user.createdAt || 'N/A'}`);
      });

      console.log("\nDeleting unverified users...".yellow);
      const result = await userModel.deleteMany({ emailVerified: false });
      console.log(`✓ Deleted ${result.deletedCount} unverified user(s)`.green);
    }

    console.log("\nCleanup complete!".bgGreen.white);
    process.exit(0);
  } catch (error) {
    console.error("Error during cleanup:", error);
    process.exit(1);
  }
};

// Run the cleanup
cleanupUnverifiedUsers();
