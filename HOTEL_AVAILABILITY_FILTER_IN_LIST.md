# 🏨 Hotel Availability Filter in Search Results - Complete Implementation

## Problem
Trước đây, danh sách khách sạn hiển thị tất cả khách sạn **mà không kiểm tra xem ngày được chọn có phòng trống hay không**. Người dùng phải vào từng khách sạn để phát hiện không có phòng.

## Solution Implemented

### 🎯 What Now Happens

**Quy trình:**
1. User chọn ngày check-in/check-out ở Header
2. Nhấn "Tìm kiếm"
3. Frontend gửi request tới `/hotels/search-available` **kèm dates**
4. Backend kiểm tra từng khách sạn:
   - Xem có phòng trống vào những ngày đó không? (check Bookings table)
   - Có đủ chỗ cho số khách không?
5. **Chỉ trả về những khách sạn có phòng trống** trong thời gian đó
6. Frontend hiển thị danh sách đã filter

---

## Backend Changes

### 📝 File: `api/routes/hotels.js`

#### 1. Thêm Import Booking Model
```javascript
import Booking from "../models/Booking.js";  // ← NEW
```

#### 2. Cập nhật `/search-available` Endpoint

**New Logic:**

```javascript
router.post("/search-available", async (req, res, next) => {
  // Receive dates from frontend
  const { city, roomRequests, type, startDate, endDate } = req.body;
  
  // Parse dates
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  // NEW: Helper function to check availability
  const getAvailableRoomIds = async (hotelId) => {
    if (!start || !end) {
      // No dates -> return all rooms as available
      return allRooms;
    }

    // Query bookings that overlap with selected dates
    const conflictingBookings = await Booking.find({
      hotelId: hotelId,
      status: { $in: ["confirmed", "completed"] },
      $and: [
        { "dates.startDate": { $lt: end } },
        { "dates.endDate": { $gt: start } },
      ],
    });

    // Extract booked room IDs
    const bookedRoomIds = new Set();
    conflictingBookings.forEach((booking) => {
      if (booking.selectedRooms) {
        Object.keys(booking.selectedRooms).forEach((roomId) => {
          bookedRoomIds.add(roomId);
        });
      }
    });

    // Return only available rooms
    return availableRooms;
  };

  // Filter hotels: only return if has available rooms
  for (let hotel of hotels) {
    const availableRoomIds = await getAvailableRoomIds(hotel._id);
    
    if (availableRoomIds.size === 0 && dates provided) {
      // All rooms booked -> skip this hotel
      continue;
    }
    
    // If has available rooms -> add to results
    availableHotels.push(hotel);
  }
});
```

**Key Changes:**
- ✅ Check Bookings table (not just unavailableDates)
- ✅ Only return hotels with available rooms
- ✅ Consider confirmed + completed bookings
- ✅ Handle overlapping date ranges correctly

---

## Frontend Changes

### 📝 File: `client/src/pages/list/List.jsx`

**Already sending dates** (no changes needed):
```javascript
const payload = {
  city: searchDestination,
  roomRequests: roomRequests,
  startDate: dates[0]?.startDate,  // ← Sent to backend
  endDate: dates[0]?.endDate,       // ← Sent to backend
  roomsRequested: numRooms,
};

const response = await axiosInstance.post("/hotels/search-available", payload);
```

---

## Data Flow

```
┌─────────────────────────────────────────┐
│ User selects dates in Header            │
│ - Check-in: Jan 5, 2026                 │
│ - Check-out: Jan 7, 2026                │
└────────────────────┬────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ User clicks "Search"   │
        └────────────┬───────────┘
                     │
                     ▼
        ┌──────────────────────────────┐
        │ Frontend sends request:       │
        │ POST /hotels/search-available │
        │ {                            │
        │   city: "Hà Nội",           │
        │   startDate: "2026-01-05",  │
        │   endDate: "2026-01-07",    │
        │   roomRequests: [...]       │
        │ }                            │
        └────────────┬─────────────────┘
                     │
                     ▼
    ┌──────────────────────────────────┐
    │ Backend processes each hotel:     │
    │ 1. Get all bookings that overlap │
    │    dates (Jan 5-7)               │
    │                                  │
    │ 2. Find booked room IDs          │
    │    - Room A: booked              │
    │    - Room B: booked              │
    │    - Room C: available           │
    │                                  │
    │ 3. Check if Hotel has capacity   │
    │    Available: Room C             │
    │    Max people: 2                 │
    │    Guests: 2 ✓ MATCH             │
    │                                  │
    │ 4. Add to results if available   │
    └────────────┬────────────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ Return filtered hotels    │
    │ - Hotel 1: Available ✓   │
    │ - Hotel 2: Available ✓   │
    │ - Hotel 3: ALL BOOKED ✗  │
    └────────────┬─────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ Frontend displays list    │
    │ Only showing available    │
    │ hotels for Jan 5-7        │
    └──────────────────────────┘
```

---

## Availability Check Logic

### Overlap Detection (MongoDB Query)

```javascript
$and: [
  { "dates.startDate": { $lt: end } },    // Booking start < User end
  { "dates.endDate": { $gt: start } },    // Booking end > User start
]
```

**Example:**
- User wants: Jan 5-7
- Booking 1: Jan 4-6 → **OVERLAP** (4 < 7 AND 6 > 5) ✗
- Booking 2: Jan 7-9 → NO OVERLAP (7 NOT < 7) ✓
- Booking 3: Jan 3-4 → NO OVERLAP (4 NOT > 5) ✓

### Room Availability Decision

```
FOR EACH HOTEL:
  ├─ Get booked room IDs for dates
  ├─ Calculate available room IDs
  ├─ Check capacity of available rooms
  └─ IF totalCapacity >= totalGuests:
      └─ ✓ ADD to results
     ELSE:
      └─ ✗ SKIP (not enough capacity)
```

