import express from "express";
import {
  createReview,
  getHotelReviews,
  getReviews,
  deleteReview,
  markReviewHelpful,
} from "../controllers/review.js";
import { verifyToken, verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// Lấy tất cả reviews
router.get("/", verifyAdmin, getReviews);

// Thêm review
router.post("/:hotelId", verifyToken, createReview);

// Lấy reviews của hotel
router.get("/:hotelId", getHotelReviews);

// Xóa review
router.delete("/:reviewId/:hotelId", verifyAdmin, deleteReview);

// Đánh dấu hữu ích
router.patch("/:reviewId/helpful", markReviewHelpful);

export default router;
