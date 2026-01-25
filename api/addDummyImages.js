import mongoose from "mongoose";
import dotenv from "dotenv";
import Room from "./models/Room.js";

dotenv.config();

const addDummyImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("✓ Connected to MongoDB\n");

    // Sample base64 image (small 1x1 pixel PNG - 70 bytes when compressed)
    const dummyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    
    // More realistic sample image
    const sampleImage = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";

    // Update all rooms to add 3 sample images each
    const result = await Room.updateMany(
      {},
      {
        $set: {
          images: [sampleImage, sampleImage, sampleImage]
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} rooms with 3 sample images each`);

    // Verify
    const updatedRooms = await Room.find().select("title images");
    console.log(`\n📸 Sample rooms with images:\n`);
    updatedRooms.slice(0, 3).forEach((room, i) => {
      console.log(`${i + 1}. ${room.title} - ${room.images?.length || 0} images`);
    });

    console.log("\n✓ Done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

addDummyImages();
