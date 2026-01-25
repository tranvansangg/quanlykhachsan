import mongoose from "mongoose";
import Room from "./models/Room.js";

const MONGO_URL = "mongodb+srv://admin123:admin123@cluster0.mongod3.mongodb.net/test";

async function checkImages() {
  try {
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB\n");

    // Get first room with images
    const room = await Room.findOne({ images: { $exists: true, $ne: [] } });

    if (!room) {
      console.log("❌ No rooms with images found!");
      return;
    }

    console.log("🔍 Room found:", room._id);
    console.log("📸 Title:", room.title);
    console.log("📸 Images count:", room.images?.length || 0);
    
    if (room.images && room.images.length > 0) {
      const firstImage = room.images[0];
      
      console.log("\n📋 First image analysis:");
      console.log("   Type:", typeof firstImage);
      console.log("   Length:", firstImage?.length || 0);
      console.log("   First 100 chars:", firstImage?.substring(0, 100) || 'N/A');
      console.log("   Starts with 'data:'?", firstImage?.startsWith('data:') || false);
      console.log("   Starts with 'http'?", firstImage?.startsWith('http') || false);
      
      if (firstImage?.startsWith('data:')) {
        const match = firstImage.match(/^data:([^;]+);base64,/);
        if (match) {
          console.log("   Mime type:", match[1]);
          const base64Part = firstImage.substring(match[0].length);
          console.log("   Base64 part length:", base64Part.length);
          console.log("   First 50 chars of base64:", base64Part.substring(0, 50));
          
          // Validate base64
          try {
            const buffer = Buffer.from(base64Part, 'base64');
            console.log("   ✅ Valid base64 (decoded to", buffer.length, 'bytes)');
          } catch (e) {
            console.log("   ❌ Invalid base64:", e.message);
          }
        }
      }
    }

    console.log("\n✅ Diagnostic complete");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkImages();
