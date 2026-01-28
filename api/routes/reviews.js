import express from "express";
import mongoose from "mongoose";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";

const router = express.Router();

// Helper: Verify user has completed booking for hotel
const verifyCompletedBooking = async (userId, hotelId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Convert userId to ObjectId if it's a string
    let userObjId;
    try {
      userObjId = new mongoose.Types.ObjectId(userId);
    } catch (e) {
      console.log("Invalid userId format:", userId);
      return false;
    }

    // Find booking where user finished their stay
    const booking = await Booking.findOne({
      userId: userObjId,
      hotelId: hotelId,
      status: { $in: ["completed", "confirmed"] },
    });

    if (!booking || !booking.dates || !booking.dates.endDate) {
      console.log("No booking or dates found for user:", userId, "hotel:", hotelId);
      return false;
    }

    // Check if checkout date has passed or is today
    const checkoutDate = new Date(booking.dates.endDate);
    checkoutDate.setHours(0, 0, 0, 0);

    // Allow review if checkout date is today or earlier
    // Add 1 day tolerance to handle timezone differences
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const canReview = checkoutDate <= tomorrow;
    console.log("Booking found. Checkout:", checkoutDate, "Today:", today, "Tomorrow:", tomorrow, "Can review:", canReview);
    return canReview;
  } catch (err) {
    console.error("Error verifying booking:", err);
    return false;
  }
};

// POST /reviews - Create or Update review
router.post("/", async (req, res) => {
  try {
    const { userId, hotelId, rating, comment } = req.body;

    // Validate input
    if (!userId || !hotelId || rating === undefined || !comment) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (rating < 0 || rating > 10 || !Number.isInteger(rating)) {
      return res.status(400).json({ message: "Rating must be integer 0-10" });
    }

    if (comment.length < 10 || comment.length > 1000) {
      return res
        .status(400)
        .json({ message: "Comment must be 10-1000 characters" });
    }

    // Verify user has completed booking for this hotel
    const hasBooking = await verifyCompletedBooking(userId, hotelId);
    if (!hasBooking) {
      return res.status(403).json({
        message:
          "Bạn cần hoàn thành đặt phòng để đánh giá. Vui lòng hoàn thành kỳ lưu trú của bạn trước.",
      });
    }

    // Check if review already exists (for this user + hotel)
    let review = await Review.findOne({ userId, hotelId });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment;
      review.updatedAt = new Date();
    } else {
      // Create new review
      review = new Review({
        userId,
        hotelId,
        rating,
        comment,
      });
    }

    await review.save();
    res.status(201).json({
      success: true,
      message: review.createdAt ? "Đánh giá đã được tạo" : "Đánh giá đã được cập nhật",
      review,
    });
  } catch (err) {
    console.error("Error creating/updating review:", err);
    res.status(500).json({ message: "Lỗi khi lưu đánh giá", error: err.message });
  }
});

// GET /reviews/hotel/:hotelId - Get all reviews for a hotel
router.get("/hotel/:hotelId", async (req, res) => {
  try {
    const { hotelId } = req.params;

    const reviews = await Review.find({ hotelId }).sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      totalReviews: reviews.length,
      avgRating: parseFloat(avgRating),
      reviews,
    });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ message: "Lỗi khi lấy đánh giá" });
  }
});

// GET /reviews/check/:userId/:hotelId - Check if user can review and if already reviewed
router.get("/check/:userId/:hotelId", async (req, res) => {
  try {
    const { userId, hotelId } = req.params;

    // Check if user has completed booking
    const hasCompletedBooking = await verifyCompletedBooking(userId, hotelId);

    // Check if user already reviewed
    const existingReview = await Review.findOne({ userId, hotelId });

    res.status(200).json({
      success: true,
      canReview: hasCompletedBooking,
      hasReviewed: !!existingReview,
      review: existingReview || null,
      message: !hasCompletedBooking
        ? "Bạn cần hoàn thành đặt phòng để đánh giá"
        : "Bạn có thể đánh giá khách sạn này",
    });
  } catch (err) {
    console.error("Error checking review eligibility:", err);
    res.status(500).json({ message: "Lỗi khi kiểm tra" });
  }
});

// DELETE /reviews/:reviewId - Delete review (admin or review owner)
router.delete("/:reviewId", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.body; // Client must send userId to verify ownership

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Verify ownership (simple check, should be improved with auth middleware)
    if (review.userId !== userId) {
      return res.status(403).json({ message: "Không có quyền xóa đánh giá này" });
    }

    await Review.findByIdAndDelete(reviewId);
    res.status(200).json({ success: true, message: "Đánh giá đã được xóa" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ message: "Lỗi khi xóa đánh giá" });
  }
});

export default router;
