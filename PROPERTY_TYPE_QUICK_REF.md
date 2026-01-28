# Property Type Filter - Quick Reference

## 🎯 Tóm tắt Triển khai

### 1. Frontend - Component Hiển thị (PropertyList.jsx)
```jsx
// Khi click vào loại chỗ ở
handlePropertyClick = (type) => {
  // Lưu vào localStorage
  localStorage.setItem("selectedPropertyType", { type, timestamp });
  
  // Điều hướng: /hotels?type=hotel
  navigate(`/hotels?type=${normalizedType}`);
}
```

### 2. List Page - Lấy dữ liệu (List.jsx)
```jsx
// Đọc type từ URL
const typeParam = searchParams.get("type");

// Gọi API với type filter
const payload = {
  city: "", // Không cần thành phố
  type: typeParam, // "hotel", "apartment", etc.
  roomRequests: [...],
};

await axiosInstance.post("/hotels/search-available", payload);
```

### 3. Backend API - Lọc theo type (hotels.js)
```javascript
// Tìm khách sạn theo type
const query = {};
if (type) {
  query.type = type.toLowerCase(); // Lưu dưới dạng lowercase
}

const hotels = await Hotel.find(query);
```

---

## 📡 API Endpoints

| Endpoint | Method | Purpose | Notes |
|---|---|---|---|
| `/hotels/countByType` | GET | Lấy số lượng theo loại | Dùng cho PropertyList |
| `/hotels/search-available` | POST | Tìm khách sạn có phòng trống | Hỗ trợ type filter |
| `/hotels` | GET | Lấy danh sách khách sạn | Query: `type=hotel` |

---

## 🔗 URL Examples

```
Homepage: /
  ↓
Click "hotel" card
  ↓
/hotels?type=hotel
/hotels?type=apartment
/hotels?type=resort
/hotels?type=villa
/hotels?type=cabin
```

---

## 💾 Database Query

```javascript
// MongoDB - Tìm tất cả khách sạn loại "hotel"
db.hotels.find({ type: "hotel" })

// Đếm số lượng
db.hotels.countDocuments({ type: "apartment" })
```

---

## 🧪 Test API

```bash
# POST /hotels/search-available
{
  "city": "",
  "type": "hotel",
  "roomRequests": [
    { "adults": 1, "children": 0 }
  ]
}

# Response
[
  {
    "_id": "...",
    "name": "Hotel Name",
    "type": "hotel",
    "city": "Ho Chi Minh",
    ...
  }
]
```

---

## ✅ Các bước triển khai

1. **PropertyList.jsx** - Hiển thị 5 loại chỗ ở
   - Fetch `/hotels/countByType`
   - Render 5 cards với icon + count
   - Click → navigate với `type` param

2. **List.jsx** - Lọc theo loại
   - Đọc `type` từ URL: `?type=hotel`
   - Gọi API `/hotels/search-available`
   - Truyền `type` trong request body
   - Hiển thị danh sách khách sạn

3. **Backend API** - Lọc database
   - Nhận `type` từ request
   - Query: `Hotel.find({ type })`
   - Kiểm tra phòng trống
   - Return danh sách khách sạn

---

## 🎨 Loại chỗ ở

| Value | Display | Icon |
|---|---|---|
| `hotel` | hotel | 🛏️ faBed |
| `apartment` | apartments | 🏢 faBuilding |
| `resort` | resorts | 🌳 faTreeCity |
| `villa` | villas | 🚕 faCab |
| `cabin` | cabins | 🏠 faHouse |

---

## 💡 Điểm chính

✅ **Không cần thành phố** - Chỉ cần type để hiển thị tất cả khách sạn  
✅ **URL-based filtering** - Type truyền qua query param  
✅ **Lowercase storage** - Database lưu type dưới dạng lowercase  
✅ **Optional destination** - Có thể kết hợp với city filter  
✅ **Backward compatible** - Vẫn hỗ trợ search theo thành phố

---

## 📝 Files Modified

- ✅ `api/routes/hotels.js` - Allow empty city when type specified
- ✅ `client/src/pages/list/List.jsx` - Comment updated
- ✅ `client/src/components/propertyList/PropertyList.jsx` - Already working

---

## 🚀 Ready to Use

Tất cả code đã được triển khai! Chỉ cần:

1. Reload homepage
2. Click vào loại chỗ ở
3. Sẽ thấy danh sách khách sạn theo loại
4. Có thể kết hợp với filter giá, rating, etc.
