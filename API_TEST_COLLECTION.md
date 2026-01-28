# Favorite Hotel - API Test Collection

## 📌 Base URL
```
http://localhost:8800/api
```

## 🔐 Authentication Header
Tất cả requests cần header:
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## ✅ Test Cases

### 1. GET /favorites/:userId/check
**Mục đích:** Kiểm tra khách sạn có trong yêu thích không

**URL:**
```
GET http://localhost:8800/api/favorites/[USER_ID]/check?hotelId=[HOTEL_ID]
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Expected Response (200):**
```json
{
  "isFavorite": true
}
```

---

### 2. POST /favorites/:userId/toggle
**Mục đích:** Thêm/xóa khách sạn từ yêu thích (RECOMMENDED)

**URL:**
```
POST http://localhost:8800/api/favorites/[USER_ID]/toggle
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "hotelId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Expected Response (200) - Thêm:**
```json
{
  "message": "Hotel added to favorites",
  "isFavorite": true
}
```

**Expected Response (200) - Xóa:**
```json
{
  "message": "Hotel removed from favorites",
  "isFavorite": false
}
```

---

### 3. POST /favorites/:userId/add
**Mục đích:** Thêm khách sạn (cũ - dùng toggle thay thế)

**URL:**
```
POST http://localhost:8800/api/favorites/[USER_ID]/add
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "hotelId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Expected Response (200):**
```json
{
  "message": "Hotel added to favorites",
  "isFavorite": true
}
```

---

### 4. POST /favorites/:userId/remove
**Mục đích:** Xóa khách sạn (cũ - dùng toggle thay thế)

**URL:**
```
POST http://localhost:8800/api/favorites/[USER_ID]/remove
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "hotelId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Expected Response (200):**
```json
{
  "message": "Hotel removed from favorites",
  "isFavorite": false
}
```

---

### 5. GET /favorites/:userId
**Mục đích:** Lấy danh sách ID các khách sạn yêu thích

**URL:**
```
GET http://localhost:8800/api/favorites/[USER_ID]
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Expected Response (200):**
```json
{
  "favorites": [
    "65a1b2c3d4e5f6g7h8i9j0k1",
    "65a1b2c3d4e5f6g7h8i9j0k2"
  ],
  "count": 2
}
```

---

### 6. GET /favorites/:userId/hotels
**Mục đích:** Lấy danh sách đầy đủ khách sạn yêu thích (với tất cả thông tin)

**URL:**
```
GET http://localhost:8800/api/favorites/[USER_ID]/hotels
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Expected Response (200):**
```json
{
  "count": 2,
  "hotels": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Grand Hotel Hanoi",
      "type": "hotel",
      "city": "Hà Nội",
      "address": "123 Tran Hung Dao",
      "distance": "2km",
      "photos": [
        "https://example.com/photo1.jpg"
      ],
      "title": "5-star luxury hotel",
      "desc": "Hotel description",
      "star": 4.5,
      "rooms": ["room1", "room2"],
      "cheapestPrice": 500000,
      "featured": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "name": "Saigon Pearl Hotel",
      "type": "hotel",
      "city": "TP. Hồ Chí Minh",
      ...
    }
  ]
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "message": "Hotel ID is required"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authenticated"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

---

## 🧪 Testing Workflow

### Bước 1: Đăng nhập
```
POST http://localhost:8800/api/auth/login
Body: { "username": "testuser", "password": "password123" }
Lấy: token và user._id
```

### Bước 2: Kiểm tra Yêu Thích (Lần đầu)
```
GET /favorites/[USER_ID]/check?hotelId=65a1b2c3d4e5f6g7h8i9j0k1
Response: { "isFavorite": false }
```

### Bước 3: Thêm vào Yêu Thích
```
POST /favorites/[USER_ID]/toggle
Body: { "hotelId": "65a1b2c3d4e5f6g7h8i9j0k1" }
Response: { "message": "Hotel added to favorites", "isFavorite": true }
```

### Bước 4: Kiểm tra lại
```
GET /favorites/[USER_ID]/check?hotelId=65a1b2c3d4e5f6g7h8i9j0k1
Response: { "isFavorite": true }
```

### Bước 5: Xem danh sách
```
GET /favorites/[USER_ID]/hotels
Response: { "count": 1, "hotels": [...] }
```

### Bước 6: Xóa khỏi Yêu Thích
```
POST /favorites/[USER_ID]/toggle
Body: { "hotelId": "65a1b2c3d4e5f6g7h8i9j0k1" }
Response: { "message": "Hotel removed from favorites", "isFavorite": false }
```

---

## 📱 Frontend Integration Test

### Test FavoriteButton Component
```jsx
// Tính năng cần test
✓ Button disabled khi user chưa login
✓ Heart icon đổi màu khi click
✓ Tooltip hiển thị đúng
✓ Animation trái tim hoạt động
✓ API call thành công
✓ State cập nhật ngay
```

### Test SearchItem Integration
```jsx
✓ FavoriteButton render ở vị trí đúng
✓ Click không ảnh hưởng search result
✓ Trạng thái persist khi scroll
```

### Test Hotel Detail Page
```jsx
✓ FavoriteButton render ở header
✓ Trạng thái load đúng lần đầu
✓ Click toggle thành công
```

### Test Favorites Page
```jsx
✓ Tải danh sách đầy đủ
✓ Hiển thị đúng số lượng
✓ Click nút xóa update list
✓ Empty state khi rỗng
✓ Loading state hiển thị
```

---

## 🔍 Console Logs Để Debug

```javascript
// Backend - Controller
console.log("User ID:", userId);
console.log("Hotel ID:", hotelId);
console.log("User favorites before:", user.favorites);
console.log("User favorites after:", user.favorites);

// Frontend - Component
console.log("User:", user);
console.log("Hotel ID:", hotelId);
console.log("Is Favorite:", isFavorite);
console.log("API Response:", response.data);
```

---

## 🐛 Common Issues

| Lỗi | Giải pháp |
|-----|----------|
| 401 Unauthorized | Kiểm tra token trong localStorage |
| USER_ID undefined | User chưa login, refresh page |
| API không response | Kiểm tra backend running trên port 8800 |
| Trái tim không update | Xem console.error, kiểm tra response |
| Database không save | Kiểm tra MongoDB connection |

---

## 📊 Curl Examples

```bash
# Kiểm tra yêu thích
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8800/api/favorites/USER_ID/check?hotelId=HOTEL_ID"

# Toggle yêu thích
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hotelId":"HOTEL_ID"}' \
  "http://localhost:8800/api/favorites/USER_ID/toggle"

# Lấy danh sách chi tiết
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8800/api/favorites/USER_ID/hotels"
```

---

## ✅ Checklist

- [ ] Backend running (port 8800)
- [ ] MongoDB connected
- [ ] User account created
- [ ] Able to login
- [ ] FavoriteButton component renders
- [ ] API endpoints working
- [ ] Heart icon animates
- [ ] Database updates correctly
- [ ] Favorites page loads
- [ ] Delete from favorites works
- [ ] Empty state shows correctly
- [ ] Responsive on mobile

---

**Happy Testing! 🚀**
