import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: "hotelId",
        select: "name city"
      })
      .populate({
        path: "userId",
        select: "username email"
      })
      .select("_id hotelId userId userName status paymentStatus totalAmount createdAt paymentDate dates")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const {
      hotelId,
      userId,
      userName,
      roomTypes,
      selectedRooms,
      totalAmount,
      dates,
      cardholderName,
      status,
    } = req.body;

    // Validate required fields
    if (!hotelId || !userId || !totalAmount || !dates) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin",
      });
    }

    // Create new booking
    const newBooking = new Booking({
      hotelId,
      userId,
      userName,
      roomTypes,
      selectedRooms,
      totalAmount,
      dates,
      cardholderName,
      status: status || "confirmed",
    });

    // Save booking to database
    const savedBooking = await newBooking.save();

    res.status(201).json({
      success: true,
      message: "Đặt phòng thành công",
      data: savedBooking,
    });
  } catch (err) {
    next(err);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "hotelId",
        select: "name address city country"
      })
      .populate({
        path: "userId",
        select: "username email phone country city address"
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn đặt phòng",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserBookings = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({ userId })
      .populate({
        path: "hotelId",
        select: "name city"
      })
      .populate({
        path: "roomTypes",
        select: "title price"
      })
      .select("_id hotelId userId status paymentStatus totalAmount createdAt dates roomTypes selectedRooms paymentDate")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn đặt phòng",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật đơn đặt phòng thành công",
      data: updatedBooking,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Xóa đơn đặt phòng thành công",
    });
  } catch (err) {
    next(err);
  }
};

export const getHotelBookings = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    const bookings = await Booking.find({ hotelId })
      .populate({
        path: "userId",
        select: "username email"
      })
      .select("_id hotelId userId status paymentStatus totalAmount createdAt dates")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find booking
    const booking = await Booking.findById(id)
      .populate("hotelId")
      .populate("roomTypes");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn đặt phòng",
      });
    }

    // Check if already cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Đơn đặt phòng đã bị hủy trước đó",
      });
    }

    // Update booking status
    booking.status = "cancelled";
    booking.paymentStatus = "refunded";
    booking.cancelDate = new Date();
    await booking.save();

    // Remove unavailableDates from rooms
    if (booking.selectedRooms && booking.dates) {
      try {
        // Get all room types from booking (safer approach)
        if (booking.roomTypes && Array.isArray(booking.roomTypes) && booking.roomTypes.length > 0) {
          const startDate = new Date(booking.dates.startDate);
          const endDate = new Date(booking.dates.endDate);

          // Generate array of date strings to remove (YYYY-MM-DD format)
          const datesToRemove = [];
          const currentDate = new Date(startDate);
          currentDate.setUTCHours(0, 0, 0, 0);

          while (currentDate < endDate) {
            datesToRemove.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
          }

          // Process each room type in the booking
          for (const roomTypeData of booking.roomTypes) {
            // Get the actual room document by ID
            const room = await Room.findById(roomTypeData._id);

            if (room && room.roomNumbers && Array.isArray(room.roomNumbers)) {
              // Remove dates from each room number
              room.roomNumbers.forEach((roomNumber) => {
                if (roomNumber.unavailableDates && Array.isArray(roomNumber.unavailableDates)) {
                  roomNumber.unavailableDates = roomNumber.unavailableDates.filter((date) => {
                    const dateStr = new Date(date).toISOString().split('T')[0];
                    return !datesToRemove.includes(dateStr);
                  });
                }
              });

              await room.save();
            }
          }
        }
      } catch (roomErr) {
        console.error('Error removing unavailableDates:', roomErr);
        // Don't block the cancellation if room update fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Hủy đặt phòng thành công. Tiền sẽ được hoàn lại trong 3-5 ngày làm việc",
      data: {
        bookingId: booking._id,
        refundAmount: booking.totalAmount,
        refundStatus: "refunded",
        cancelDate: booking.cancelDate,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const autoCompleteExpiredBookings = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all bookings with checkout date in the past, not completed, not cancelled
    const expiredBookings = await Booking.find({
      $and: [
        { "dates.endDate": { $lt: today } },
        { status: { $nin: ["completed", "cancelled"] } }
      ]
    });

    if (expiredBookings.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Không có đơn nào cần hoàn thành",
        completedCount: 0,
      });
    }

    // Update all expired bookings to completed
    const result = await Booking.updateMany(
      {
        $and: [
          { "dates.endDate": { $lt: today } },
          { status: { $nin: ["completed", "cancelled"] } }
        ]
      },
      { status: "completed" },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Đã hoàn thành ${result.modifiedCount} đơn đặt quá hạn`,
      completedCount: result.modifiedCount,
    });
  } catch (err) {
    next(err);
  }
};

// Check room availability for specific dates
export const checkRoomAvailability = async (req, res, next) => {
  try {
    const { hotelId, checkInDate, checkOutDate } = req.query;

    if (!hotelId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp hotelId, checkInDate và checkOutDate",
      });
    }

    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);

    // Debug logging
    console.log(`[Availability Check] Hotel: ${hotelId}, CheckIn: ${startDate}, CheckOut: ${endDate}`);

    // Find all active/confirmed bookings that overlap with the requested date range
    // Overlap condition: requestCheckIn < bookingCheckOut AND requestCheckOut > bookingCheckIn
    const conflictingBookings = await Booking.find({
      hotelId: hotelId,
      status: { $in: ["confirmed", "completed"] }, // Only confirmed or completed bookings
      $and: [
        { "dates.startDate": { $lt: endDate } },
        { "dates.endDate": { $gt: startDate } },
      ],
    }).select("selectedRooms dates status");

    console.log(`[Availability Check] Found ${conflictingBookings.length} conflicting bookings`);

    // Build a set of booked room type IDs
    const bookedRoomIds = new Set();
    conflictingBookings.forEach((booking) => {
      console.log(`[Booking] Dates: ${booking.dates.startDate} - ${booking.dates.endDate}, Rooms: ${Object.keys(booking.selectedRooms || {})}`);
      if (booking.selectedRooms && typeof booking.selectedRooms === "object") {
        Object.keys(booking.selectedRooms).forEach((roomId) => {
          bookedRoomIds.add(roomId);
        });
      }
    });

    console.log(`[Availability Check] Booked Room IDs: ${Array.from(bookedRoomIds)}`);

    res.status(200).json({
      success: true,
      bookedRoomIds: Array.from(bookedRoomIds),
      conflictingBookingsCount: conflictingBookings.length,
      message: `Tìm thấy ${bookedRoomIds.size} loại phòng đã được đặt`,
    });
  } catch (err) {
    console.error("[Availability Check Error]", err);
    next(err);
  }
};

