# Quick Test Guide - Room Availability Fix

## Tập Hợp Lệnh Test Nhanh

### 1️⃣ Kiểm Tra API Trực Tiếp

```bash
# Thay đổi giá trị:
# - HOTEL_ID: ID khách sạn thực tế
# - CHECK_IN: Ngày có booking
# - CHECK_OUT: Ngày có booking

curl -X GET "http://localhost:8800/api/bookings/availability/check?hotelId=HOTEL_ID&checkInDate=CHECK_IN&checkOutDate=CHECK_OUT"
```

**Ví Dụ:**
```bash
curl -X GET "http://localhost:8800/api/bookings/availability/check?hotelId=64a1b2c3d4e5f6g7h8i9j0k1&checkInDate=2026-02-02&checkOutDate=2026-02-05"
```

**Response Mong Đợi:**
```json
{
  "success": true,
  "bookedRoomIds": ["64a1b2c3d4e5f6g7h8i9j0k2", "64a1b2c3d4e5f6g7h8i9j0k3"],
  "conflictingBookingsCount": 2,
  "message": "Tìm thấy 2 loại phòng đã được đặt"
}
```

---

### 2️⃣ Browser DevTools Testing

**Bước 1**: Mở Hotel page
- URL: `http://localhost:3000/hotels/64a1b2c3d4e5f6g7h8i9j0k1`

**Bước 2**: Mở Developer Tools (F12)

**Bước 3**: Tab Console - Chọn ngày
- Xem logs: `[Reserve] Checking availability...`
- Xem logs: `[Reserve] Booked Room IDs: [...]`

**Bước 4**: Tab Network
- Filter: `availability/check`
- Kiểm tra Response có `bookedRoomIds` không

---

### 3️⃣ Manual Verification Checklist

#### Scenario A: Phòng trống (không có booking)
- [ ] Chọn ngày: 10/02/2026 - 15/02/2026
- [ ] Kết quả mong đợi: Tất cả phòng hiển thị
- [ ] Console: `Booked Room IDs: []` (empty array)

#### Scenario B: Một phòng đã book
- [ ] Tạo booking: Deluxe Room (02/02 - 05/02)
- [ ] Chọn ngày: 02/02 - 05/02
- [ ] Kết quả mong đợi: Deluxe Room KHÔNG hiển thị
- [ ] Console: `Booked Room IDs: ["deluxe-room-id"]`
- [ ] Server log: `Found 1 conflicting bookings`

#### Scenario C: Overlap 1 phần
- [ ] Tạo booking: Standard Room (03/02 - 05/02)
- [ ] Chọn ngày: 02/02 - 04/02 (overlap 1 ngày)
- [ ] Kết quả mong đợi: Standard Room KHÔNG hiển thị
- [ ] Server log: Vẫn xem thường overlap

#### Scenario D: Không overlap
- [ ] Tạo booking: Suite Room (02/02 - 04/02)
- [ ] Chọn ngày: 05/02 - 08/02
- [ ] Kết quả mong đợi: Suite Room hiển thị bình thường
- [ ] Console: `Booked Room IDs: []` hoặc không chứa Suite

---

### 4️⃣ Server Log Monitoring

**Bước 1**: Tại terminal API server:
```bash
cd api
npm start
# Hoặc: node index.js
```

**Bước 2**: Xem logs khi user chọn ngày:
```
[Availability Check] Hotel: 64a1b2c3d4e5f6g7h8i9j0k1, CheckIn: Sun Feb 02 2026, CheckOut: Wed Feb 05 2026
[Availability Check] Found 2 conflicting bookings
[Booking] Dates: Sun Feb 02 2026 - Wed Feb 05 2026, Rooms: 64a1b2c3d4e5f6g7h8i9j0k2
[Booking] Dates: Sun Feb 02 2026 - Wed Feb 05 2026, Rooms: 64a1b2c3d4e5f6g7h8i9j0k3
[Availability Check] Booked Room IDs: 64a1b2c3d4e5f6g7h8i9j0k2,64a1b2c3d4e5f6g7h8i9j0k3
```

---

### 5️⃣ Database Query Verification

```javascript
// MongoDB - Kiểm tra booking trùng khoảng ngày
db.bookings.find({
  hotelId: ObjectId("64a1b2c3d4e5f6g7h8i9j0k1"),
  status: { $in: ["confirmed", "completed"] },
  "dates.startDate": { $lt: ISODate("2026-02-05") },
  "dates.endDate": { $gt: ISODate("2026-02-02") }
}).pretty()
```

**Kết quả Mong Đợi:**
```javascript
{
  _id: ObjectId("..."),
  hotelId: ObjectId("64a1b2c3d4e5f6g7h8i9j0k1"),
  dates: {
    startDate: ISODate("2026-02-02"),
    endDate: ISODate("2026-02-05")
  },
  selectedRooms: Map { "64a1b2c3d4e5f6g7h8i9j0k2" => 2 },
  status: "confirmed"
}
```

---

## 🔴 Troubleshooting

### ❌ Booked phòm vẫn hiển thị?

**Kiểm Tra:**
1. Server logs có `Found X conflicting bookings` không?
   - Nếu `Found 0`: API không tìm thấy booking
   - Giải pháp: Kiểm tra booking status (phải là confirmed/completed)

2. Browser console có `Booked Room IDs: [...]` không?
   - Nếu empty: API không return room IDs
   - Giải pháp: Check API response, restart server

3. Room ID có khớp không?
   - Kiểm tra: `item._id` === room ID trong booking.selectedRooms
   - Giải pháp: Đảm bảo selectedRooms lưu room type IDs

**Nếu vẫn lỗi:**
```bash
# 1. Check API response trực tiếp
curl "http://localhost:8800/api/bookings/availability/check?..."

# 2. Check logs chi tiết
# Xem console.log ở [api/controllers/booking.js](api/controllers/booking.js)

# 3. Restart server
npm start
```

### ❌ API returns 500 error?

```bash
# Kiểm tra date format
# Phải là valid ISO date string
# Đúng: "2026-02-02T00:00:00.000Z"
# Sai: "02/02/2026"

# Check database connection
db.bookings.countDocuments()
```

---

## 📱 Quick Command Summary

```bash
# Start API server
cd api && npm start

# Test endpoint
curl "http://localhost:8800/api/bookings/availability/check?hotelId=YOUR_HOTEL_ID&checkInDate=2026-02-02&checkOutDate=2026-02-05"

# Check MongoDB
mongo
> use hoteldb (hoặc database name của bạn)
> db.bookings.find({status: "confirmed"})
```

---

## ✅ Success Indicators

Khi fix thành công:
- ✅ Booked rooms KHÔNG xuất hiện trong table
- ✅ Server logs hiển thị conflicting bookings
- ✅ Browser console logs `Booked Room IDs: [...]`
- ✅ Chọn ngày khác → rooms update

---

**Last Updated**: 28/01/2026
