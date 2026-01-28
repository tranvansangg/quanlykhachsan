# Property Type Filter - Complete Code Snippets

## 📋 Tất cả code cần thiết

---

## 1. Frontend - PropertyList Component

**File:** `client/src/components/propertyList/PropertyList.jsx`

```jsx
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faBuilding,
  faTreeCity,
  faCab,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";
import "./propertyList.css";

const PropertyList = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useFetch("/hotels/countByType");

  const images = [
    "https://cf.bstatic.com/xdata/images/xphoto/square300/57584488.webp?k=bf724e4e9b9b75480bbe7fc675460a089ba6414fe4693b83ea3fdd8e938832a6&o=",
    "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-apartments_300/9f60235dc09a3ac3f0a93adbc901c61ecd1ce72e.jpg",
    "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/bg_resorts/6f87c6143fbd51a0bb5d15ca3b9cf84211ab0884.jpg",
    "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-villas_300/dd0d7f8202676306a661aa4f0cf1ffab31286211.jpg",
    "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-chalet_300/8ee014fcc493cb3334e25893a1dee8c6d36ed0ba.jpg",
  ];

  const icons = [faBed, faBuilding, faTreeCity, faCab, faHouse];

  // Map type names from API response (lowercase) to URL params
  const typeMap = {
    "hotel": "hotel",
    "apartments": "apartment",
    "resorts": "resort",
    "villas": "villa",
    "cabins": "cabin"
  };

  const handlePropertyClick = (type) => {
    // Normalize type name - convert "apartments" to "apartment", "resorts" to "resort", etc.
    const normalizedType = typeMap[type.toLowerCase()] || type.toLowerCase();

    // Save property type to localStorage
    localStorage.setItem("selectedPropertyType", JSON.stringify({
      type: normalizedType,
      timestamp: new Date().toISOString(),
    }));

    console.log("✓ Selected property type:", normalizedType);

    // Navigate to hotels list with type filter
    // URL: /hotels?type=hotel
    navigate(`/hotels?type=${encodeURIComponent(normalizedType)}`);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 max-w-7xl mx-auto">
      {loading ? (
        <div className="col-span-full flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-700 rounded-full animate-spin"></div>
        </div>
      ) : (
        data &&
        images.map((img, i) => (
          <div 
            key={i}
            onClick={() => handlePropertyClick(data[i]?.type)}
            className="group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-36 sm:h-40"
          >
            <div className="relative w-full h-full overflow-hidden">
              <img 
                src={img} 
                alt={data[i]?.type} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-3">
                <FontAwesomeIcon
                  icon={icons[i] || faBed}
                  className="text-3xl mb-2"
                />
                <h3 className="font-bold text-sm">{data[i]?.type}</h3>
                <p className="text-xs opacity-90 mt-1">{data[i]?.count} nơi ở</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PropertyList;
```

---

## 2. List Page - Fetch Hotels by Type

**File:** `client/src/pages/list/List.jsx` (relevant sections)

```jsx
// Get type from URL params
const typeParam = searchParams.get("type");

// ... (other state and effects) ...

// Fetch hotels with available rooms
useEffect(() => {
  // Use debounced destination to avoid too many API calls
  const searchDestination = debouncedDestination || destinationParam;
  
  // Allow search if destination exists OR type filter is set
  if (!searchDestination && !typeParam) {
    setData([]);
    return;
  }

  const fetchAvailableHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build room requests based on total guests and number of rooms
      const numRoomsToBook = numRooms || 1;
      const adultsCount = (options && options.adults) || 1;
      const childrenCount = (options && options.children) || 0;
      const adultsPerRoom = Math.ceil(adultsCount / numRoomsToBook);
      
      const roomRequests = [];
      for (let i = 0; i < numRoomsToBook; i++) {
        const isLastRoom = i === numRoomsToBook - 1;
        roomRequests.push({
          adults: isLastRoom ? adultsCount - (adultsPerRoom * (numRoomsToBook - 1)) : adultsPerRoom,
          children: isLastRoom ? childrenCount : 0,
        });
      }

      // Build API payload
      const payload = {
        city: searchDestination || "", // Empty string allowed when type is specified
        roomRequests: roomRequests,
        startDate: dates && dates[0] && dates[0].startDate ? dates[0].startDate : null,
        endDate: dates && dates[0] && dates[0].endDate ? dates[0].endDate : null,
        roomsRequested: numRooms,
      };

      // Add type filter if typeParam exists (from URL query)
      if (typeParam) {
        payload.type = typeParam;
        console.log("🏠 Filtering by type from URL:", payload.type);
      }

      console.log("Fetching hotels with payload:", payload);

      // Call backend API
      const response = await axiosInstance.post("/hotels/search-available", payload);
      const hotelData = response.data;

      console.log("API Response:", hotelData);

      // Apply price filter
      let filteredData = hotelData;
      if (min || max) {
        filteredData = hotelData.filter((hotel) => {
          const price = hotel.cheapestPrice || 0;
          if (min && price < Number(min)) return false;
          if (max && price > Number(max)) return false;
          return true;
        });
      }

      // Apply rating filter
      if (minRating > 0) {
        filteredData = filteredData.filter((hotel) => {
          const hotelRating = hotel.star || 0;
          return hotelRating >= minRating;
        });
      }

      console.log("Filtered data:", filteredData.length, "hotels");
      setData(filteredData);
      
      if (filteredData.length === 0) {
        setError("Không tìm thấy khách sạn phù hợp với điều kiện của bạn");
      }

    } catch (err) {
      console.error("Error fetching hotels:", err);
      setError("Lỗi khi tìm kiếm khách sạn");
    } finally {
      setLoading(false);
    }
  };

  fetchAvailableHotels();
}, [debouncedDestination, destinationParam, typeParam, dates, options, min, max, minRating, numRooms]);
```

