import SearchHistory from "../models/SearchHistory.js";

export const saveSearch = async (req, res) => {
  try {
    const { destination, checkInDate, checkOutDate, guests, rooms, priceMin, priceMax, searchQuery } = req.body;
    const userId = req.params.userId;

    if (!destination) {
      return res.status(400).json({ message: "Destination is required" });
    }

    const newSearch = new SearchHistory({
      userId,
      destination,
      checkInDate,
      checkOutDate,
      guests,
      rooms,
      priceMin,
      priceMax,
      searchQuery,
    });

    await newSearch.save();
    res.status(201).json({ message: "Search saved successfully", search: newSearch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSearchHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = req.query.limit || 10;

    // Get latest searches, remove duplicates by destination
    const searches = await SearchHistory.aggregate([
      { $match: { userId } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$destination",
          destination: { $first: "$destination" },
          checkInDate: { $first: "$checkInDate" },
          checkOutDate: { $first: "$checkOutDate" },
          guests: { $first: "$guests" },
          rooms: { $first: "$rooms" },
          priceMin: { $first: "$priceMin" },
          priceMax: { $first: "$priceMax" },
          searchQuery: { $first: "$searchQuery" },
          createdAt: { $first: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $limit: parseInt(limit) },
      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json({ searches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPopularSearches = async (req, res) => {
  try {
    const limit = req.query.limit || 10;

    const popularSearches = await SearchHistory.aggregate([
      {
        $group: {
          _id: "$destination",
          destination: { $first: "$destination" },
          count: { $sum: 1 },
          lastSearched: { $max: "$createdAt" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.status(200).json({ popularSearches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSearch = async (req, res) => {
  try {
    const { userId, searchId } = req.params;

    const search = await SearchHistory.findById(searchId);
    if (!search) {
      return res.status(404).json({ message: "Search not found" });
    }

    if (search.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await SearchHistory.findByIdAndDelete(searchId);
    res.status(200).json({ message: "Search deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearSearchHistory = async (req, res) => {
  try {
    const userId = req.params.userId;

    await SearchHistory.deleteMany({ userId });
    res.status(200).json({ message: "Search history cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
