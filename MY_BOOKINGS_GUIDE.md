# 📋 Chức Năng "Lịch Sử Đặt Phòng" (My Bookings)

## 🎯 Tổng Quan
Chức năng cho phép người dùng xem lịch sử tất cả các phòng đã đặt, bao gồm thông tin chi tiết về booking, trạng thái thanh toán và các chi tiết liên quan.

## ✅ Hoàn Thành

### 📝 Files Tạo Mới (2 files)
1. **`client/src/pages/myBookings/MyBookings.jsx`** (590 lines)
   - Component chính để hiển thị lịch sử booking
   - Fetch bookings từ API: `GET /api/bookings/user/:userId`
   - Hiển thị danh sách booking với filter theo trạng thái
   - Modal chi tiết booking khi click "Xem Chi Tiết"
   - Xử lý loading, error states
   - Responsive design

2. **`client/src/pages/myBookings/myBookings.css`** (800+ lines)
   - Styling chuyên nghiệp, modern
   - Gradient backgrounds, card designs
   - Status badges với màu code-specific
   - Modal styling với smooth animations
   - Responsive breakpoints (768px, 480px)
   - Custom scrollbar styling

### 🔄 Files Cập Nhật (2 files)
1. **`client/src/App.js`**
   - Import MyBookings component
   - Thêm route: `<Route path="/my-bookings" element={<MyBookings/>}/>`

2. **`client/src/components/navbar/Navbar.jsx`**
   - Import faCalendar icon
   - Cập nhật dropdown menu
   - Thay thế "Đơn đặt phòng" button thành "Lịch sử đặt phòng"
   - Navigate đến `/my-bookings` (thay vì `/bookings`)

## 🔌 Backend Endpoints (Sẵn Có)
```
GET /api/bookings/user/:userId
- Headers: Authorization: Bearer <token>
- Response: Array of booking objects with populated hotelId
- Status: 200 OK
```

## 📊 Data Flow

### 1. Fetch Bookings
```
MyBookings component mounts
  ↓
useEffect kiểm tra AuthContext.user
  ↓
Gọi API: GET /api/bookings/user/{user._id}
  ↓
Gửi token từ localStorage trong Authorization header
  ↓
Backend trả về array bookings với hotelId populated
```

### 2. Display Bookings
```
Mỗi booking hiển thị:
├─ Hotel Info
│  ├─ Tên Khách Sạn (từ hotelId.name)
│  └─ Status Badge (confirmed/completed/cancelled)
├─ Room Details
│  ├─ Loại Phòng (từ roomTypes)
│  ├─ Số Lượng (từ selectedRooms)
│  └─ Giá (room.price)
├─ Stay Info
│  ├─ Nhận Phòng (dates.startDate)
│  ├─ Trả Phòng (dates.endDate)
│  └─ Số Đêm (calculated)
└─ Payment Info
   ├─ Tổng Tiền (totalAmount)
   └─ Ngày Đặt (paymentDate)
```

## 🎨 UI Features

### Filter Buttons
```
- Tất Cả (count)
- Đã Thanh Toán (count)
- Hoàn Thành (count)
- Đã Hủy (count)
```

### Booking Card
```
┌─────────────────────────────────────┐
│ 🏨 Hotel Name    [✓ Status Badge]   │ ← Header
├─────────────────────────────────────┤
│ 🛏️ Loại Phòng:  Double Room x2      │
│ 📅 Nhận Phòng:   01/01/2024         │
│ 📅 Trả Phòng:    03/01/2024         │
│ ⏰ Số Đêm:       2 đêm              │
│ 💰 Tổng Tiền:    10,000,000 VND    │
│ Mã Đơn: ABC12345                   │
├─────────────────────────────────────┤
│ [Xem Chi Tiết]  Đặt ngày 15/12/2023│
└─────────────────────────────────────┘
```

