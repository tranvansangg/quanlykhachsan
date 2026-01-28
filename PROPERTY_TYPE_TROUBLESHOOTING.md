# Property Type Filter - Troubleshooting & Testing Guide

## 🐛 Common Issues & Solutions

---

## Issue 1: Click on Property Type Card Does Nothing

### Symptoms:
- Click PropertyList card, nothing happens
- URL doesn't change
- No error in console

### Root Causes & Solutions:

**Cause 1: useFetch hook not working**
```javascript
// Check if data is loading
const { data, loading, error } = useFetch("/hotels/countByType");

// Debug in console
console.log("Data:", data);
console.log("Loading:", loading);
console.log("Error:", error);
```

**Solution:**
```javascript
// Verify API endpoint exists
curl -X GET http://localhost:8800/api/hotels/countByType

// Check if backend is running
npm start  // in api folder
```

**Cause 2: Navigation not working**
```javascript
// Check if useNavigate is imported
import { useNavigate } from "react-router-dom";

// Check if navigate function is called
const navigate = useNavigate();

// In handlePropertyClick
navigate(`/hotels?type=${normalizedType}`);
console.log("Navigation called");  // Add debug log
```

**Cause 3: onClick handler not attached**
```jsx
// Make sure onClick is on the div
<div onClick={() => handlePropertyClick(data[i]?.type)}>
  {/* Card content */}
</div>
```

---

## Issue 2: "City or type filter is required" Error

### Symptoms:
```
Error: City or type filter is required
Status: 400
```

### Root Cause:
`type` parameter not being sent to backend

### Solution:

**Check 1: Verify URL has type parameter**
```javascript
// In List.jsx browser console
const typeParam = new URLSearchParams(window.location.search).get("type");
console.log("Type param:", typeParam);
// Should show: "hotel", "apartment", etc.
```

**Check 2: Verify API payload**
```javascript
// In browser DevTools → Network
// Look for POST /hotels/search-available request
// Click on it and check Request body:

{
  "city": "",
  "type": "hotel",      // ◄── Should be present
  "roomRequests": [...],
  ...
}
```

**Check 3: Verify backend is receiving it**
```javascript
// In api/routes/hotels.js, add debug logs
console.log("Received payload:", req.body);
console.log("City:", req.body.city);
console.log("Type:", req.body.type);
```

**Fix:**
```jsx
// Make sure this code is in List.jsx
if (typeParam) {
  payload.type = typeParam;
  console.log("🏠 Added type to payload:", typeParam);
}
```

---

## Issue 3: No Hotels Showing in Results

### Symptoms:
- URL is correct: `/hotels?type=hotel`
- No error message
- Empty list

### Root Causes:

**Cause 1: Database has no hotels with that type**
```bash
# Check database
mongo
> use quanlykhachsan
> db.hotels.find({ type: "hotel" }).count()
// Should return > 0
```

**Solution: Add test hotels**
```bash
# In api folder
npm run seed  # or create-sample-data script

# Or manually insert:
db.hotels.insertOne({
  name: "Test Hotel",
  type: "hotel",
  city: "Ho Chi Minh",
  address: "123 Main St",
  distance: "500m",
  title: "Test",
  desc: "Test hotel",
  cheapestPrice: 50,
  rooms: []
})
```

**Cause 2: Type value is wrong case**
```javascript
// Database has: "Hotel" (capitalized)
// Query is looking for: "hotel" (lowercase)

// Solution: Normalize in database
db.hotels.updateMany({}, [{ $set: { type: { $toLower: "$type" } } }])
```

**Cause 3: Room availability check failing**
```javascript
// Even if hotel exists, it might not have available rooms

// Check room structure:
db.hotels.findOne()
// Look for "rooms" array - should have ObjectIds

// Check Room model:
db.rooms.findOne()
// Should have "roomNumbers" array with availability info
```

**Cause 4: API returning data but List component not updating**
```javascript
// In browser console
// After search, check if data is in state
console.log("Filtered data:", filteredData);
console.log("Number of hotels:", filteredData.length);
```

---

## Issue 4: Type Filter Not Working (Getting All Hotels)

### Symptoms:
- URL has `?type=hotel` but showing all types
- Query params being ignored

### Root Cause:
Backend not applying type filter

### Solution:

**Check 1: Verify backend is reading type**
```javascript
// Add to api/routes/hotels.js
router.post("/search-available", async (req, res, next) => {
  const { type } = req.body;
  console.log("TYPE RECEIVED:", type);  // ◄── Add this
  
  // ... rest of code
});
```

