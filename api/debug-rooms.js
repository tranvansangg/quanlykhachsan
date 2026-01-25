import mongoose from "mongoose";
import dotenv from "dotenv";
import Room from "./models/Room.js";

dotenv.config();

const debug = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("✓ Connected to MongoDB\n");

    // Count total rooms
    const totalCount = await Room.countDocuments();
    console.log(`📊 Total rooms in database: ${totalCount}`);

    // Get all rooms
    const allRooms = await Room.find().select("_id title price hotelId");
    console.log(`\n🔍 All ${allRooms.length} rooms:\n`);
    
    allRooms.forEach((room, i) => {
      console.log(`${i + 1}. ${room.title} - Price: $${room.price} - HotelId: ${room.hotelId}`);
    });

    // Check price distribution
    const priceStats = await Room.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          avgPrice: { $avg: "$price" }
        }
      }
    ]);

    if (priceStats.length > 0) {
      console.log(`\n💰 Price Statistics:`);
      console.log(`  Min: $${priceStats[0].minPrice}`);
      console.log(`  Max: $${priceStats[0].maxPrice}`);
      console.log(`  Avg: $${priceStats[0].avgPrice.toFixed(2)}`);
    }

    console.log("\n✓ Debug complete");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

debug();
