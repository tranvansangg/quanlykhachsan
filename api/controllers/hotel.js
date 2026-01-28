import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";

export const createHotel = async (req, res, next) => {
  // Validate required fields
  const { name, type, city, address, distance, title, desc, cheapestPrice } = req.body;
  if (!name || !type || !city || !address || !distance || !title || !desc || !cheapestPrice) {
    return res.status(400).json({
      message: 'Vui lòng điền tất cả các trường bắt buộc'
    });
  }

  const newHotel = new Hotel(req.body);

  try {
    const savedHotel = await newHotel.save();
    res.status(200).json(savedHotel);
  } catch (err) {
    next(err);
  }
};
export const updateHotel = async (req, res, next) => {
  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedHotel);
  } catch (err) {
    next(err);
  }
};
export const deleteHotel = async (req, res, next) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    res.status(200).json("Hotel has been deleted.");
  } catch (err) {
    next(err);
  }
};
export const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    res.status(200).json(hotel);
  } catch (err) {
    next(err);
  }
};
export const getHotels = async (req, res, next) => {
  try {
    const { min, max, featured, limit, city, type, ...others } = req.query;
    const filter = { ...others };

    // price range
    if (min || max) {
      filter.cheapestPrice = {};
      if (min) filter.cheapestPrice.$gt = Number(min);
      if (max) filter.cheapestPrice.$lt = Number(max);
    }

    // featured flag (accepts 'true'|'1'|'false'|'0')
    if (typeof featured !== "undefined") {
      filter.featured = featured === "true" || featured === "1" || featured === true;
    }

    // City search with regex (case-insensitive, partial match)
    if (city) {
      filter.city = { $regex: city, $options: "i" };
    }

    // Type filter - exact match (normalize to lowercase)
    if (type) {
      filter.type = type.toLowerCase();
      console.log(`🏠 Filtering hotels by type: ${type.toLowerCase()}`);
    }

    const qLimit = limit ? parseInt(limit) : 0;
    const query = Hotel.find(filter);
    if (qLimit > 0) query.limit(qLimit);

    const hotels = await query;
    res.status(200).json(hotels);
  } catch (err) {
    next(err);
  }
};
export const countByCity = async (req, res, next) => {
  const cities = req.query.cities.split(",");
  try {
    const list = await Promise.all(
      cities.map((city) => {
        return Hotel.countDocuments({ city: city });
      })
    );
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};
export const countByType = async (req, res, next) => {
  try {
    const hotelCount = await Hotel.countDocuments({ type: "hotel" });
    const apartmentCount = await Hotel.countDocuments({ type: "apartment" });
    const resortCount = await Hotel.countDocuments({ type: "resort" });
    const villaCount = await Hotel.countDocuments({ type: "villa" });
    const cabinCount = await Hotel.countDocuments({ type: "cabin" });

    res.status(200).json([
      { type: "hotel", count: hotelCount },
      { type: "apartments", count: apartmentCount },
      { type: "resorts", count: resortCount },
      { type: "villas", count: villaCount },
      { type: "cabins", count: cabinCount },
    ]);
  } catch (err) {
    next(err);
  }
};

export const getHotelRooms = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel || !hotel.rooms || hotel.rooms.length === 0) {
      return res.status(200).json([]);
    }

    // Get all active bookings for this hotel in one query
    const activeBookings = await Booking.find({
      hotelId: req.params.id,
      status: { $in: ['confirmed', 'pending'] }
    }).select('dates selectedRooms').lean();

    // Fetch all rooms in one query instead of individual queries
    const roomIds = hotel.rooms;
    const rooms = await Room.find({ _id: { $in: roomIds } }).lean();

    // Create a map of rooms for faster lookup
    const roomMap = new Map(rooms.map(room => [room._id.toString(), room]));

    // Process rooms with booked dates
    const processedRooms = rooms.map(room => {
      const roomId = room._id.toString();
      
      // Initialize roomNumbers array if it doesn't exist
      if (!room.roomNumbers) {
        room.roomNumbers = [];
      }

      // Create set of booked dates for this room (more efficient than array)
      const bookedDateSet = new Set();

      // Find all bookings that include this room
      activeBookings.forEach((booking) => {
        if (booking.selectedRooms && booking.selectedRooms[roomId]) {
          const startDate = new Date(booking.dates.startDate);
          const endDate = new Date(booking.dates.endDate);
          
          // Add all dates between start and end
          let currentDate = new Date(startDate);
          while (currentDate < endDate) {
            bookedDateSet.add(currentDate.toISOString().split('T')[0]); // Use ISO date string
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      });

      // Add existing unavailable dates to the set
      if (room.roomNumbers && Array.isArray(room.roomNumbers)) {
        room.roomNumbers.forEach(roomNumber => {
          if (!roomNumber.unavailableDates) {
            roomNumber.unavailableDates = [];
          }
          
          // Only keep dates as array for response, but use set for deduplication
          roomNumber.unavailableDates = Array.from(bookedDateSet).map(dateStr => new Date(dateStr));
        });
      }

      return room;
    });

    res.status(200).json(processedRooms);
  } catch (err) {
    next(err);
  }
};
