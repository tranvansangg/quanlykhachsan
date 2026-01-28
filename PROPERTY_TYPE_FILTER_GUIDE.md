# Property Type Filter Implementation Guide

## 📋 Overview
This guide shows how the property type filter works in the booking clone application. Users can select a property type (hotel, apartments, resorts, villas, cabins) from the homepage and see all available properties of that type without specifying a destination.

---

## 1️⃣ PropertyList Component - Frontend Display

**File:** `client/src/components/propertyList/PropertyList.jsx`

### Features:
- Fetches count of hotels by type from API
- Displays 5 property type cards with icons
- Handles navigation with type filter passed in URL

### Code Snippet:
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
    // Normalize type name
    const normalizedType = typeMap[type.toLowerCase()] || type.toLowerCase();

    // Save property type to localStorage
    localStorage.setItem("selectedPropertyType", JSON.stringify({
      type: normalizedType,
      timestamp: new Date().toISOString(),
    }));

    console.log("✓ Selected property type:", normalizedType);

    // Navigate to hotels list with type filter
    // Example URL: /hotels?type=hotel
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

### How It Works:
1. Fetches property counts from `/hotels/countByType` API
2. Displays 5 property type cards with images and icons
3. When user clicks a card, saves property type to localStorage
4. Navigates to `/hotels?type=hotel` (or other property types)

### URL Examples:
- `/hotels?type=hotel` - Show all hotels
- `/hotels?type=apartment` - Show all apartments
- `/hotels?type=resort` - Show all resorts
- `/hotels?type=villa` - Show all villas
- `/hotels?type=cabin` - Show all cabins

---

## 2️⃣ List Page - Fetch by Type

**File:** `client/src/pages/list/List.jsx`

### Key Features:
- Reads `type` query parameter from URL
- Calls backend API with type filter
- Allows search without requiring destination
- Maintains dates and guest options if provided

### Relevant Code Section:
```jsx
// Get type from URL params
const typeParam = searchParams.get("type");

// Allow search if destination exists OR type filter is set
if (!searchDestination && !typeParam) {
  setData([]);
  return;
}

// Build API payload
const payload = {
  city: searchDestination || "", // Empty string allowed when type is specified
  roomRequests: roomRequests,
  startDate: dates && dates[0] && dates[0].startDate ? dates[0].startDate : null,
  endDate: dates && dates[0] && dates[0].endDate ? dates[0].endDate : null,
  roomsRequested: numRooms,
};

// Add type filter if typeParam exists
if (typeParam) {
  payload.type = typeParam;
  console.log("🏠 Filtering by type from URL:", payload.type);
}

// Call API
const response = await axiosInstance.post("/hotels/search-available", payload);
const hotelData = response.data;
```

### Important Points:
- Type is passed via URL query parameter: `?type=hotel`
- City is optional when type is specified
- API call includes room requests (guest count and room count)
- Dates are optional but can be included

---

## 3️⃣ Backend API - Filter by Type

### API Endpoint: `POST /hotels/search-available`

**File:** `api/routes/hotels.js`

### Request Payload:
```json
{
  "city": "",
  "type": "hotel",
  "roomRequests": [
    {
      "adults": 1,
      "children": 0
    }
  ],
  "startDate": "2024-02-15T00:00:00.000Z",
  "endDate": "2024-02-17T00:00:00.000Z",
  "roomsRequested": 1
}
```

### Backend Implementation:
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

    // Find hotels matching the query
    const hotels = await Hotel.find(query);

    if (hotels.length === 0) {
      return res.status(200).json([]);
    }

    // ... rest of availability checking logic ...
    
    res.status(200).json(availableHotels);
  } catch (err) {
    console.error("Error in search-available endpoint:", err);
    next(err);
  }
});
```

### How It Works:
1. Extracts `type` from request body
2. Normalizes type to lowercase (e.g., "Hotel" → "hotel")
3. Builds MongoDB query with type filter
4. Optionally combines with city filter
5. Returns matching hotels with available rooms

---

## 4️⃣ Hotel Model - Database Schema

**File:** `api/models/Hotel.js`

### Hotel Type Field:
```javascript
const hotelSchema = new Schema(
  {
    // ... other fields ...
    type: {
      type: String,
      enum: ["hotel", "apartment", "resort", "villa", "cabin"],
      lowercase: true,
      required: true,
    },
    // ... other fields ...
  },
  { timestamps: true }
);
```

### Important:
- `type` field is required and stored in lowercase
- Valid values: hotel, apartment, resort, villa, cabin
- Always stored in lowercase in database

---

## 5️⃣ Count by Type API

**File:** `api/controllers/hotel.js`

### Endpoint: `GET /hotels/countByType`

### Implementation:
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

### Response Format:
```json
[
  { "type": "hotel", "count": 25 },
  { "type": "apartments", "count": 18 },
  { "type": "resorts", "count": 12 },
  { "type": "villas", "count": 8 },
  { "type": "cabins", "count": 5 }
]
```

### Note:
- Returns count of hotels grouped by type
- Used to display "nơi ở" (places) count on PropertyList cards

---

## 🔄 Complete User Flow

```
1. User visits homepage
   ↓
