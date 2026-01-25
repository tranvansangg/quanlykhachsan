import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../public/uploads/rooms");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const saveBase64Image = (base64String, filename) => {
  try {
    const buffer = Buffer.from(base64String.split(",")[1] || base64String, "base64");
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);
    return `/uploads/rooms/${filename}`;
  } catch (error) {
    console.error("Error saving image:", error);
    return null;
  }
};

export const deleteImage = (filename) => {
  try {
    const filepath = path.join(uploadsDir, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};
