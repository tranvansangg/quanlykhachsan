# Featured City Navigation to Hotel List Integration

## Overview
Khi user click "Khám phá" trên một thành phố ở Featured component, sẽ navigate sang trang List và filter khách sạn theo thành phố đó.

## Frontend Implementation

### 1. Featured Component (Updated)
**File:** `client/src/components/featured/Featured.jsx`

```jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import "./featured.css";

const Featured = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(
    "/hotels/countByCity?cities=hà nội,sài gòn,đà nẵng"
  );

  useEffect(() => {
    console.log("Featured - Data:", data);
  }, [data, loading, error]);

  const cities = [
    {
      name: "Hà Nội",
      slug: "hanoi",
      image: "https://dntt.mediacdn.vn/197608888129458176/2022/9/21/ho-guom-du-lich-ha-noi-ivivu-16637590508811726461079.jpg",
      icon: "🏙️",
    },
    {
      name: "Sài Gòn",
      slug: "saigon",
      image: "https://cf.bstatic.com/xdata/images/city/max500/690334.webp?k=b99df435f06a15a1568ddd5f55d239507c0156985577681ab91274f917af6dbb&o=",
      icon: "🌆",
    },
    {
      name: "Đà Nẵng",
      slug: "danang",
      image: "https://cf.bstatic.com/xdata/images/city/max500/689422.webp?k=2595c93e7e067b9ba95f90713f80ba6e5fa88a66e6e55600bd27a5128808fdf2&o=",
      icon: "🏖️",
    },
  ];

  // Handle explore button click
  const handleExplore = (city) => {
    // Navigate with city slug and destination name
    navigate(`/hotels?city=${city.slug}&destination=${city.name}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
      {loading ? (
        <div className="col-span-full flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-700 rounded-full animate-spin"></div>
        </div>
      ) : (
        cities.map((city, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl group cursor-pointer h-64 sm:h-72 shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <img
              src={city.image}
              alt={city.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

            <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl">{city.icon}</div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{city.name}</h1>
                <p className="text-sm sm:text-base text-slate-200">
                  {data?.[index] || "250+"} khách sạn
                </p>
                <button 
                  onClick={() => handleExplore(city)}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Khám phá
                  <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Featured;
```

### 2. List Page (Updated)
**File:** `client/src/pages/list/List.jsx`

Key changes:
- Get `city` and `destination` from URL params
- Initialize destination state with param value
- Pass city/destination to API call

```jsx
import { useSearchParams } from "react-router-dom";

const List = () => {
  const [searchParams] = useSearchParams();
  
  // Get city and destination from URL
  const cityParam = searchParams.get("city");
  const destinationParam = searchParams.get("destination");

  // Initialize destination with param value
  const loaded = loadSearchData();
  const [destination, setDestination] = useState(
    loaded.destination || destinationParam || ""
  );

  // Update destination when params change
  useEffect(() => {
    if (destinationParam) {
      setDestination(destinationParam);
    }
  }, [destinationParam]);

  // Fetch hotels
  useEffect(() => {
    const searchDestination = destination || destinationParam;
    
    if (!searchDestination) {
      setData([]);
      return;
    }

    const fetchAvailableHotels = async () => {
      // ... rest of fetch logic
      const payload = {
        city: searchDestination,  // Use city parameter
        roomRequests: roomRequests,
        startDate: dates[0]?.startDate,
        endDate: dates[0]?.endDate,
        roomsRequested: numRooms,
      };

      const response = await axiosInstance.post("/hotels/search-available", payload);
      // ... rest of logic
    };

    fetchAvailableHotels();
  }, [destination, destinationParam, dates, min, max, options, numRooms, numRooms]);
};
```

### 3. Routes (App.js - No changes needed)
```jsx
<Route path="/hotels" element={<List/>}/>
```
- URL sẽ là `/hotels?city=hanoi&destination=Hà Nội`
- Query params tự động được parse by React Router

## Backend Implementation

### 1. Hotel Search API (Update)

**File:** `api/controllers/hotel.js` hoặc `api/routes/hotels.js`

```javascript
// Example: GET /hotels/search-available
exports.searchAvailable = async (req, res) => {
  try {
    const { city, roomRequests, startDate, endDate, roomsRequested } = req.body;

    // Build filter
    const filter = {};
    
    // Filter by city if provided
    if (city) {
      // Try different city field names (adjust based on your schema)
      filter.$or = [
        { city: new RegExp(city, 'i') },  // Case-insensitive match
        { location: new RegExp(city, 'i') },
        { address: new RegExp(city, 'i') }
      ];
    }

    // Get all hotels matching city
    const hotels = await Hotel.find(filter);

    if (!hotels || hotels.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy khách sạn ở thành phố này",
        data: []
      });
    }

    // Check room availability
    const availableHotels = [];
    
    for (const hotel of hotels) {
      let allRoomsAvailable = true;
      
      // Check if hotel has enough rooms available for all requests
      for (const roomRequest of roomRequests) {
        const availableCount = hotel.rooms?.filter(room => {
          // Check if room is available for dates
          const isAvailable = !room.unavailableDates?.some(date => {
            const dateObj = new Date(date);
            return dateObj >= new Date(startDate) && dateObj <= new Date(endDate);
          });
          return isAvailable && room.adults >= roomRequest.adults && room.children >= roomRequest.children;
        }).length || 0;

        if (availableCount === 0) {
          allRoomsAvailable = false;
          break;
        }
      }

      if (allRoomsAvailable) {
        availableHotels.push(hotel);
      }
    }

    res.status(200).json(availableHotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### 2. Hotel Model (Ensure city field exists)

**File:** `api/models/Hotel.js`

```javascript
const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  // City field - IMPORTANT
  city: {
    type: String,
    required: true,
    index: true  // Add index for faster queries
  },
  // Alternative/additional location fields
  location: String,
  address: String,
  
  description: String,
  distance: String,
  photos: [String],
  title: String,
  desc: String,
  rating: Number,
  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room"
    }
  ],
  cheapestPrice: Number,
  featured: Boolean,
  
  // ... other fields
},
{
  timestamps: true
}
);

// Add text index for city searching
hotelSchema.index({ city: 1, name: 1 });

module.exports = mongoose.model("Hotel", hotelSchema);
```

### 3. Alternative API: Direct City Filter Endpoint

```javascript
// GET /hotels?city=hanoi
exports.getHotelsByCity = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        message: "City parameter is required"
      });
    }

    // Search with case-insensitive regex
    const hotels = await Hotel.find({
      city: new RegExp(`^${city}$`, 'i')
    }).populate('rooms');

    if (hotels.length === 0) {
      return res.status(404).json({
        message: `Không tìm thấy khách sạn ở ${city}`,
        data: []
      });
    }

    res.status(200).json({
      count: hotels.length,
      data: hotels
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### 4. Route Setup (api/routes/hotels.js)

```javascript
router.post("/search-available", searchAvailable);  // Existing
router.get("/", getHotelsByCity);  // New endpoint
router.get("/:id", getHotel);
```

## City Mapping

Để match city names từ Featured với database, hãy tạo mapping:

```javascript
// utils/cityMapping.js
const cityMapping = {
  hanoi: "Hà Nội",
  saigon: "Sài Gòn",
  danang: "Đà Nẵng",
  
  // Database format (adjust theo schema)
  "hà nội": "hanoi",
  "sài gòn": "saigon",
  "đà nẵng": "danang"
};

export default cityMapping;
```

## Flow Summary

1. **User on Home Page**
   - Sees Featured component with 3 cities
   - Clicks "Khám phá" button on a city

2. **Featured Component**
   - Calls `handleExplore(city)`
   - Navigates to `/hotels?city=hanoi&destination=Hà%20Nội`

3. **List Page Loads**
   - Reads URL params
   - Sets destination state
   - Calls API with city filter

4. **Backend API**
   - Filters hotels by city
   - Checks room availability
   - Returns matching hotels

5. **UI Updates**
   - Shows filtered hotels for that city
   - User can further filter by price, rating, etc.

## Testing

```bash
# Navigate to:
http://localhost:3000/hotels?city=hanoi&destination=Hà%20Nội

# Check console logs:
# Featured: "Fetching hotels with payload: {city: 'Hà Nội', ...}"
```

## Notes

- Đảm bảo database có field `city` trong Hotel model
- City names cần match giữa Featured component và database
- Sử dụng URL encoding cho Vietnamese characters
- API endpoint phải support `city` parameter trong payload
