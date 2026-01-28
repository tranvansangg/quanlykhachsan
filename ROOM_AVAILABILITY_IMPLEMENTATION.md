# Tính Năng Kiểm Tra Tính Khả Dụng Phòng (Room Availability Feature)

## Tổng Quan
Đã triển khai tính năng kiểm tra tính khả dụng phòng dựa trên ngày check-in và check-out. Hệ thống sẽ:

1. **Lấy danh sách tất cả phòng** của khách sạn
2. **Kiểm tra bảng booking** để tìm những phòng đã được đặt
3. **Lọc phòng trùng lịch**: Những phòng có booking trùng khoảng thời gian sẽ **KHÔNG được hiển thị**
4. **Hiển thị chỉ phòng trống**: Chỉ các phòng không bị trùng lịch được hiển thị cho người dùng

---

## Các Thay Đổi Được Thực Hiện

### 1. Backend - API Endpoint (Booking Controller)
**File**: [api/controllers/booking.js](api/controllers/booking.js)

**Hàm mới**: `checkRoomAvailability`

```javascript
export const checkRoomAvailability = async (req, res, next) => {
  try {
    const { hotelId, checkInDate, checkOutDate } = req.query;

    // Kiểm tra các booking đã xác nhận/không bị hủy
    // Một booking trùng nếu: booking.startDate < requestEndDate AND booking.endDate > requestStartDate
    const conflictingBookings = await Booking.find({
      hotelId: hotelId,
      status: { $ne: "cancelled" },
      $and: [
        { "dates.startDate": { $lt: endDate } },
        { "dates.endDate": { $gt: startDate } },
      ],
    }).select("selectedRooms");

    // Build a set of booked room type IDs
    const bookedRoomIds = new Set();
    conflictingBookings.forEach((booking) => {
      if (booking.selectedRooms && typeof booking.selectedRooms === "object") {
        Object.keys(booking.selectedRooms).forEach((roomId) => {
          bookedRoomIds.add(roomId);
        });
      }
    });

    res.status(200).json({
      success: true,
      bookedRoomIds: Array.from(bookedRoomIds),
    });
  } catch (err) {
    next(err);
  }
};
```

**Endpoint**: `GET /api/bookings/availability/check?hotelId=xxx&checkInDate=xxx&checkOutDate=xxx`

---

### 2. Backend - Route Configuration
**File**: [api/routes/bookings.js](api/routes/bookings.js)

Thêm route cho kiểm tra tính khả dụng:
```javascript
router.get("/availability/check", checkRoomAvailability);
```

---

### 3. Frontend - Reserve Component
**File**: [client/src/components/reserve/Reserve.jsx](client/src/components/reserve/Reserve.jsx)

**Các thay đổi chính**:

#### State Management
```javascript
const [bookedRoomIds, setBookedRoomIds] = useState(new Set());
const [availabilityLoading, setAvailabilityLoading] = useState(false);
```

#### useEffect Hook - Kiểm tra tính khả dụng khi dates thay đổi
```javascript
useEffect(() => {
  if (dates && dates[0]?.startDate && dates[0]?.endDate && hotelId) {
    checkAvailability();
  }
}, [dates, hotelId]);
```

#### checkAvailability Function - Gọi API
```javascript
const checkAvailability = async () => {
  try {
    setAvailabilityLoading(true);
    const response = await axios.get(
      `http://localhost:8800/api/bookings/availability/check`,
      {
        params: {
          hotelId: hotelId,
          checkInDate: dates[0]?.startDate,
          checkOutDate: dates[0]?.endDate,
        },
      }
    );

    if (response.data.success) {
      setBookedRoomIds(new Set(response.data.bookedRoomIds));
    }
  } catch (err) {
    console.error("Lỗi khi kiểm tra tính khả dụng:", err);
    setBookedRoomIds(new Set());
  } finally {
    setAvailabilityLoading(false);
  }
};
```

#### Helper Function
```javascript
const isRoomBooked = (roomId) => {
  return bookedRoomIds.has(roomId);
};
```

#### Room Filtering Logic
```javascript
// Kiểm tra nếu phòng đã được đặt cho các ngày được chọn
const isBooked = isRoomBooked(item._id);
const availableCount = isBooked ? 0 : getAvailableCount(item.roomNumbers);
const isUnavailable = availableCount === 0;
```

#### UI Rendering
- Nếu `isUnavailable === true`: Hiển thị "Đã Hết Phòng" badge
- Dropdown select bị disable nếu phòng không khả dụng
- Tự động cập nhật khi người dùng chọn ngày mới

---

## Quy Trình Làm Việc

```
User chọn Check-in/Check-out dates
        ↓
