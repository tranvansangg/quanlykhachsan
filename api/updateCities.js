import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "./models/Hotel.js";

dotenv.config();

mongoose.connect(process.env.MONGO).then(async () => {
  try {
    // Update all hotels to have normalized city names
    const result = await Hotel.updateMany({}, { city: "da nang" });
    console.log("Updated:", result.modifiedCount, "hotels");
    
    // Get all hotels to verify
    const hotels = await Hotel.find();
    console.log("Hotels:", hotels.map(h => ({ name: h.name, city: h.city })));
    
    process.exit(0);
  } catch (e) {
    console.log("Error:", e.message);
    process.exit(1);
  }
});
