import express from "express";
import { saveBase64Image } from "../utils/imageHandler.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// Upload image
router.post("/", verifyAdmin, async (req, res, next) => {
  try {
    const { base64 } = req.body;
    
    if (!base64) {
      return res.status(400).json({ message: "No image data provided" });
    }

    const filename = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
    const imageUrl = saveBase64Image(base64, filename);

    if (!imageUrl) {
      return res.status(500).json({ message: "Failed to save image" });
    }

    res.status(200).json({ url: imageUrl });
  } catch (error) {
    next(error);
  }
});

export default router;