---

## Console Output Example

```
[Hôm Nội-1] Found 2 conflicting bookings
[Hôm Nội-1] Total rooms: 5, Booked: 2, Available: 3
[Hôm Nội-1] ✓ Hotel available - Capacity: 6, Guests: 2

[Hôm Nội-2] Found 5 conflicting bookings
[Hôm Nội-2] Total rooms: 3, Booked: 3, Available: 0
[Hôm Nội-2] All rooms booked for this date range, skipping

[Hôm Nội-3] Found 0 conflicting bookings
[Hôm Nội-3] Total rooms: 4, Booked: 0, Available: 4
[Hôm Nội-3] ✓ Hotel available - Capacity: 8, Guests: 2
```

---

## Features

### ✅ What's Checked
- Overlapping date ranges with existing bookings
- Only confirmed/completed bookings (not cancelled)
- Room capacity vs guest count
- Multiple rooms distribution

### ✅ What's NOT Checked
- Price (filtered separately on frontend)
- Rating (filtered separately on frontend)
- Distance/location (filtered by city/type)

### ✅ What Happens if No Dates Selected
- All hotels returned (no availability filtering)
- User can browse freely

### ✅ What Happens if All Hotels Booked
- Empty list returned
- Frontend shows: "Không tìm thấy khách sạn phù hợp..."

---

## Testing Scenarios

### Scenario 1: Hotels with Available Rooms
```
Search: Hà Nội, Jan 5-7, 2 guests
Available Hotels: A (3 rooms), B (2 rooms), C (1 room)
Booked: None
Expected: All 3 hotels returned ✓
```

### Scenario 2: Mixed Availability
```
Search: Hà Nội, Jan 5-7, 2 guests
Hotels:
  A: 5 rooms (3 booked, 2 available) → ✓ RETURN
  B: 3 rooms (3 booked, 0 available) → ✗ SKIP
  C: 2 rooms (0 booked, 2 available) → ✓ RETURN
Expected: Hotels A, C returned
```

### Scenario 3: No Available Rooms
```
Search: Hà Nội, Jan 5-7, 2 guests
All hotels: ALL ROOMS BOOKED for these dates
Expected: Empty list, "No hotels found" message
```

### Scenario 4: Insufficient Capacity
```
Search: Hà Nội, Jan 5-7, 6 guests, 2 rooms
Hotel: 2 available rooms, max 2 people each (total 4)
Expected: Hotel NOT returned (capacity: 4 < guests: 6)
```

---

## Benefits

🎯 **Better User Experience:**
- See only available hotels immediately
- No wasted clicks on fully booked hotels
- Clear date-based filtering

⚡ **Performance:**
- Backend does heavy lifting
- Frontend receives pre-filtered data
- Reduces unnecessary renders

📊 **Data Integrity:**
- Uses Bookings table (source of truth)
- Checks overlap correctly
- Only considers confirmed bookings

🔍 **Debugging:**
- Console logs show available/booked rooms per hotel
- Easy to trace why hotel was/wasn't included

---

## API Request/Response

### Request
```json
POST /api/hotels/search-available

{
  "city": "Hà Nội",
  "roomRequests": [
    { "adults": 1, "children": 0 },
    { "adults": 1, "children": 0 }
  ],
  "type": "hotel",
  "startDate": "2026-01-05T00:00:00Z",
  "endDate": "2026-01-07T00:00:00Z",
  "roomsRequested": 2
}
```

### Response
```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Hotel A",
    "city": "Hà Nội",
    "type": "hotel",
    "cheapestPrice": 500000,
    "rooms": ["room1", "room2", "room3"],
    ...
  },
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Hotel C",
    "city": "Hà Nội",
    "type": "hotel",
    "cheapestPrice": 450000,
    "rooms": ["room4", "room5"],
    ...
  }
]
```

---

## Files Modified

| File | Changes |
|------|---------|
| `api/routes/hotels.js` | • Added Booking import<br>• Rewrote `/search-available` endpoint<br>• Added booking-based availability check<br>• Added console logging<br>• Already receive dates from frontend |

**No changes needed in frontend** - List.jsx already sends dates to this endpoint!

---

## Verification Checklist

```
✅ Booking model imported
✅ Endpoint receives startDate and endDate
✅ MongoDB query correctly checks overlaps
✅ Booked room IDs extracted correctly
✅ Available rooms filtered correctly
✅ Capacity checked before returning hotel
✅ Only confirmed/completed bookings considered
✅ Console logs show hotel filtering details
✅ No syntax errors
✅ API responds with filtered hotel list
```

---

## Remarks

1. **Why this is better than unavailableDates:**
   - Bookings are real reservations (user-created)
   - unavailableDates are manual marks (could be outdated)
   - Using bookings ensures accurate real-time availability

2. **Why we filter on backend:**
   - Better performance (less data transferred)
   - Security (server controls what's shown)
   - Logic stays in one place

3. **What happens after user selects dates:**
   - They go to list page with dates in URL
   - List.jsx sends dates to `/search-available`
   - Only available hotels displayed
   - User can click hotel → goes to Reserve.jsx
   - Reserve also checks availability (safety layer)

4. **Edge Cases Handled:**
   - No dates → all hotels shown
   - No bookings → all hotels shown
   - All booked → empty list shown
   - Insufficient capacity → hotel excluded

---

## Summary

✨ **Ngày nay, danh sách khách sạn sẽ tự động lọc để chỉ hiển thị những cái có phòng trống vào những ngày được chọn!**

User không cần phải vào từng khách sạn để kiểm tra, tất cả đã được check ở backend. 🎉