2. PropertyList component loads
   ↓
3. API fetches countByType → Display 5 property type cards
   ↓
4. User clicks on "hotel" card
   ↓
5. Saves to localStorage: { type: "hotel" }
   ↓
6. Navigates to: /hotels?type=hotel
   ↓
7. List page loads
   ↓
8. Reads typeParam from URL: "hotel"
   ↓
9. Calls POST /hotels/search-available with:
   {
     "city": "",
     "type": "hotel",
     "roomRequests": [...],
     ...
   }
   ↓
10. Backend queries: Hotel.find({ type: "hotel" })
    ↓
11. Checks room availability
    ↓
12. Returns available hotels
    ↓
13. List page displays filtered hotels
    ↓
14. User can click a hotel to see details
```

---

## 🔧 Testing Examples

### Test 1: Filter by Type Only
```bash
curl -X POST http://localhost:8800/api/hotels/search-available \
  -H "Content-Type: application/json" \
  -d '{
    "city": "",
    "type": "hotel",
    "roomRequests": [{ "adults": 1, "children": 0 }]
  }'
```

### Test 2: Filter by Type + City
```bash
curl -X POST http://localhost:8800/api/hotels/search-available \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Ho Chi Minh",
    "type": "apartment",
    "roomRequests": [{ "adults": 2, "children": 1 }]
  }'
```

### Test 3: Count by Type
```bash
curl -X GET http://localhost:8800/api/hotels/countByType
```

---

## 📝 Property Type Values

| Database Value | Display Text | URL Parameter |
|---|---|---|
| `hotel` | "hotel" | `type=hotel` |
| `apartment` | "apartments" | `type=apartment` |
| `resort` | "resorts" | `type=resort` |
| `villa` | "villas" | `type=villa` |
| `cabin` | "cabins" | `type=cabin` |

---

## ✅ Checklist

- [x] PropertyList component displays property types
- [x] Click handler navigates with type parameter
- [x] List page reads type from URL
- [x] List page calls API with type filter
- [x] Backend API filters by type
- [x] Backend allows city-less searches when type is specified
- [x] Hotel model has type field
- [x] countByType API returns property counts

---

## 🐛 Debugging Tips

### Check PropertyList
```javascript
// In browser console
localStorage.getItem("selectedPropertyType")
// Should show: {"type":"hotel","timestamp":"..."}
```

### Check List Page
```javascript
// In browser console
new URLSearchParams(window.location.search).get("type")
// Should show: "hotel", "apartment", etc.
```

### Check API Call
- Open browser DevTools → Network tab
- Click on `/hotels/search-available` request
- Check Request body has `"type": "hotel"`
- Check Response contains hotel array

### Check Database
```bash
# Connect to MongoDB
db.hotels.find({ type: "hotel" }).count()
# Should return count of hotels with type "hotel"
```

---

## 🎨 Styling Notes

PropertyList uses Tailwind CSS:
- `grid grid-cols-2 md:grid-cols-5` - 2 columns on mobile, 5 on desktop
- `hover:scale-110` - Image zoom on hover
- `hover:shadow-xl` - Shadow effect on hover
- `h-36 sm:h-40` - Card height responsive

---

## 📚 Related Files

- Frontend: `/client/src/components/propertyList/PropertyList.jsx`
- Frontend: `/client/src/pages/list/List.jsx`
- Backend: `/api/controllers/hotel.js`
- Backend: `/api/routes/hotels.js`
- Model: `/api/models/Hotel.js`
- Styles: `/client/src/components/propertyList/propertyList.css`

---

## 💡 Future Enhancements

1. Add sorting by property type (most popular, most reviewed, etc.)
2. Add type-specific filtering (e.g., star rating for hotels vs. cabin size)
3. Display type-specific features (Wi-Fi, Kitchen, etc.)
4. Add type icons/badges to hotel cards
5. Add "Related properties" section on detail page
6. Create separate pages for each property type (e.g., /apartments, /resorts)
7. Add type preferences to user profile (favorite property types)
