import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "./models/Hotel.js";
import Room from "./models/Room.js";
import User from "./models/User.js";
import Review from "./models/Review.js";

dotenv.config();

const clearSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");

    // Keep only admin user, delete test users
    const adminUser = await User.findOne({ username: "admin" });
    
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await Review.deleteMany({});
    
    if (!adminUser) {
      await User.deleteMany({});
      console.log("Cleared all users (no admin found)");
    } else {
      await User.deleteMany({ username: { $ne: "admin" } });
      console.log("Cleared sample users, kept admin");
    }

    console.log("\n=== Database After Cleanup ===");
    const hotelCount = await Hotel.countDocuments();
    const roomCount = await Room.countDocuments();
    const userCount = await User.countDocuments();
    const reviewCount = await Review.countDocuments();

    console.log(`Hotels: ${hotelCount}`);
    console.log(`Rooms: ${roomCount}`);
    console.log(`Users: ${userCount}`);
    console.log(`Reviews: ${reviewCount}`);

    console.log("\n✅ Sample data cleared. Dashboard will show real data from MongoDB.");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

clearSampleData();
