# Property Type Filter - Quick Copy-Paste Examples

## 🚀 Ready-to-Use Code Examples

---

## Frontend - PropertyList Component

### Simple Click Handler (Already in PropertyList.jsx)

```jsx
const handlePropertyClick = (type) => {
  // Normalize type
  const normalizedType = typeMap[type.toLowerCase()] || type.toLowerCase();
  
  // Save to localStorage
  localStorage.setItem("selectedPropertyType", JSON.stringify({
    type: normalizedType,
    timestamp: new Date().toISOString(),
  }));
  
  // Navigate
  navigate(`/hotels?type=${encodeURIComponent(normalizedType)}`);
};
```

### Type Map Conversion

```javascript
const typeMap = {
  "hotel": "hotel",
  "apartments": "apartment",
  "resorts": "resort",
  "villas": "villa",
  "cabins": "cabin"
};
```

---

## List Page - Type Reading & API Call

### Read Type from URL

```javascript
// At top of List component
const typeParam = searchParams.get("type");
console.log("Type from URL:", typeParam);
```

### Build API Payload with Type

```javascript
const payload = {
  city: searchDestination || "",
  type: typeParam,  // ◄── Add this
  roomRequests: roomRequests,
  startDate: dates?.[0]?.startDate || null,
  endDate: dates?.[0]?.endDate || null,
  roomsRequested: numRooms,
};
```

### Make API Call

```javascript
const response = await axiosInstance.post("/hotels/search-available", payload);
const hotelData = response.data;
setData(hotelData);
```

---

## Backend API - Filter by Type

### Updated search-available Endpoint

```javascript
router.post("/search-available", async (req, res, next) => {
  try {
    const { city, roomRequests, type } = req.body;

    // Validate: city OR type required
    if (!city && !type) {
      return res.status(400).json({ 
        error: "City or type filter is required" 
      });
    }

    // Build query
    const query = {};
    
    if (city) {
      query.city = { $regex: city, $options: "i" };
    }
    
    if (type) {
      query.type = type.toLowerCase();
    }

    // Find hotels
    const hotels = await Hotel.find(query);
    
    // ... rest of availability logic ...
    
    res.status(200).json(availableHotels);
  } catch (err) {
    next(err);
  }
});
```

---

## Testing - cURL Commands

### Test 1: Get Property Counts

```bash
curl -X GET http://localhost:8800/api/hotels/countByType
```

**Expected Output:**
```json
[
  { "type": "hotel", "count": 25 },
  { "type": "apartments", "count": 18 },
  { "type": "resorts", "count": 12 },
  { "type": "villas", "count": 8 },
  { "type": "cabins", "count": 5 }
]
```

### Test 2: Search Hotels by Type

```bash
curl -X POST http://localhost:8800/api/hotels/search-available \
  -H "Content-Type: application/json" \
  -d '{
    "city": "",
    "type": "hotel",
    "roomRequests": [
      { "adults": 1, "children": 0 }
    ]
  }'
```

### Test 3: Search by Type + City

```bash
curl -X POST http://localhost:8800/api/hotels/search-available \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Ho Chi Minh",
    "type": "apartment",
    "roomRequests": [
      { "adults": 2, "children": 1 }
    ]
  }'
```

### Test 4: Search by Type + Dates

```bash
curl -X POST http://localhost:8800/api/hotels/search-available \
  -H "Content-Type: application/json" \
  -d '{
    "city": "",
    "type": "resort",
    "roomRequests": [
      { "adults": 1, "children": 0 }
    ],
    "startDate": "2024-02-15T00:00:00Z",
    "endDate": "2024-02-17T00:00:00Z"
  }'
```

---

## Database - MongoDB Queries

### Check Hotels by Type

```bash
# Connect to MongoDB
mongo
use quanlykhachsan

# Count hotels by type
db.hotels.find({ type: "hotel" }).count()
db.hotels.find({ type: "apartment" }).count()

# See all types
db.hotels.find({}, { name: 1, type: 1 }).pretty()

# Find specific hotel with type
db.hotels.findOne({ type: "hotel" })
```

### Verify Type Field

```bash
# Check data types
db.hotels.findOne({ _id: ObjectId("...") })

# Ensure lowercase
db.hotels.updateMany({}, [
  { $set: { type: { $toLower: "$type" } } }
])

# Verify enum values
db.hotels.find({
  type: { $nin: ["hotel", "apartment", "resort", "villa", "cabin"] }
}).count()
```

---

## Frontend Debug - Browser Console

### Check PropertyList Works

```javascript
// 1. Check if component renders
console.log("PropertyList data:", document.querySelectorAll("[role='presentation']").length);

// 2. Check API response
const response = await fetch("/api/hotels/countByType");
const data = await response.json();
console.log("Count by type:", data);

// 3. Simulate click
document.querySelectorAll("[role='presentation']")[0]?.click();
```

### Check List Page Works

```javascript
// 1. Check URL params
const params = new URLSearchParams(window.location.search);
console.log("Type param:", params.get("type"));

// 2. Check payload sent
// Open DevTools → Network → search-available
// Check Request body

// 3. Check response
// Open DevTools → Network → search-available
// Check Response tab
```

### Check LocalStorage

