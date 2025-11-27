#!/usr/bin/env node
/**
 * Promote an existing user to admin by email.
 *
 * Usage:
 *   node scripts/promoteAdmin.js user@example.com
 *
 * Requires MONGO_URL in the environment (loads via dotenv).
 */
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectDB = require("../config/db");
const userModel = require("../models/userModels");

const email = process.argv[2];

if (!email) {
  console.error("❌  Please provide the user email.\nUsage: node scripts/promoteAdmin.js user@example.com");
  process.exit(1);
}

const promote = async () => {
  try {
    await connectDB();
    const user = await userModel.findOneAndUpdate(
      { email },
      { $set: { isAdmin: true } },
      { new: true }
    );

    if (!user) {
      console.error(`⚠️  No user found with email: ${email}`);
      process.exitCode = 1;
    } else {
      console.log(`✅  User ${user.firstName} ${user.lastName} (${user.email}) is now an admin.`);
    }
  } catch (error) {
    console.error("❌  Failed to promote user:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

promote();

