const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`Mongodb connected ${mongoose.connection.host}`.bgGreen.white);
  } catch (error) {
    console.log(`Mongodb Server Issue ${error}`.bgRed.white);
    console.log("\nPossible solutions:".yellow);
    console.log("1. Check your internet connection");
    console.log("2. Verify MongoDB Atlas IP whitelist includes your IP");
    console.log("3. Check if MongoDB connection string is correct in .env");
    console.log("4. Try whitelisting 0.0.0.0/0 (all IPs) in MongoDB Atlas for testing\n");
  }
};

module.exports = connectDB;