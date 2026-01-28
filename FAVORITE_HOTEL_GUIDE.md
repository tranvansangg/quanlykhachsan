# 🏨 Chức Năng Favorite Hotel - Hướng Dẫn Chi Tiết

## 📋 Tổng Quan

Chức năng Favorite Hotel cho phép người dùng đã đăng nhập lưu lại danh sách khách sạn yêu thích và truy cập lại chúng bất kỳ lúc nào. Mỗi người dùng có danh sách yêu thích riêng được lưu trong database.

---

## 🔧 Backend Implementation

### 1. **Database Model (User Schema)**

File: `api/models/User.js`

```javascript
favorites: {
  type: [String], // Array of hotel IDs
  default: [],
}
```

- Lưu trữ mảng ID của các khách sạn yêu thích
- Khởi tạo rỗng khi tạo user mới

### 2. **API Endpoints**

Base URL: `http://localhost:8800/api/favorites`

#### **POST** `/:userId/toggle`
Toggle thêm/xóa yêu thích (endpoint được khuyên dùng)

**Request:**
```javascript
{
  "hotelId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Response:**
```javascript
{
  "message": "Hotel added to favorites",
  "isFavorite": true
}
```

**Auth:** Yêu cầu token (verifyToken middleware)

---

#### **POST** `/:userId/add`
Thêm khách sạn vào yêu thích (cũ - dùng toggle thay thế)

**Request:**
```javascript
{
  "hotelId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

---

#### **POST** `/:userId/remove`
Xóa khách sạn khỏi yêu thích (cũ - dùng toggle thay thế)

**Request:**
```javascript
{
  "hotelId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

---

#### **GET** `/:userId/check`
Kiểm tra khách sạn có trong danh sách yêu thích không

**Query Parameters:**
- `hotelId`: ID của khách sạn

**Response:**
```javascript
{
  "isFavorite": true/false
}
```

**Auth:** Yêu cầu token

---

#### **GET** `/:userId`
Lấy danh sách ID các khách sạn yêu thích

**Response:**
```javascript
{
  "favorites": ["65a1b2c3d4e5f6g7h8i9j0k1", "65a1b2c3d4e5f6g7h8i9j0k2"],
  "count": 2
}
```

**Auth:** Yêu cầu token

---

#### **GET** `/:userId/hotels`
Lấy danh sách đầy đủ các khách sạn yêu thích (với tất cả thông tin)

**Response:**
```javascript
{
  "count": 2,
  "hotels": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Grand Hotel",
      "city": "Hà Nội",
      "address": "123 Tran Hung Dao",
      "photos": ["url1", "url2"],
      "desc": "Hotel description",
      "star": 4.5,
      "cheapestPrice": 500000,
      ...
    },
    ...
  ]
}
```

**Auth:** Yêu cầu token

---

### 3. **Controller Functions**

File: `api/controllers/favorite.js`

**toggleFavorite** - Hàm chính (được khuyên dùng)
```javascript
- Kiểm tra hotel ID
- Tìm user
- Toggle thêm/xóa
- Trả về trạng thái mới
```

**getFavoriteHotels** - Lấy chi tiết khách sạn
```javascript
- Tìm user
- Lấy danh sách favorites
- Query chi tiết từ Hotel collection
- Trả về mảng khách sạn đầy đủ
```

---

## 🎨 Frontend Implementation

### 1. **FavoriteButton Component**

File: `client/src/components/favoriteButton/FavoriteButton.jsx`

**Props:**
```javascript
{
  hotelId: String,        // Required: ID của khách sạn
  className: String       // Optional: CSS classes bổ sung
}
```

**Features:**
- Tự động kiểm tra trạng thái khi load
- Cập nhật real-time
- Xử lý lỗi gracefully
- Hiển thị tooltip
- Animation trái tim

**Ví dụ sử dụng:**
```jsx
<FavoriteButton hotelId={hotel._id} />
<FavoriteButton hotelId={hotel._id} className="ml-4" />
```

### 2. **Integration Points**

#### **SearchItem Component**
File: `client/src/components/searchItem/SearchItem.jsx`

Thêm FavoriteButton ở góc trên phải của ảnh khách sạn:
```jsx
<div className="relative w-full sm:w-48 h-48 rounded-lg overflow-hidden">
  <img src={item.photos?.[0]} alt={item.name} />
  <div className="absolute top-3 right-3">
    <FavoriteButton hotelId={item._id} />
  </div>
