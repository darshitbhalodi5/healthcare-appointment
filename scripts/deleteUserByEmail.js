#!/usr/bin/env node
/**
 * Delete a user or doctor by email and all associated data.
 * 
 * This script will:
 * - Find the user by email
 * - If user is a doctor, delete the doctor record
 * - Delete all appointments where user is patient (userId) or doctor (doctorId)
 * - Delete the user record
 * 
 * Usage:
 *   node scripts/deleteUserByEmail.js user@example.com
 * 
 * Requires MONGO_URL in the environment (loads via dotenv).
 */
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectDB = require("../config/db");
const userModel = require("../models/userModels");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");

const email = process.argv[2];

if (!email) {
  console.error("❌  Please provide the user email.\nUsage: node scripts/deleteUserByEmail.js user@example.com");
  process.exit(1);
}

const deleteUserByEmail = async () => {
  try {
    await connectDB();
    console.log("🔍 Searching for user with email:", email);

    // Find user by email
    const user = await userModel.findOne({ email });

    if (!user) {
      console.error(`⚠️  No user found with email: ${email}`);
      process.exitCode = 1;
      return;
    }

    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`   User ID: ${user._id}`);
    console.log(`   Is Doctor: ${user.isDoctor}`);
    console.log(`   Is Admin: ${user.isAdmin}`);

    // Prevent deleting admin users (safety check)
    if (user.isAdmin) {
      console.error(`⚠️  Cannot delete admin user: ${email}`);
      console.error("   Please remove admin privileges first if you want to delete this user.");
      process.exitCode = 1;
      return;
    }

    const userId = user._id.toString();
    let deletedCount = 0;

    // Step 1: If user is a doctor, delete doctor record
    if (user.isDoctor) {
      console.log("\n🔍 Searching for doctor record...");
      const doctor = await doctorModel.findOne({ userId: userId });
      
      if (doctor) {
        await doctorModel.findByIdAndDelete(doctor._id);
        console.log(`✅ Deleted doctor record: Dr. ${doctor.firstName} ${doctor.lastName}`);
        deletedCount++;
      } else {
        console.log("⚠️  User marked as doctor but no doctor record found");
      }
    }

    // Step 2: Delete all appointments where user is patient (userId)
    console.log("\n🔍 Searching for appointments where user is patient...");
    const patientAppointments = await appointmentModel.find({ userId: userId });
    if (patientAppointments.length > 0) {
      await appointmentModel.deleteMany({ userId: userId });
      console.log(`✅ Deleted ${patientAppointments.length} appointment(s) where user is patient`);
      deletedCount += patientAppointments.length;
    } else {
      console.log("   No appointments found where user is patient");
    }

    // Step 3: Delete all appointments where user is doctor (doctorId)
    console.log("\n🔍 Searching for appointments where user is doctor...");
    const doctorAppointments = await appointmentModel.find({ doctorId: userId });
    if (doctorAppointments.length > 0) {
      await appointmentModel.deleteMany({ doctorId: userId });
      console.log(`✅ Deleted ${doctorAppointments.length} appointment(s) where user is doctor`);
      deletedCount += doctorAppointments.length;
    } else {
      console.log("   No appointments found where user is doctor");
    }

    // Step 4: Delete the user record
    console.log("\n🔍 Deleting user record...");
    await userModel.findByIdAndDelete(user._id);
    console.log(`✅ Deleted user record: ${user.firstName} ${user.lastName} (${user.email})`);
    deletedCount++;

    console.log("\n" + "=".repeat(50));
    console.log(`✅ Successfully deleted user and all associated data!`);
    console.log(`   Total records deleted: ${deletedCount}`);
    console.log(`   - User record: 1`);
    if (user.isDoctor) {
      console.log(`   - Doctor record: 1`);
    }
    console.log(`   - Appointments: ${patientAppointments.length + doctorAppointments.length}`);
    console.log("=".repeat(50));

  } catch (error) {
    console.error("❌  Failed to delete user:", error.message);
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
};

deleteUserByEmail();

