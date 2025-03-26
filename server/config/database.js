const mongoose = require("mongoose");
require("dotenv").config({ path: "./server/.env" }); // Ensure correct .env path

const connectDB = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("❌ DATABASE_URL is missing in .env file!");
    }

    console.log("🔄 Connecting to MongoDB Atlas...");

    const conn = await mongoose.connect(process.env.DATABASE_URL);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}, Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
