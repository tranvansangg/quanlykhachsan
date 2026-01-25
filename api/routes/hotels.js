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
import { verifyAdmin } from "../utils/verifyToken.js"
const router = express.Router();

// Specific routes BEFORE generic /:id and POST /
router.get("/countByCity", countByCity);
router.get("/countByType", countByType);
router.get("/room/:id", getHotelRooms);

// Search with room details - check if hotels can accommodate total guests (PUBLIC - no auth required)
router.post("/search-available", async (req, res, next) => {
  try {
    const { city, roomRequests } = req.body;

    // Validate input
    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    if (!roomRequests || !Array.isArray(roomRequests) || roomRequests.length === 0) {
      return res.status(400).json({ error: "Room requests must be a non-empty array" });
    }

    // Find hotels in the city
    const hotels = await Hotel.find({ city });

    if (hotels.length === 0) {
      return res.status(200).json([]);
    }

    // Calculate total guests from all room requests
    const totalGuests = roomRequests.reduce(
      (sum, room) => sum + (room.adults || 0) + (room.children || 0),
      0
    );

    // Optional: accept search dates to filter unavailable roomNumbers
    const { startDate, endDate } = req.body;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Helper: check if a specific roomNumber is available for the requested range
    const isRoomNumberAvailable = (unavailableDates = []) => {
      if (!start || !end) return true; // no dates provided -> consider available
      for (let d of unavailableDates) {
        const ud = new Date(d);
        if (ud >= start && ud <= end) return false;
      }
      return true;
    };

    // Filter hotels based on total hotel capacity across all available physical rooms
    const availableHotels = [];

    for (let hotel of hotels) {
      try {
        // Get all rooms (room types) for this hotel
        const hotelRooms = hotel.rooms && hotel.rooms.length > 0 
          ? await Promise.all(hotel.rooms.map((roomId) => Room.findById(roomId).catch(() => null)))
          : [];

        // Filter out null room docs
        const validRooms = hotelRooms.filter(room => room !== null);
        if (validRooms.length === 0) continue;

            // Compute total capacity by iterating each physical room (roomNumbers)
            // For each roomNumber that is available, add the parent room's maxPeople
            let totalHotelCapacity = 0;
            let totalAvailableRooms = 0;
            for (let room of validRooms) {
              const maxPeople = room.maxPeople || 0;
              const roomNums = Array.isArray(room.roomNumbers) ? room.roomNumbers : [];
              for (let rn of roomNums) {
                const unavailableDates = Array.isArray(rn.unavailableDates) ? rn.unavailableDates : [];
                if (isRoomNumberAvailable(unavailableDates)) {
                  totalHotelCapacity += maxPeople;
                  totalAvailableRooms += 1;
                }
              }
            }

            // Require both conditions: totalGuests fits in total capacity AND requested rooms available
            const roomsRequested = Number(req.body.roomsRequested) || 0;
            if (totalAvailableRooms > 0 && totalHotelCapacity >= totalGuests && (roomsRequested <= 0 || roomsRequested <= totalAvailableRooms)) {
              availableHotels.push(hotel);
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
