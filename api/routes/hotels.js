import express from "express";
import {
  countByCity,
  countByType,
  createHotel,
  deleteHotel,
  getHotel,
  getHotelRooms,
  getHotels,
  updateHotel,
} from "../controllers/hotel.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import { verifyAdmin } from "../utils/verifyToken.js"
const router = express.Router();

// Specific routes BEFORE generic /:id and POST /
router.get("/countByCity", countByCity);
router.get("/countByType", countByType);
router.get("/room/:id", getHotelRooms);
router.get("/search-cities/:query", async (req, res, next) => {
  try {
    const { query } = req.params;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Search cities with regex (case-insensitive, partial match)
    const hotels = await Hotel.find({
      city: { $regex: query, $options: "i" }
    }).select("city").distinct("city");

    // Return unique cities sorted
    const uniqueCities = [...new Set(hotels)].sort();
    res.status(200).json(uniqueCities);
  } catch (err) {
    next(err);
  }
});

// Search with room details - check if hotels can accommodate total guests (PUBLIC - no auth required)
router.post("/search-available", async (req, res, next) => {
  try {
    const { city, roomRequests, type, startDate, endDate } = req.body;

    // Validate input
    if (!city && !type) {
      return res.status(400).json({ error: "City or type filter is required" });
    }

    if (!roomRequests || !Array.isArray(roomRequests) || roomRequests.length === 0) {
      return res.status(400).json({ error: "Room requests must be a non-empty array" });
    }

    // Build query filter
    const query = {};
    
    // Add city filter if provided (case-insensitive)
    if (city) {
      query.city = { $regex: city, $options: "i" };
    }
    
    // Add type filter if provided (normalize to lowercase)
    if (type) {
      query.type = type.toLowerCase();
      console.log(`🏠 Filtering by type: ${type.toLowerCase()}`);
    }
    
    if (city && type) {
      console.log(`🔍 Filtering by city: ${city} AND type: ${type.toLowerCase()}`);
    } else if (city) {
      console.log(`🔍 Filtering by city: ${city}`);
    } else if (type) {
      console.log(`🔍 Filtering by type only: ${type.toLowerCase()}`);
    }

    // Find hotels in the city (with optional type filter)
    const hotels = await Hotel.find(query);

    if (hotels.length === 0) {
      return res.status(200).json([]);
    }

    // Calculate total guests from all room requests
    const totalGuests = roomRequests.reduce(
      (sum, room) => sum + (room.adults || 0) + (room.children || 0),
      0
    );

    // Parse dates for availability check
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Helper: Check which room types are available for the date range
    const getAvailableRoomIds = async (hotelId) => {
      if (!start || !end) {
        // No dates provided -> return all room IDs as available
        const hotel = await Hotel.findById(hotelId);
        return new Set(hotel.rooms || []);
      }

      // Find conflicting bookings that overlap with the requested date range
      const conflictingBookings = await Booking.find({
        hotelId: hotelId,
        status: { $in: ["confirmed", "completed"] },
        $and: [
          { "dates.startDate": { $lt: end } },
          { "dates.endDate": { $gt: start } },
        ],
      }).select("selectedRooms dates status");

      console.log(`[${hotelId}] Found ${conflictingBookings.length} conflicting bookings`);

      // Build a set of booked room type IDs
      const bookedRoomIds = new Set();
      conflictingBookings.forEach((booking) => {
        if (booking.selectedRooms && typeof booking.selectedRooms === "object") {
          Object.keys(booking.selectedRooms).forEach((roomId) => {
            bookedRoomIds.add(roomId);
          });
        }
      });

      // Get all room IDs for this hotel and return available ones
      const hotel = await Hotel.findById(hotelId);
      const allRoomIds = new Set(hotel.rooms || []);
      const availableRoomIds = new Set([...allRoomIds].filter(id => !bookedRoomIds.has(id.toString())));
      
      console.log(`[${hotelId}] Total rooms: ${allRoomIds.size}, Booked: ${bookedRoomIds.size}, Available: ${availableRoomIds.size}`);
      
      return availableRoomIds;
    };

    // Filter hotels based on total hotel capacity across all available physical rooms
    const availableHotels = [];

    for (let hotel of hotels) {
      try {
        // Check if any rooms are available for the date range
        const availableRoomIds = await getAvailableRoomIds(hotel._id);

        if (availableRoomIds.size === 0 && start && end) {
          // All rooms are booked for this period
          console.log(`[${hotel._id}] All rooms booked for this date range, skipping`);
          continue;
        }

        // Get room objects
        const hotelRooms = availableRoomIds.size > 0
          ? await Promise.all(
              Array.from(availableRoomIds)
                .map((roomId) => Room.findById(roomId).catch(() => null))
            )
          : await Promise.all((hotel.rooms || []).map((roomId) => Room.findById(roomId).catch(() => null)));

        // Filter out null room docs
        const validRooms = hotelRooms.filter(room => room !== null);
        if (validRooms.length === 0) continue;

        // Calculate total capacity from available rooms
        let totalHotelCapacity = 0;
        let totalAvailableRooms = 0;
        for (let room of validRooms) {
          const maxPeople = room.maxPeople || 0;
          const roomNums = Array.isArray(room.roomNumbers) ? room.roomNumbers : [];
          for (let rn of roomNums) {
            totalHotelCapacity += maxPeople;
            totalAvailableRooms += 1;
          }
        }

        // Check if hotel can accommodate guests
        const roomsRequested = Number(req.body.roomsRequested) || 0;
        if (totalAvailableRooms > 0 && totalHotelCapacity >= totalGuests && (roomsRequested <= 0 || roomsRequested <= totalAvailableRooms)) {
          availableHotels.push(hotel);
          console.log(`[${hotel._id}] ✓ Hotel available - Capacity: ${totalHotelCapacity}, Guests: ${totalGuests}`);
        } else {
          console.log(`[${hotel._id}] ✗ Hotel insufficient capacity - Capacity: ${totalHotelCapacity}, Guests: ${totalGuests}`);
        }
      } catch (err) {
        console.error(`Error checking rooms for hotel ${hotel._id}:`, err);
      }
    }

    res.status(200).json(availableHotels);
  } catch (err) {
    console.error("Error in search-available endpoint:", err);
    next(err);
  }
});

//CREATE (requires admin)
router.post("/", verifyAdmin, createHotel);

//UPDATE
router.put("/:id", verifyAdmin, updateHotel);
//DELETE
router.delete("/:id", verifyAdmin, deleteHotel);

//GET ALL (must be before /:id)
router.get("/", getHotels);

//GET by ID (must be last)
router.get("/:id", getHotel);

export default router;
