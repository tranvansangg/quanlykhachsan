import User from "../models/User.js";
import Hotel from "../models/Hotel.js";
import { createError } from "../utils/error.js";

// Add hotel to favorites
export const addFavorite = async (req, res, next) => {
  try {
    const { hotelId } = req.body;
    const userId = req.params.userId;

    if (!hotelId) {
      return next(createError(400, "Hotel ID is required"));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Check if already in favorites
    if (user.favorites.includes(hotelId)) {
      return res.status(200).json({ 
        message: "Hotel already in favorites",
        isFavorite: true 
      });
    }

    // Add to favorites
    user.favorites.push(hotelId);
    await user.save();

    res.status(200).json({ 
      message: "Hotel added to favorites",
      isFavorite: true 
    });
  } catch (err) {
    next(err);
  }
};

// Remove hotel from favorites
export const removeFavorite = async (req, res, next) => {
  try {
    const { hotelId } = req.body;
    const userId = req.params.userId;

    if (!hotelId) {
      return next(createError(400, "Hotel ID is required"));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Remove from favorites
    user.favorites = user.favorites.filter((id) => id !== hotelId);
    await user.save();

    res.status(200).json({ 
      message: "Hotel removed from favorites",
      isFavorite: false 
    });
  } catch (err) {
    next(err);
  }
};

// Get user's favorites
export const getFavorites = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select("favorites");
    if (!user) {
      return next(createError(404, "User not found"));
    }

    res.status(200).json({
      favorites: user.favorites,
      count: user.favorites.length,
    });
  } catch (err) {
    next(err);
  }
};

// Check if hotel is in user's favorites
export const isFavorite = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const { hotelId } = req.query;

    if (!hotelId) {
      return next(createError(400, "Hotel ID is required"));
    }

    const user = await User.findById(userId).select("favorites");
    if (!user) {
      return next(createError(404, "User not found"));
    }

    const favorite = user.favorites.includes(hotelId);

    res.status(200).json({
      isFavorite: favorite,
    });
  } catch (err) {
    next(err);
  }
};

// Toggle favorite (add or remove)
export const toggleFavorite = async (req, res, next) => {
  try {
    const { hotelId } = req.body;
    const userId = req.params.userId;

    if (!hotelId) {
      return next(createError(400, "Hotel ID is required"));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    let isFav;
    if (user.favorites.includes(hotelId)) {
      user.favorites = user.favorites.filter((id) => id !== hotelId);
      isFav = false;
    } else {
      user.favorites.push(hotelId);
      isFav = true;
    }

    await user.save();

    res.status(200).json({
      message: isFav ? "Hotel added to favorites" : "Hotel removed from favorites",
      isFavorite: isFav,
    });
  } catch (err) {
    next(err);
  }
};

// Get user's favorite hotels with details
export const getFavoriteHotels = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select("favorites");
    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Get hotel details for all favorites
    const hotels = await Hotel.find({ _id: { $in: user.favorites } });

    res.status(200).json({
      count: hotels.length,
      hotels: hotels,
    });
  } catch (err) {
    next(err);
  }
};
