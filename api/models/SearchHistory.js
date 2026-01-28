import mongoose from "mongoose";

const SearchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    checkInDate: {
      type: Date,
    },
    checkOutDate: {
      type: Date,
    },
    guests: {
      type: Number,
      default: 1,
    },
    rooms: {
      type: Number,
      default: 1,
    },
    priceMin: {
      type: Number,
    },
    priceMax: {
      type: Number,
    },
    searchQuery: {
      type: String, // Full search query string for display
    },
  },
  { timestamps: true }
);

// Index for efficient queries
SearchHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("SearchHistory", SearchHistorySchema);