---

## 3. Backend - Updated search-available Endpoint

**File:** `api/routes/hotels.js`

```javascript
router.post("/search-available", async (req, res, next) => {
  try {
    const { city, roomRequests, type } = req.body;

    // Validate input - city OR type must be provided
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

    // Optional: accept search dates to filter unavailable roomNumbers
    const { startDate, endDate } = req.body;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Helper: check if a specific roomNumber is available for the requested range
    const isRoomNumberAvailable = (unavailableDates = []) => {
      if (!start || !end) return true;
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

        // Require both conditions: totalGuests fits AND requested rooms available
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
```

---

## 4. Backend - countByType Controller

**File:** `api/controllers/hotel.js`

```javascript
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
```

---

## 5. Hotel Model with Type Field

**File:** `api/models/Hotel.js` (relevant section)

```javascript
import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["hotel", "apartment", "resort", "villa", "cabin"],
      lowercase: true,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    distance: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
    ],
    cheapestPrice: {
      type: Number,
      required: true,
    },
    featured: Boolean,
    star: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Hotel", hotelSchema);
```

---

## 6. Backend Routes Setup

**File:** `api/routes/hotels.js` (route definitions)

```javascript
import express from "express";
import {
  createHotel,
  updateHotel,
  deleteHotel,
  getHotel,
  getHotels,
  countByCity,
  countByType,
  getHotelRooms,
} from "../controllers/hotel.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// Count endpoints
router.get("/count-by-city", countByCity);
router.get("/count-by-type", countByType); // Get count by property type

// Search endpoint
router.post("/search-available", async (req, res, next) => {
  // ... implementation above ...
});

// CRUD operations
router.post("/", verifyAdmin, createHotel);
router.put("/:id", verifyAdmin, updateHotel);
router.delete("/:id", verifyAdmin, deleteHotel);

// GET all (must be before /:id)
router.get("/", getHotels);

// GET by ID (must be last)
router.get("/:id", getHotel);

export default router;
```

---

## 7. Test Cases & Examples

### Example 1: Get All Hotels by Type
```bash
curl -X POST http://localhost:8800/api/hotels/search-available \
  -H "Content-Type: application/json" \
  -d '{
    "city": "",
    "type": "hotel",
    "roomRequests": [
      {
        "adults": 1,
        "children": 0
      }
    ]
  }'
```

### Example 2: Get Apartments in Specific City
```bash
curl -X POST http://localhost:8800/api/hotels/search-available \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Ho Chi Minh",
    "type": "apartment",
    "roomRequests": [
      {
        "adults": 2,
        "children": 1
      }
    ],
    "startDate": "2024-02-15T00:00:00.000Z",
    "endDate": "2024-02-17T00:00:00.000Z"
  }'
```

### Example 3: Count by Type
```bash
curl -X GET http://localhost:8800/api/hotels/countByType
```

Response:
```json
[
  { "type": "hotel", "count": 25 },
  { "type": "apartments", "count": 18 },
  { "type": "resorts", "count": 12 },
  { "type": "villas", "count": 8 },
  { "type": "cabins", "count": 5 }
]
```

---

## 🚀 Implementation Summary

✅ **PropertyList Component**
- Fetches property counts from API
- Displays 5 property type cards
- Navigates to `/hotels?type=hotel` on click

✅ **List Page**
- Reads `type` from URL query parameter
- Calls `/hotels/search-available` with type filter
- Allows search without requiring destination

✅ **Backend API**
- Modified `/hotels/search-available` to accept type-only searches
- Queries database with type filter
- Returns available hotels matching the type

✅ **Database**
- Hotel model has `type` field with valid enum values
- All properties stored in lowercase
- Can be queried by type

---

## 📝 Notes

- Type values are **case-insensitive** (normalized to lowercase)
- City is **optional** when type is specified
- Type and city can be used together for combined filtering
- All code is backward compatible with existing search functionality