**Check 2: Verify MongoDB query**
```javascript
// Should have type in query object
const query = {};
if (type) {
  query.type = type.toLowerCase();
}
console.log("MongoDB query:", query);  // ◄── Add this
```

**Check 3: Test query directly in MongoDB**
```bash
# Test exact query
db.hotels.find({ type: "hotel" })

# Compare with no filter
db.hotels.find({})
```

---

## Issue 5: PropertyList Component Crashes

### Symptoms:
```
Error: Cannot read property 'type' of undefined
```

### Root Cause:
API response not matching expected format

### Solution:

**Check API response format:**
```javascript
// Should return array like this:
[
  { "type": "hotel", "count": 25 },
  { "type": "apartments", "count": 18 },
  ...
]

// NOT like this:
{ "hotel": 25, "apartments": 18 }
```

**Fix controller:**
```javascript
// api/controllers/hotel.js
export const countByType = async (req, res, next) => {
  try {
    const results = [
      { type: "hotel", count: await Hotel.countDocuments({ type: "hotel" }) },
      { type: "apartments", count: await Hotel.countDocuments({ type: "apartment" }) },
      // ... etc
    ];
    res.status(200).json(results);  // ◄── Return array
  } catch (err) {
    next(err);
  }
};
```

**Safe render with nullcheck:**
```jsx
{data &&
  images.map((img, i) => (
    <div key={i}>
      {data[i]?.type && (  // ◄── Add safety check
        <>
          <h3>{data[i].type}</h3>
          <p>{data[i].count} nơi ở</p>
        </>
      )}
    </div>
  ))}
```

---

## 🧪 Testing Checklist

### Step 1: Test API Endpoints

```bash
# Test 1: Get property counts
curl -X GET http://localhost:8800/api/hotels/countByType

# Expected response:
# [
#   { "type": "hotel", "count": 5 },
#   { "type": "apartments", "count": 3 },
#   ...
# ]

# Test 2: Search by type
curl -X POST http://localhost:8800/api/hotels/search-available \
  -H "Content-Type: application/json" \
  -d '{
    "city": "",
    "type": "hotel",
    "roomRequests": [
      { "adults": 1, "children": 0 }
    ]
  }'

# Expected response: Array of hotel objects
```

### Step 2: Test Frontend Flow

```javascript
// 1. Open browser console
// 2. Check PropertyList loads data
console.log(localStorage.getItem("selectedPropertyType"))
// Should be null initially

// 3. Click a property card
// Should show:
// ✓ Selected property type: hotel

// 4. Check localStorage
console.log(localStorage.getItem("selectedPropertyType"))
// Should show: {"type":"hotel","timestamp":"..."}

// 5. Check URL
window.location.search
// Should show: ?type=hotel

// 6. Check List component loads
// Should fetch hotels and display them
```

### Step 3: Debug List Page

```javascript
// In List.jsx, check these values:

// 1. URL params
const typeParam = new URLSearchParams(window.location.search).get("type");
console.log("Type from URL:", typeParam);

// 2. API payload
console.log("Payload being sent:", payload);

// 3. API response
console.log("API response:", response.data);

// 4. Filtered data
console.log("Filtered data:", data);

// 5. Rendered hotels
console.log("Number of hotels rendered:", document.querySelectorAll(".searchItem").length);
```

---

## 📊 Database Verification

### Check Hotel Type Field

```bash
# Connect to MongoDB
mongo
> use quanlykhachsan

# 1. See all hotels with their types
> db.hotels.find({}, { name: 1, type: 1 }).pretty()

# 2. Count by type
> db.hotels.find({ type: "hotel" }).count()
> db.hotels.find({ type: "apartment" }).count()
> db.hotels.find({ type: "resort" }).count()
> db.hotels.find({ type: "villa" }).count()
> db.hotels.find({ type: "cabin" }).count()

# 3. Check data type (should be string)
> db.hotels.findOne({ type: "hotel" })

# 4. Check for case issues
> db.hotels.find({ type: "Hotel" }).count()  // Should be 0 if normalized
> db.hotels.find({ type: "HOTEL" }).count()  // Should be 0

# 5. Verify no null types
> db.hotels.find({ type: null }).count()
> db.hotels.find({ type: { $exists: false } }).count()
```

### Fix Database Issues

```bash
# Normalize all types to lowercase
db.hotels.updateMany({}, [
  { $set: { type: { $toLower: "$type" } } }
])

# Remove invalid types
db.hotels.deleteMany({ type: { $nin: ["hotel", "apartment", "resort", "villa", "cabin"] } })
```

