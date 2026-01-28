import express from "express";
import {
  saveSearch,
  getSearchHistory,
  getPopularSearches,
  deleteSearch,
  clearSearchHistory,
} from "../controllers/searchHistory.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

// Save a search
router.post("/:userId/save", verifyToken, saveSearch);

// Get user's search history
router.get("/:userId/history", verifyToken, getSearchHistory);

// Get popular searches (public)
router.get("/popular/list", getPopularSearches);

// Delete a specific search
router.delete("/:userId/search/:searchId", verifyToken, deleteSearch);

// Clear all search history for user
router.delete("/:userId/clear", verifyToken, clearSearchHistory);

export default router;