```javascript
// View saved type
console.log(JSON.parse(localStorage.getItem("selectedPropertyType")));

// Clear if needed
localStorage.removeItem("selectedPropertyType");

// Set manually for testing
localStorage.setItem("selectedPropertyType", JSON.stringify({
  type: "hotel",
  timestamp: new Date().toISOString()
}));
```

---

## JavaScript Utilities - Helper Functions

### Type Normalization

```javascript
// Normalize type to lowercase
const normalizeType = (type) => {
  return type ? type.toLowerCase() : "";
};

// Validate type
const isValidType = (type) => {
  const validTypes = ["hotel", "apartment", "resort", "villa", "cabin"];
  return validTypes.includes(normalizeType(type));
};

// Convert display name to type
const displayToType = (displayName) => {
  const map = {
    "hotel": "hotel",
    "apartments": "apartment",
    "resorts": "resort",
    "villas": "villa",
    "cabins": "cabin"
  };
  return map[normalizeType(displayName)] || normalizeType(displayName);
};
```

### API Call Helper

```javascript
const searchByType = async (type, roomRequests = [{ adults: 1, children: 0 }]) => {
  try {
    const response = await axiosInstance.post("/hotels/search-available", {
      city: "",
      type: type,
      roomRequests: roomRequests,
    });
    return response.data;
  } catch (error) {
    console.error("Error searching by type:", error);
    throw error;
  }
};

// Usage
const hotels = await searchByType("hotel");
console.log(`Found ${hotels.length} hotels`);
```

---

## Error Handling Examples

### Try-Catch in List Page

```javascript
const fetchAvailableHotels = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await axiosInstance.post(
      "/hotels/search-available", 
      payload
    );
    setData(response.data);
  } catch (err) {
    console.error("Error fetching hotels:", err);
    setError(err.response?.data?.message || "Error fetching hotels");
  } finally {
    setLoading(false);
  }
};
```

### Backend Error Response

```javascript
// Error response format
res.status(400).json({ 
  error: "City or type filter is required",
  code: "INVALID_FILTER"
});

// Client handling
try {
  const response = await axiosInstance.post("/hotels/search-available", payload);
} catch (err) {
  if (err.response?.status === 400) {
    console.error("Invalid filter:", err.response.data.error);
  }
}
```

---

## Performance Optimization - Debounce Example

```javascript
// Debounce search to avoid too many API calls
const [debouncedType, setDebouncedType] = useState(typeParam);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedType(typeParam);
    // Now trigger search with debouncedType
  }, 500);
  
  return () => clearTimeout(timer);
}, [typeParam]);
```

---

## Logging - Debug Messages

```javascript
// In frontend
console.log("✓ Selected property type:", normalizedType);
console.log("🏠 Filtering by type from URL:", typeParam);
console.log("Fetching hotels with payload:", payload);
console.log("API Response:", response.data);
console.log("Filtered data:", filteredData.length, "hotels");

// In backend
console.log(`🏠 Filtering by type: ${type}`);
console.log(`🔍 Filtering by type only: ${type}`);
console.log(`🔍 Filtering by city: ${city} AND type: ${type}`);

// Monitor in production
logger.info("Hotel search by type", { type, resultCount: hotels.length });
```

---

## React Hooks Example

### Custom Hook for Type Filter

```javascript
// useTypeFilter.js
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export const useTypeFilter = () => {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  
  const [selectedType, setSelectedType] = useState(typeParam);
  
  return {
    selectedType,
    setSelectedType,
    isTypeFilter: !!typeParam,
  };
};

// Usage in component
const { selectedType, isTypeFilter } = useTypeFilter();

if (isTypeFilter) {
  console.log("Filtering by type:", selectedType);
}
```

---

## Environment Variables (Optional)

### .env file

```bash
REACT_APP_API_URL=http://localhost:8800
REACT_APP_HOTEL_TYPES=hotel,apartment,resort,villa,cabin
```

### Usage

```javascript
const API_URL = process.env.REACT_APP_API_URL;
const VALID_TYPES = process.env.REACT_APP_HOTEL_TYPES?.split(",") || [];

const response = await axiosInstance.post(
  `${API_URL}/hotels/search-available`,
  payload
);
```

---

## Unit Test Examples

### Test PropertyList Click Handler

```javascript
import { render, screen, fireEvent } from "@testing-library/react";
import PropertyList from "./PropertyList";

describe("PropertyList", () => {
  test("navigates to hotels page with type param on click", () => {
    const { getByText } = render(<PropertyList />);
    
    // Mock navigation
    const mockNavigate = jest.fn();
    jest.mock("react-router-dom", () => ({
      useNavigate: () => mockNavigate,
    }));
    
    // Click hotel card
    fireEvent.click(getByText("hotel"));
    
    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith("/hotels?type=hotel");
  });
});
```

### Test API Call

```javascript
import axios from "axios";

jest.mock("axios");

test("search by type calls API correctly", async () => {
  axios.post.mockResolvedValue({
    data: [{ id: 1, name: "Hotel", type: "hotel" }]
  });
  
  const response = await axiosInstance.post("/hotels/search-available", {
    type: "hotel",
    roomRequests: [{ adults: 1 }]
  });
  
  expect(response.data).toHaveLength(1);
});
```

---

## Summary

All these code examples are **copy-paste ready**. Just:

1. Copy the code block
2. Paste into your file
3. Adjust variables/imports as needed
4. Test with curl or browser

**No additional setup required!**
