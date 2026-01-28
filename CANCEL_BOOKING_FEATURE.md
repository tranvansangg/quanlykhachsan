# 🔄 Tính Năng Hủy Booking & Hoàn Tiền

## 📋 Tổng Quan

Tính năng hủy booking toàn diện cho phép khách hàng huỷ đặt phòng và nhận lại tiền, cùng với quản lý từ phía admin.

---

## 🎯 Tính Năng Chính

### 1. **Khách Hàng - Hủy Booking** (Frontend: Client)

**Vị trí:** `client/src/pages/myBookings/MyBookings.jsx`

#### Chức Năng:
- ✅ Nút "Hủy Đặt Phòng" chỉ hiển thị cho booking có trạng thái `confirmed`
- ✅ Modal xác nhận với thông tin hoàn tiền
- ✅ Hiển thị số tiền hoàn lại rõ ràng
- ✅ Lưu ý quan trọng về hủy booking

#### Hành Động:
1. Khách hàng xem danh sách booking trong "Lịch Sử Đặt Phòng"
2. Nhấp nút "Xem Chi Tiết" để xem chi tiết booking
3. Nếu trạng thái là "Đã Thanh Toán" (confirmed), nút "Hủy Đặt Phòng" hiển thị
4. Nhấp nút → Modal xác nhận hiển thị
5. Modal hiển thị:
   - ⚠️ Lưu ý hủy booking
   - Mã đơn, tên khách sạn
   - Số tiền hoàn lại
   - 2 button: "Xác Nhận Hủy" + "Giữ Lại Booking"
6. Nhấp "Xác Nhận Hủy" → API gọi tới backend
7. Thành công → Alert hiển thị tiền hoàn + danh sách refresh

#### States:
```javascript
const [showCancelModal, setShowCancelModal] = useState(false);
const [cancelLoading, setCancelLoading] = useState(false);
```

#### API Call:
```javascript
PUT /api/bookings/{bookingId}/cancel
Headers: Authorization: Bearer {token}
Body: {} (empty)

Response:
{
  success: true,
  message: "Hủy đặt phòng thành công...",
  data: {
    bookingId: id,
    refundAmount: totalAmount,
    refundStatus: "refunded",
    cancelDate: date
  }
}
```

### 2. **Backend - Cancel Booking API** (API: Backend)

**Vị trí:** `api/controllers/booking.js` + `api/routes/bookings.js`

#### Route:
```javascript
router.put("/:id/cancel", verifyToken, cancelBooking);
```

#### Controller Logic (`cancelBooking`):
1. **Xác thực:**
   - Kiểm tra booking tồn tại
   - Kiểm tra chưa hủy trước đó

2. **Cập Nhật Booking:**
   ```javascript
   status: "cancelled"
   paymentStatus: "refunded"
   cancelDate: new Date()
   ```

3. **Giải Phóng Phòng:**
   - Lấy danh sách phòng từ booking
   - Tính toán ngày check-in → check-out
   - Xóa các ngày đó khỏi `unavailableDates` của mỗi phòng
   - Lưu room lại vào database

4. **Return Response:**
   - Trả về booking ID, refund amount, refund status, cancel date

#### Database Changes:
```javascript
// Booking Model (api/models/Booking.js)
paymentStatus: {
  type: String,
  enum: ["pending", "completed", "refunded"],
  default: "completed"
},
cancelDate: {
  type: Date,
  default: null
}

// Status transitions:
- confirmed → cancelled
- paymentStatus: completed → refunded
- unavailableDates updated (dates freed up)
```

### 3. **Admin - Quản Lý Booking Hủy** (Admin Panel)

**Vị trí:** `admin/src/pages/bookings/Bookings.jsx`

#### Cập Nhật UI:
- ✅ Thêm stat: "Đã hủy" count hiển thị với màu đỏ
- ✅ Filter option: "Đã hủy" trong dropdown
- ✅ Modal detail: Thêm section "Thông Tin Hoàn Tiền" khi booking bị hủy

#### Thông Tin Hoàn Tiền Hiển Thị:
```
🔄 Thông Tin Hoàn Tiền
├─ Trạng Thái Hoàn Tiền: ✓ Đã Hoàn / Chờ xử lý
├─ Số Tiền Hoàn: XXX,XXX VND
└─ Ngày Hủy: DD/MM/YYYY
```

#### Filter & Search:
- Có thể filter booking "Đã hủy"
- Tương tự như filter "Đã thanh toán", "Hoàn thành"

---

## 📊 Data Flow Diagram

