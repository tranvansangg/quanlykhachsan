import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },
    comment: {
      type: String,
      minlength: 10,
      maxlength: 1000,
      required: true,
    },
    verified: {
      type: Boolean,
      default: true, // true nếu user đã lưu trú thực tế
    },
  },
  { timestamps: true }
);

// Compound unique index: one review per user per hotel
ReviewSchema.index({ userId: 1, hotelId: 1 }, { unique: true });

export default mongoose.model("Review", ReviewSchema);
