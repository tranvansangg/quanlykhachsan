import express from "express";
import { 
  addFavorite, 
  removeFavorite, 
  getFavorites,
  getFavoriteHotels,
  isFavorite,
  toggleFavorite
} from "../controllers/favorite.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

// Add to favorites
router.post("/:userId/add", verifyToken, addFavorite);

// Remove from favorites
router.post("/:userId/remove", verifyToken, removeFavorite);

// Toggle favorite (add or remove)
router.post("/:userId/toggle", verifyToken, toggleFavorite);

// Get user's favorite hotel IDs
router.get("/:userId", verifyToken, getFavorites);

// Get user's favorite hotels with full details
router.get("/:userId/hotels", verifyToken, getFavoriteHotels);

// Check if hotel is favorite
router.get("/:userId/check", verifyToken, isFavorite);

export default router;