</div>
```

#### **Hotel Detail Page**
File: `client/src/pages/hotel/Hotel.jsx`

Thêm FavoriteButton bên cạnh tiêu đề khách sạn:
```jsx
<div style={{ display: "flex", justifyContent: "space-between" }}>
  <div>
    <h1>{data.name}</h1>
    ...
  </div>
  <FavoriteButton hotelId={data._id} />
</div>
```

#### **Favorites List Page**
File: `client/src/pages/favorites/Favorites.jsx`

- Hiển thị tất cả khách sạn yêu thích
- Sử dụng SearchItem để hiển thị
- Tự động refresh sau khi xóa

---

## 🔄 User Flow

### 1. **Thêm vào Yêu Thích**
```
User Chưa Đăng Nhập → Click Trái Tim → Thông báo "Đăng nhập"
                                    ↓
User Đã Đăng Nhập → Click Trái Tim → API toggle → Trái Tim đỏ ❤️
```

### 2. **Xem Danh Sách Yêu Thích**
```
Click Menu → Favorites → Load tất cả khách sạn đã lưu
→ Xem chi tiết → Xóa khỏi yêu thích
```

### 3. **Xóa khỏi Yêu Thích**
```
Click Trái Tim Đỏ ❤️ → API toggle → Trái Tim Trắng 🤍
```

---

## 💻 Detailed Code Examples

### Backend - Toggle Favorite

```javascript
// File: api/controllers/favorite.js
export const toggleFavorite = async (req, res, next) => {
  try {
    const { hotelId } = req.body;
    const userId = req.params.userId;

    if (!hotelId) {
      return next(createError(400, "Hotel ID is required"));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    let isFav;
    if (user.favorites.includes(hotelId)) {
      // Xóa nếu đã có
      user.favorites = user.favorites.filter((id) => id !== hotelId);
      isFav = false;
    } else {
      // Thêm nếu chưa có
      user.favorites.push(hotelId);
      isFav = true;
    }

    await user.save();

    res.status(200).json({
      message: isFav 
        ? "Hotel added to favorites" 
        : "Hotel removed from favorites",
      isFavorite: isFav,
    });
  } catch (err) {
    next(err);
  }
};
```

### Frontend - FavoriteButton Component

```jsx
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import "./favoriteButton.css";

const FavoriteButton = ({ hotelId, className = "" }) => {
  const { user } = useContext(AuthContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Kiểm tra trạng thái khi user hoặc hotelId thay đổi
  useEffect(() => {
    if (user?._id && hotelId) {
      checkFavorite();
    }
  }, [user?._id, hotelId]);

  const checkFavorite = async () => {
    if (!user?._id) return;
    
    try {
      const response = await axiosInstance.get(
        `/favorites/${user._id}/check?hotelId=${hotelId}`
      );
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      alert("Vui lòng đăng nhập để thêm vào yêu thích");
      return;
    }

    if (!hotelId) {
      console.error("Hotel ID is required");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        `/favorites/${user._id}/toggle`,
        { hotelId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data) {
        setIsFavorite(response.data.isFavorite);
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
      setIsFavorite(!isFavorite);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`favorite-btn ${isFavorite ? "active" : ""} ${className}`}
      onClick={toggleFavorite}
      disabled={loading || !user}
      title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
      aria-label="Toggle favorite"
    >
      <i 
        className={`heart-icon ${isFavorite ? "fas" : "far"} fa-heart`}
        style={{ 
          color: isFavorite ? "#ff0000" : "currentColor",
          transition: "color 0.3s ease"
        }}
      />
      <span className="tooltip">
        {isFavorite ? "Đã thích" : "Thêm yêu thích"}
      </span>
    </button>
  );
};

export default FavoriteButton;
```

### Frontend - Fetch Favorites with Details

```jsx
const fetchFavorites = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Sử dụng endpoint mới trả về chi tiết khách sạn
    const response = await axiosInstance.get(
      `/favorites/${user._id}/hotels`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.data.hotels) {
      setFavoriteHotels(response.data.hotels);
    } else {
      setFavoriteHotels([]);
    }
  } catch (error) {
    console.error("Error fetching favorites:", error);
    setError("Có lỗi khi tải danh sách yêu thích");
    setFavoriteHotels([]);
  } finally {
    setLoading(false);
  }
};
```

---

## 🧪 Testing

### Test Cases

**1. Thêm vào Yêu Thích**
```
✓ User chưa đăng nhập → Thông báo "Đăng nhập"
✓ User đã đăng nhập → Thêm thành công → Trái tim đỏ
✓ Kiểm tra DB: favorites array cập nhật
```

**2. Xóa khỏi Yêu Thích**
```
✓ Click trái tim đỏ → Xóa thành công → Trái tim trắng
✓ Kiểm tra DB: favorites array cập nhật
```

**3. Kiểm Tra Trạng Thái**
```
✓ Refresh page → Trạng thái vẫn chính xác
✓ Nhiều tab mở → Đồng bộ trạng thái
```

**4. Danh Sách Yêu Thích**
```
✓ Xem danh sách đầy đủ
✓ Xóa từ danh sách → Cập nhật ngay
✓ Rỗng → Hiển thị empty state
```

---

## 🔐 Security

✅ **Authentication:**
- Yêu cầu token JWT trong header
- verifyToken middleware bảo vệ tất cả endpoints

✅ **Authorization:**
- User chỉ có thể modify favorites của chính họ
- userId từ params kiểm tra với user từ token

✅ **Validation:**
- Kiểm tra hotelId tồn tại
- Kiểm tra userId tồn tại

---

## 📊 Database Schema

```javascript
// User Model
{
  ...otherFields,
  favorites: {
    type: [String],
    default: [],
    // Ví dụ: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
  }
}
```

**Lợi ích của Array of IDs:**
- ✅ Đơn giản, dễ quản lý
- ✅ Tính toán nhanh
- ✅ Tiết kiệm dung lượng
- ✅ Dễ query

---

## 🚀 Performance Optimization

**Tối ưu hóa hiện tại:**

1. **Check Cache**: Lưu trạng thái trong component state
2. **Batch Requests**: Fetch tất cả chi tiết trong 1 request
3. **Lazy Load**: Chỉ fetch khi cần thiết
4. **Error Handling**: Fallback gracefully khi có lỗi

**Cải thiện tương lai:**
```javascript
// Có thể thêm pagination cho danh sách yêu thích
GET /api/favorites/:userId/hotels?page=1&limit=10

// Có thể cache ở browser
localStorage.setItem('favorites', JSON.stringify(favorites))

// Real-time update với WebSocket
socket.on('favorite-updated', (data) => {
  setFavoriteHotels(...);
})
```

---

## 🐛 Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-----------|----------|
| 401 Unauthorized | Token hết hạn | Login lại |
| 404 User not found | UserID sai | Kiểm tra localStorage |
| Cannot add duplicate | Đã có trong favorites | Xóa trước thêm sau |
| API returns null | Network lỗi | Kiểm tra console.error |

---

## 📝 File Structure

```
api/
├── controllers/
│   └── favorite.js (4 functions: toggle, getFavorites, getFavoriteHotels, isFavorite)
├── routes/
│   └── favorites.js (6 endpoints)
├── models/
│   └── User.js (favorites field)

client/
├── components/
│   └── favoriteButton/
│       ├── FavoriteButton.jsx (Main component)
│       └── favoriteButton.css (Styling + animations)
├── pages/
│   ├── hotel/
│   │   └── Hotel.jsx (Integrated FavoriteButton)
│   └── favorites/
│       ├── Favorites.jsx (Favorites list page)
│       └── favorites.css
└── utils/
    └── axiosInstance.js (API calls)
```

---

## ✨ Features Implemented

✅ User Authentication Required  
✅ Add/Remove Favorites Toggle  
✅ Persistent Storage (MongoDB)  
✅ Real-time UI Updates  
✅ Heart Icon Animation  
✅ Favorites List Page  
✅ Responsive Design  
✅ Error Handling  
✅ Loading States  
✅ Empty State UI  

---

## 🎯 Next Steps

1. **Test toàn bộ flow** - Từ login → add favorite → view list → remove
2. **Check Database** - MongoDB xem favorites array cập nhật
3. **Test Edge Cases** - Network errors, double clicks, etc.
4. **Performance** - Monitor API response time
5. **Deployment** - Deploy backend và frontend

---

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** ✅ Ready for Testing
