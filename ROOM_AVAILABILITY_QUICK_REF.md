# Quick Reference: Kiểm Tra Tính Khả Dụng Phòng

## Tóm Tắt Nhanh

**Chức Năng**: Khi người dùng chọn ngày check-in/check-out, hệ thống sẽ:
- ✅ Kiểm tra tất cả các phòng
- ✅ So sánh với bảng booking
- ✅ Ẩn những phòng đã được đặt trùng khoảng thời gian
- ✅ Chỉ hiển thị phòng trống

---

## Files Chính Được Thay Đổi

### Backend
1. **[api/controllers/booking.js](api/controllers/booking.js#L323)**
   - Hàm `checkRoomAvailability` (Line 323)
   - Logic: Lấy booking overlap, extract room IDs

2. **[api/routes/bookings.js](api/routes/bookings.js#L20)**
   - Route: `GET /api/bookings/availability/check`

### Frontend
1. **[client/src/components/reserve/Reserve.jsx](client/src/components/reserve/Reserve.jsx)**
   - State: `bookedRoomIds`, `availabilityLoading`
   - Hook: `useEffect` để gọi API khi dates thay đổi (Line 37)
   - Function: `checkAvailability()` (Line 43)
   - Function: `isRoomBooked()` (Line 92)
   - Filter logic (Line 265): `isBooked = isRoomBooked(item._id)`

---

## API Endpoint

### Request
```
GET /api/bookings/availability/check
?hotelId=64a1b2c3d4e5f6g7h8i9j0k1
&checkInDate=2026-02-01
&checkOutDate=2026-02-05
```

### Response
```json
{
  "success": true,
  "bookedRoomIds": [
    "64a1b2c3d4e5f6g7h8i9j0k2",
    "64a1b2c3d4e5f6g7h8i9j0k3"
  ],
  "message": "Tìm thấy 2 loại phòng đã được đặt"
}
```

---

## Testing Commands

### 1. Kiểm Tra API Trực Tiếp (curl)
```bash
curl -X GET "http://localhost:8800/api/bookings/availability/check?hotelId=64a1b2c3d4e5f6g7h8i9j0k1&checkInDate=2026-02-01&checkOutDate=2026-02-05"
```

### 2. Trong Browser DevTools (Console)
```javascript
const hotelId = "64a1b2c3d4e5f6g7h8i9j0k1";
const checkInDate = "2026-02-01";
const checkOutDate = "2026-02-05";

fetch(`/api/bookings/availability/check?hotelId=${hotelId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`)
  .then(res => res.json())
  .then(data => console.log(data))
```

### 3. Manual Testing
1. Mở Hotel Page
2. Chọn ngày check-in/check-out
3. Quan sát tabel phòng:
   - Phòng bị book → "Đã Hết Phòng" + grayed out
   - Phòng trống → có thể select

---

## Debugging Tips

### Kiểm Tra Console
- Mở DevTools → Network tab
- Chọn ngày → Tìm request tới `/bookings/availability/check`
- Kiểm tra Response: Mảng `bookedRoomIds` có đúng không?

### Kiểm Tra MongoDB
```javascript
// Tìm booking trùng ngày
db.bookings.find({
  hotelId: ObjectId("64a1b2c3d4e5f6g7h8i9j0k1"),
  status: { $ne: "cancelled" },
  "dates.startDate": { $lt: ISODate("2026-02-05") },
  "dates.endDate": { $gt: ISODate("2026-02-01") }
})
```

---

## Validation Checklist

- [ ] API endpoint đang chạy
- [ ] HotelId được truyền đúng từ frontend
- [ ] Dates format đúng (ISO String)
- [ ] Booking data trong MongoDB có `dates`, `selectedRooms`, `status`
- [ ] Network request không bị 404/500
- [ ] Response có `bookedRoomIds` array

---

## Known Issues

None at this time ✅

---

## Performance Notes

- **O(n)** complexity: Scan all bookings, extract room IDs
- **Caching**: Không implement yet (có thể thêm Redis)
- **Real-time**: Update mỗi khi dates thay đổi

---

**Last Updated**: 28/01/2026