```
Frontend (Client)
    │
    ├─ MyBookings Component
    │   ├─ Show booking list
    │   ├─ Detail Modal
    │   │   ├─ "Hủy Đặt Phòng" button (if status = confirmed)
    │   │   └─ Cancel Confirmation Modal
    │   │       ├─ Show booking code
    │   │       ├─ Show refund amount
    │   │       └─ "Xác Nhận Hủy" button
    │   │
    │   └─ PUT /api/bookings/{id}/cancel
    │       │
    │       ├─ verifyToken middleware
    │       │
    │       └─ Backend (API)
    │           ├─ booking.js controller
    │           │   ├─ Validate booking
    │           │   ├─ Update booking:
    │           │   │   ├─ status = "cancelled"
    │           │   │   ├─ paymentStatus = "refunded"
    │           │   │   └─ cancelDate = now
    │           │   │
    │           │   └─ Free up room dates:
    │           │       ├─ Get selectedRooms
    │           │       ├─ Calculate date range
    │           │       ├─ For each room:
    │           │       │   └─ Remove dates from unavailableDates[]
    │           │       └─ Save room
    │           │
    │           └─ Return refund data
    │
    └─ Show success alert with refund info
        └─ Refresh booking list

Admin Panel
    │
    ├─ Bookings Component
    │   ├─ Header stats: Show "Đã hủy" count
    │   ├─ Filter: Can filter by "Đã hủy"
    │   └─ Detail Modal:
    │       └─ 🔄 Thông Tin Hoàn Tiền section
    │           ├─ Refund Status
    │           ├─ Refund Amount
    │           └─ Cancel Date
    │
    └─ GET /api/bookings (fetches all, including cancelled)
```

---

## 🎨 UI Components

### 1. Cancel Modal (Client)
```
┌──────────────────────────────────┐
│ ⚠️ Xác Nhận Hủy Đặt Phòng    [✕] │
├──────────────────────────────────┤
│ ⚠️ Lưu Ý Quan Trọng              │
│                                  │
│ • Trạng thái → "Đã Hủy"         │
│ • Tiền hoàn trong 3-5 ngày       │
│ • Hành động không thể hoàn tác   │
├──────────────────────────────────┤
│ 🔄 Thông Tin Hoàn Tiền           │
│                                  │
│ Mã Đơn:           ABC123         │
│ Khách Sạn:        Hotel XYZ      │
│ Số Tiền Hoàn:    5,000,000 VND   │
├──────────────────────────────────┤
│ [Xác Nhận Hủy]  [Giữ Lại Booking]│
└──────────────────────────────────┘
```

### 2. Admin Refund Info
```
┌────────────────────────────────┐
│ 🔄 Thông Tin Hoàn Tiền         │
├────────────────────────────────┤
│ Trạng Thái Hoàn Tiền: ✓ Đã Hoàn │
│ Số Tiền Hoàn: 5,000,000 VND    │
│ Ngày Hủy: 15/01/2025           │
└────────────────────────────────┘
```

---

## 🔒 Security

- ✅ **Token Required:** Tất cả API calls phải có Bearer token
- ✅ **User Validation:** Chỉ khách hàng đã login mới có thể hủy
- ✅ **Booking Validation:** Kiểm tra booking tồn tại trước khi hủy
- ✅ **Idempotent:** Không thể hủy booking đã hủy

---

## 📝 Testing Checklist

### Frontend Tests:
- [ ] Booking list loads correctly
- [ ] "Hủy Đặt Phòng" button only shows for confirmed bookings
- [ ] Cancel modal displays correct booking info
- [ ] Modal shows correct refund amount
- [ ] "Xác Nhận Hủy" calls API correctly
- [ ] Success alert shows refund info
- [ ] Booking list refreshes after cancel
- [ ] Cancel modal closes properly
- [ ] Booking status changes to "Đã Hủy" in list

### Backend Tests:
- [ ] Endpoint validates token
- [ ] Returns error if booking doesn't exist
- [ ] Returns error if already cancelled
- [ ] Updates booking status to "cancelled"
- [ ] Updates paymentStatus to "refunded"
- [ ] Sets cancelDate correctly
- [ ] Removes dates from room.unavailableDates
- [ ] Room can be re-booked after cancel
- [ ] Returns correct refund data

### Admin Tests:
- [ ] Cancelled bookings show in list
- [ ] Can filter by "Đã hủy" status
- [ ] Cancel count in header stats correct
- [ ] Modal shows refund info section
- [ ] Refund status displays correctly
- [ ] Cancel date shows correctly

---

## 🚀 Deployment Notes

1. **Database Migration:** Mongoose auto-creates new fields on first write
2. **No Downtime:** Feature is backward compatible
3. **Testing:** Test cancel flow before going live
4. **Notifications:** Consider adding email confirmation (optional enhancement)

---

## 📈 Future Enhancements

- [ ] Email confirmation when booking cancelled
- [ ] Cancellation policy with partial refunds
- [ ] Cancellation deadline enforcement
- [ ] Refund tracking dashboard
- [ ] Automatic refund processing
- [ ] Cancellation reason tracking
- [ ] Bulk cancellation for admin

---

## 📞 Support

Nếu có vấn đề:
1. Kiểm tra console.log cho errors
2. Xác nhận token hợp lệ
3. Kiểm tra booking status trước khi hủy
4. Xác nhận room dates đã được freed up