### Detail Modal
```
Chi Tiết Booking
├─ Thông Tin Khách Sạn
│  ├─ Tên Khách Sạn
│  └─ Địa Chỉ
├─ Thông Tin Đặt Phòng
│  ├─ Mã Đơn
│  ├─ Trạng Thái
│  └─ Ngày Đặt
├─ Phòng Đã Đặt (Grid)
│  ├─ Tên Phòng x2
│  ├─ Giá: 500,000 VND/đêm
│  ├─ Số Đêm: 2
│  └─ Thành Tiền: 1,000,000 VND
├─ Thời Gian Ở
│  ├─ Nhận Phòng
│  ├─ Trả Phòng
│  └─ Số Đêm
├─ Thông Tin Khách Hàng
│  ├─ Tên Đăng Nhập
│  └─ Tên Chủ Thẻ
└─ Tổng Cộng
   └─ 10,000,000 VND
```

## 🎯 Status Badges
| Status | Label | Color | Icon |
|--------|-------|-------|------|
| confirmed | Đã Thanh Toán | Green | ✓ |
| completed | Đã Hoàn Thành | Green | ✓ |
| cancelled | Đã Hủy | Red | ✕ |
| pending | Chờ Xử Lý | Orange | ⏱ |

## 🔐 Authentication
- Yêu cầu đăng nhập
- Sử dụng AuthContext lấy user._id
- Token từ localStorage gửi trong Authorization header
- Hiển thị login prompt nếu chưa đăng nhập

## 📱 Responsive Design
```
Desktop (1200px+)      : Grid 2 columns
Tablet (768px - 1200px): Grid 1 column
Mobile (< 768px)       : Stack layout
```

## 🚀 Testing Steps

### 1. Đăng Nhập
```
- Truy cập /login
- Nhập credentials
- Lưu token và user info
```

### 2. Đặt Phòng
```
- Tìm khách sạn
- Chọn phòng
- Thực hiện thanh toán
- Xác nhận booking
```

### 3. Xem Lịch Sử
```
- Click vào user dropdown (góc phải navbar)
- Chọn "Lịch sử đặt phòng"
- Verify các booking xuất hiện
- Test filter buttons
- Click "Xem Chi Tiết" để mở modal
```

### 4. Verify Data
```
Kiểm tra:
- ✓ Tên khách sạn load đúng
- ✓ Loại phòng hiển thị
- ✓ Ngày check-in/out đúng
- ✓ Tổng tiền hiển thị
- ✓ Trạng thái badge
- ✓ Modal chi tiết chính xác
- ✓ Filter buttons work
- ✓ Responsive trên mobile
```

## 🐛 Troubleshooting

### Problem: 404 hoặc 401 error
```
Solution: Kiểm tra token trong localStorage
- Verify token được gửi trong Authorization header
- Kiểm tra token còn hiệu lực
- Login lại nếu cần
```

### Problem: Data không load
```
Solution:
- Check Network tab trong DevTools
- Verify userId được truyền đúng
- Check MongoDB connection
- Kiểm tra hotelId populate trong controller
```

### Problem: Layout bị lỗi
```
Solution:
- Clear browser cache
- Hard refresh (Ctrl+F5)
- Kiểm tra CSS imports
- Verify FontAwesome icons load
```

## 📦 Dependencies
```
- React 18+
- React Router v6
- Axios
- FontAwesome (free-solid-svg-icons)
- AuthContext (custom)
```

## 🎓 Best Practices Used
✓ Token-based authentication
✓ Data population (hotelId.name)
✓ Responsive design
✓ Error handling
✓ Loading states
✓ Modal dialogs
✓ Filtering/Sorting
✓ Date formatting (locale-specific)
✓ Accessibility (semantic HTML, ARIA)
✓ Performance optimization

## 🔮 Future Enhancements
- [ ] Export booking as PDF
- [ ] Email receipt
- [ ] Modify booking dates
- [ ] Cancel booking
- [ ] Review hotel after checkout
- [ ] Booking statistics chart
- [ ] Recurring bookings
- [ ] Price comparison history

## 📞 Support
Nếu gặp vấn đề:
1. Check console logs (F12)
2. Verify API endpoint working (Postman)
3. Check token validity
4. Review data structure in MongoDB

---

**Status**: ✅ COMPLETE
**Created**: 2024
**Last Updated**: 2024