---

## 🔍 Browser DevTools Debugging

### Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "search-available"
4. Click property card
5. Check the request:
   - **URL:** Should be `/api/hotels/search-available`
   - **Method:** Should be `POST`
   - **Headers:** Should have `Content-Type: application/json`
   - **Request Body:** Should include `"type": "hotel"`
6. Check the response:
   - **Status:** Should be `200`
   - **Response:** Should be array of hotels

### Console Tab

```javascript
// Add custom logging to track flow
window.debugPropertyType = {
  logClick: (type) => console.log("Card clicked:", type),
  logNavigation: (url) => console.log("Navigating to:", url),
  logFetch: (payload) => console.log("API payload:", payload),
  logResponse: (data) => console.log("API response:", data),
};
```

---

## 🚀 Performance Testing

### Measure API Response Time

```javascript
const startTime = Date.now();
const response = await axiosInstance.post("/hotels/search-available", payload);
const endTime = Date.now();
console.log(`API response time: ${endTime - startTime}ms`);

// Expected: < 500ms for < 1000 hotels
// If > 1000ms, add database indexes
```

### Monitor Network Size

```javascript
// In browser DevTools → Network
// Check "search-available" response size
// Should be < 500KB for typical results
```

---

## 📝 Error Logs Reference

### Backend Logs

```bash
# Check server output while testing
# You should see:

🏠 Filtering by type: hotel
🔍 Filtering by type only: hotel
// Then hotel count and availability check messages
```

### Frontend Logs

```javascript
// In browser console you should see:
✓ Selected property type: hotel
✓ Filtering by type from URL: hotel
API Response: [...]
Filtered data: 5 hotels
```

---

## ✅ Final Verification Checklist

- [ ] Backend `/hotels/countByType` returns count array
- [ ] PropertyList component loads and displays 5 cards
- [ ] Clicking card navigates to `/hotels?type=hotel`
- [ ] List page reads type param from URL
- [ ] API payload includes type parameter
- [ ] Backend filters by type correctly
- [ ] Database has hotels with proper type field
- [ ] Results display correctly
- [ ] No console errors
- [ ] LocalStorage saves type on click
- [ ] Can combine type with city filter
- [ ] Can combine type with date filters
- [ ] Price and rating filters work with type

---

## 🆘 Still Having Issues?

### Debug Steps (In Order)

1. **Check browser console for errors**
   ```javascript
   // Look for red error messages
   // Note exact error text
   ```

2. **Check network requests**
   - Open DevTools → Network
   - Filter by "search-available"
   - Verify request body has type

3. **Check database**
   ```bash
   mongo
   use quanlykhachsan
   db.hotels.find({ type: "hotel" }).count()
   ```

4. **Check backend logs**
   - Look for filtering messages
   - Look for error stack traces

5. **Check component state**
   ```javascript
   // In List.jsx, verify:
   console.log("typeParam:", typeParam);
   console.log("payload:", payload);
   console.log("response:", response.data);
   console.log("data state:", data);
   ```

6. **Try curl test**
   ```bash
   curl -X POST http://localhost:8800/api/hotels/search-available \
     -H "Content-Type: application/json" \
     -d '{"city":"","type":"hotel","roomRequests":[{"adults":1,"children":0}]}'
   ```

---

## 💬 Debug Messages Guide

| Message | Meaning | Action |
|---------|---------|--------|
| `✓ Selected property type: hotel` | Click successful | ✅ OK |
| `🏠 Filtering by type: hotel` | Backend filtering | ✅ OK |
| `🔍 Filtering by type only: hotel` | Type-only search | ✅ OK |
| `API Response: [...]` | Got data | ✅ OK |
| `Error: City or type required` | No type sent | ❌ Fix List.jsx |
| `Cannot read property 'type' of undefined` | API response format wrong | ❌ Check controller |
| `No hotels found` | Database empty or wrong type | ❌ Check DB |

---

## 📞 Quick Help

**Q: Why are no hotels showing?**
A: Check if database has hotels with correct type values (must be lowercase)

**Q: Why is it showing all hotels?**
A: Type not being sent to API - check List.jsx payload

**Q: Why did PropertyList cards disappear?**
A: API endpoint broken - check if backend is running

**Q: Why is URL not changing?**
A: Navigation function not called - check click handler

**Q: Why is it showing error in PropertyList?**
A: API response format wrong - check countByType controller
