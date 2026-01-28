import express from "express";
import {
  createBooking,
  getBookingById,
  getUserBookings,
  updateBookingStatus,
  deleteBooking,
  getHotelBookings,
  getAllBookings,
  cancelBooking,
  autoCompleteExpiredBookings,
  checkRoomAvailability,
} from "../controllers/booking.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

// Get all bookings (for admin - requires token)
router.get("/", verifyToken, getAllBookings);

// Check room availability for specific dates
router.get("/availability/check", checkRoomAvailability);

// Auto-complete expired bookings
router.post("/action/auto-complete", verifyToken, autoCompleteExpiredBookings);

// Specific routes MUST come before generic /:id route
// Get user bookings
router.get("/user/:userId", verifyToken, getUserBookings);

// Get hotel bookings (for hotel admin)
router.get("/hotel/:hotelId", getHotelBookings);

// Create booking (không cần verify vì user info đã được gửi từ client)
router.post("/", createBooking);

// Generic routes after specific ones
// Get booking by ID
router.get("/:id", getBookingById);

// Update booking status
router.put("/:id", verifyToken, updateBookingStatus);

// Cancel booking (hoàn tiền)
router.put("/:id/cancel", verifyToken, cancelBooking);

// Delete booking
router.delete("/:id", verifyToken, deleteBooking);

export default router;
