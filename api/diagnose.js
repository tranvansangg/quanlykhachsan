// Diagnostic script to check image handling issues

console.log("=== Image Handling Diagnostic ===\n");

// 1. Check if images directory exists
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "public/uploads/rooms");

console.log("1. Checking uploads directory:");
console.log("   Path:", uploadsDir);
console.log("   Exists:", fs.existsSync(uploadsDir));

if (fs.existsSync(uploadsDir)) {
  const files = fs.readdirSync(uploadsDir);
  console.log("   Files in directory:", files.length);
  if (files.length > 0) {
    console.log("   Sample files:", files.slice(0, 3));
  }
}

// 2. Test base64 conversion
console.log("\n2. Testing base64 conversion:");
const testBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
try {
  const buffer = Buffer.from(testBase64, "base64");
  console.log("   Base64 buffer size:", buffer.length, "bytes");
  console.log("   ✓ Base64 conversion works");
} catch (error) {
  console.log("   ✗ Base64 conversion failed:", error.message);
}

// 3. Check imageHandler
console.log("\n3. Checking imageHandler import:");
try {
  import("./utils/imageHandler.js").then(module => {
    console.log("   ✓ imageHandler.js can be imported");
    console.log("   Functions:", Object.keys(module));
  });
} catch (error) {
  console.log("   ✗ imageHandler.js import failed:", error.message);
}

console.log("\n=== End Diagnostic ===");