Reserve component receives dates (via useEffect)
        ↓
Call API: GET /api/bookings/availability/check?hotelId=xxx&checkInDate=xxx&checkOutDate=xxx
        ↓
API kiểm tra Booking collection:
  - Tìm tất cả bookings có status !== 'cancelled'
  - Lọc những booking có ngày overlap với requested dates
  - Lấy danh sách room IDs từ selectedRooms của booking
        ↓
API trả về: { bookedRoomIds: [...room_ids] }
        ↓
Frontend lưu vào state: bookedRoomIds
        ↓
Render room table:
  - Rooms có ID trong bookedRoomIds → Mark as "Đã Hết Phòng"
  - Rooms ngoài bookedRoomIds → Hiển thị bình thường
```

---

## Kiểm Thử

### Test Case 1: Tất cả phòng trống
1. Chọn ngày 01/02/2026 - 05/02/2026
2. **Kết quả mong đợi**: Tất cả phòng đều available (availableCount > 0)

### Test Case 2: Một số phòng đã đặt
1. Có booking: 02/02/2026 - 04/02/2026 cho Deluxe Room
2. Chọn ngày 02/02/2026 - 04/02/2026
3. **Kết quả mong đợi**: Deluxe Room hiển thị "Đã Hết Phòng", các phòng khác bình thường

### Test Case 3: Phòng trùng lịch một phần
1. Có booking: 02/02/2026 - 04/02/2026
2. Chọn ngày 03/02/2026 - 05/02/2026
3. **Kết quả mong đợi**: Phòng vẫn hiển thị "Đã Hết Phòng" (vì có overlap)

### Test Case 4: Phòng không trùng lịch
1. Có booking: 02/02/2026 - 04/02/2026
2. Chọn ngày 05/02/2026 - 08/02/2026
3. **Kết quả mong đợi**: Phòng available bình thường

---

## Công Nghệ Sử Dụng

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React, Axios
- **Query Logic**: MongoDB aggregation ($lt, $gt operators)

---

## Lưu Ý Quan Trọng

1. **Các booking bị hủy (status: 'cancelled') sẽ KHÔNG được tính** vào danh sách phòng không khả dụng
2. **Kiểm tra date overlap** sử dụng logic: `booking.startDate < requestEndDate AND booking.endDate > requestStartDate`
3. **Tự động cập nhật** mỗi khi người dùng thay đổi ngày check-in/check-out
4. **Error handling**: Nếu API call thất bại, tất cả phòng được coi là available

---

## Cải Tiến Tiềm Năng

1. Caching availability data để giảm database queries
2. Real-time updates khi có booking mới được tạo
3. Hiển thị booking details khi hover vào "Đã Hết Phòng"
4. Filter theo multiple room types cùng lúc
5. Thêm waitlist feature cho phòng không khả dụng

---

## Troubleshooting

### Vấn đề: Phòng luôn hiển thị "Đã Hết Phòng"
- **Giải pháp**: Kiểm tra API response, đảm bảo hotelId đúng

### Vấn đề: Loading mãi không xong
- **Giải pháp**: Kiểm tra network tab, đảm bảo API server đang chạy

### Vấn đề: Phòng không update sau khi chọn ngày mới
- **Giải pháp**: Kiểm tra dependency array của useEffect

---

**Tác Vụ Hoàn Thành**: ✅ Tất cả features đã được implement thành công
