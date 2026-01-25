import Review from "../models/Review.js";
import Hotel from "../models/Hotel.js";
import { createError } from "../utils/error.js";

// Thêm review
export const createReview = async (req, res, next) => {
  const { hotelId } = req.params;
  const { userName, userCountry, ratings, comment, positivePoints, negativePoints, visitDate } = req.body;

  try {
    // Kiểm tra hotel tồn tại
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return next(createError(404, "Hotel not found"));
    }

    // Tính điểm trung bình
    const overallRating = (
      ratings.staff +
      ratings.facilities +
      ratings.cleanliness +
      ratings.comfort +
      ratings.valueForMoney +
      ratings.location
    ) / 6;

    const newReview = new Review({
      hotelId,
      userId: req.user?.id || "anonymous",
      userName,
      userCountry,
      verified: !!req.user?.id, // Xác thực nếu có user ID
      ratings,
      overallRating: Math.round(overallRating * 10) / 10,
      comment,
      positivePoints,
      negativePoints,
      visitDate,
    });

    const savedReview = await newReview.save();

    // Thêm review vào hotel
    await Hotel.findByIdAndUpdate(
      hotelId,
      { $push: { reviews: savedReview._id } },
      { new: true }
    );

    // Cập nhật ratings tổng của hotel
    await updateHotelRatings(hotelId);

    res.status(201).json(savedReview);
  } catch (err) {
    next(err);
  }
};

// Lấy tất cả reviews của hotel
export const getHotelReviews = async (req, res, next) => {
  const { hotelId } = req.params;
  const { limit = 10, skip = 0 } = req.query;

  try {
    const reviews = await Review.find({ hotelId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const totalReviews = await Review.countDocuments({ hotelId });

    res.status(200).json({
      reviews,
      total: totalReviews,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy tất cả reviews (không phân theo hotel)
export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    next(err);
  }
};

// Cập nhật ratings tổng của hotel
const updateHotelRatings = async (hotelId) => {
  try {
    const reviews = await Review.find({ hotelId });

    if (reviews.length === 0) {
      await Hotel.findByIdAndUpdate(hotelId, {
        ratings: {
          overall: 0,
          staff: 0,
          facilities: 0,
          cleanliness: 0,
          comfort: 0,
          valueForMoney: 0,
          location: 0,
        },
      });
      return;
    }

    // Tính trung bình cho mỗi tiêu chí
    const avgRatings = {
      staff: reviews.reduce((sum, r) => sum + r.ratings.staff, 0) / reviews.length,
      facilities: reviews.reduce((sum, r) => sum + r.ratings.facilities, 0) / reviews.length,
      cleanliness: reviews.reduce((sum, r) => sum + r.ratings.cleanliness, 0) / reviews.length,
      comfort: reviews.reduce((sum, r) => sum + r.ratings.comfort, 0) / reviews.length,
      valueForMoney: reviews.reduce((sum, r) => sum + r.ratings.valueForMoney, 0) / reviews.length,
      location: reviews.reduce((sum, r) => sum + r.ratings.location, 0) / reviews.length,
    };

    const overall =
      (avgRatings.staff +
        avgRatings.facilities +
        avgRatings.cleanliness +
        avgRatings.comfort +
        avgRatings.valueForMoney +
        avgRatings.location) /
      6;

    // Làm tròn đến 1 chữ số thập phân
    Object.keys(avgRatings).forEach((key) => {
      avgRatings[key] = Math.round(avgRatings[key] * 10) / 10;
    });

    await Hotel.findByIdAndUpdate(hotelId, {
      ratings: {
        overall: Math.round(overall * 10) / 10,
        ...avgRatings,
      },
    });
  } catch (err) {
    console.error("Error updating hotel ratings:", err);
  }
};

// Xóa review
export const deleteReview = async (req, res, next) => {
  const { reviewId, hotelId } = req.params;

  try {
    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
      return next(createError(404, "Review not found"));
    }

    // Xóa review khỏi hotel
    await Hotel.findByIdAndUpdate(hotelId, {
      $pull: { reviews: reviewId },
    });

    // Cập nhật ratings
    await updateHotelRatings(hotelId);

    res.status(200).json("Review deleted successfully");
  } catch (err) {
    next(err);
  }
};

// Đánh dấu review hữu ích
export const markReviewHelpful = async (req, res, next) => {
  const { reviewId } = req.params;

  try {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    res.status(200).json(review);
  } catch (err) {
    next(err);
  }
};
