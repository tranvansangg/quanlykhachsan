import mongoose from "mongoose";
import dotenv from "dotenv";
import Room from "./models/Room.js";

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");

    // Update all rooms that don't have images field
    const result = await Room.updateMany(
      { images: { $exists: false } },
      { $set: { images: [] } }
    );

    console.log(`Updated ${result.modifiedCount} rooms with empty images array`);
    
    // Show sample room
    const sampleRoom = await Room.findOne().limit(1);
    console.log("Sample room:", sampleRoom);

    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

migrate();
