import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "./models/Hotel.js";
import Room from "./models/Room.js";
import User from "./models/User.js";
import Review from "./models/Review.js";

dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");

    const hotelCount = await Hotel.countDocuments();
    const roomCount = await Room.countDocuments();
    const userCount = await User.countDocuments();
    const reviewCount = await Review.countDocuments();

    console.log("\n=== Database Record Counts ===");
    console.log(`Hotels: ${hotelCount}`);
    console.log(`Rooms: ${roomCount}`);
    console.log(`Users: ${userCount}`);
    console.log(`Reviews: ${reviewCount}`);

    // Sample data
    const hotel = await Hotel.findOne();
    console.log("\nSample Hotel:", hotel?.name || "None");

    const room = await Room.findOne();
    console.log("Sample Room:", room?.title || "None");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

checkData();
