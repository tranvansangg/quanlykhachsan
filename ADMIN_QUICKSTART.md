# 🚀 Quick Start - Admin Bookings & Statistics

## ✅ Những Gì Đã Được Thêm

### 📁 Files Mới Tạo:

```
admin/
├── src/pages/
│   ├── bookings/
│   │   ├── Bookings.jsx          (Trang quản lý đặt phòng)
│   │   └── bookings.scss         (Style)
│   └── statistics/
│       ├── Statistics.jsx        (Trang thống kê)
│       └── statistics.scss       (Style)
├── App.js                        (Updated - Routes)
└── src/components/Sidebar.jsx    (Updated - Menu)

api/
├── routes/bookings.js            (Updated - GET / endpoint)
└── controllers/booking.js        (Updated - getAllBookings)
```

## 🔧 Yêu Cầu Cài Đặt

### 1. Backend API Sẵn Sàng
- ✅ Model Booking.js
- ✅ Controller booking.js
- ✅ Routes bookings.js
- ✅ Endpoint GET /api/bookings

### 2. Admin Config
- ✅ Routes /bookings & /statistics thêm vào App.js
- ✅ Menu items thêm vào Sidebar.jsx

## 🎯 Sử Dụng

### Bước 1: Chạy API Server
```bash
cd api
npm start
# Server chạy trên http://localhost:8800
```

### Bước 2: Chạy Admin
```bash
cd admin
npm start
# Admin chạy trên http://localhost:3000
```

### Bước 3: Truy Cập Admin
1. Login với tài khoản Admin
2. Click "Đặt Phòng" trong sidebar → `/admin/bookings`
3. Click "Thống Kê" trong sidebar → `/admin/statistics`

## 📊 Tính Năng Chi Tiết

### Trang Đặt Phòng (`/bookings`)

| Feature | Chi Tiết |
|---------|----------|
| **List** | Tất cả đơn, sắp xếp theo mới nhất |
| **Search** | Tên khách, ID đơn |
| **Filter** | Trạng thái: Tất cả / Đã thanh toán / Hoàn thành / Đã hủy |
| **Detail** | Modal với đủ thông tin (click icon mắt) |
| **Update** | Hủy hoặc Đánh dấu hoàn thành |
| **Delete** | Xóa đơn (cần xác nhận) |

**Cột Bảng:**
- ID Đơn (8 ký tự cuối)
- Khách Hàng (Username + Tên Chủ Thẻ)
- Ngày Đặt, Nhận, Trả
- Tổng Tiền (VND)
- Trạng Thái (Badge)
- Hành Động (Xem/Xóa)

### Trang Thống Kê (`/statistics`)

| Phần | Chi Tiết |
|------|----------|
| **KPI Cards** | 4 số liệu chính (đơn, doanh thu, thanh toán, hoàn thành) |
| **Monthly Chart** | Doanh thu 12 tháng gần nhất (biểu đồ cột) |
| **Daily Chart** | Doanh thu từng ngày (chọn tháng) |
| **Summary Table** | Tóm tắt theo tháng (đơn, doanh thu, trung bình) |

## 🎨 Thiết Kế

### Color Scheme:
- **Primary:** #667eea (Xanh tím)
- **Secondary:** #764ba2 (Tím)
- **Success:** #27ae60 (Xanh lá)
- **Warning:** #f39c12 (Cam)
- **Danger:** #e74c3c (Đỏ)

### Components:
- ✨ Smooth animations
- 📱 Responsive design
- 🎯 Clear UI/UX
- ♿ Accessible

## 🔐 API Endpoints

```javascript
// GET all bookings (Admin)
GET /api/bookings
Headers: Authorization: Bearer <token>
Response: Array<Booking>

// Create booking (Public)
POST /api/bookings
Body: { hotelId, userId, roomTypes, ... }
Response: { success: true, data: Booking }

// Get booking detail
GET /api/bookings/:id
Response: { success: true, data: Booking }

// Update status
PUT /api/bookings/:id
Headers: Authorization: Bearer <token>
Body: { status: "confirmed|completed|cancelled" }

// Delete booking
DELETE /api/bookings/:id
Headers: Authorization: Bearer <token>
Response: { success: true }
```

## ✨ Features Ready

✅ Danh sách đơn đặt  
✅ Tìm kiếm & lọc  
✅ Xem chi tiết đơn  
✅ Cập nhật trạng thái  
✅ Xóa đơn  
✅ Thống kê tổng quát  
✅ Biểu đồ doanh thu tháng  
✅ Biểu đồ doanh thu ngày  
✅ Bảng tóm tắt  
✅ Responsive design  

## 🐛 Troubleshooting

### 404 error khi fetch bookings
- Kiểm tra API server chạy (`npm start` trong folder api)
- Kiểm tra token hợp lệ (đăng nhập lại)

### Không hiển thị dữ liệu
- Kiểm tra mongoDB connection
- Xem console (F12) để xem error

### Styling lỗi
- Hard refresh (Ctrl+F5)
- Xóa node_modules & npm install lại

## 📝 Next Steps (Tùy Chọn)

1. **Export Report:** Thêm nút download CSV/PDF
2. **Advanced Filter:** Date range, status multi-select
3. **Notifications:** Alert khi có đơn mới
4. **Email Integration:** Gửi email khi cập nhật trạng thái
5. **Room Analytics:** Thống kê phòng nào bán chạy nhất
6. **Staff Management:** Gán staff xử lý đơn

---

**Status:** ✅ COMPLETE - Ready to Use

Chúc bạn sử dụng vui vẻ! 🎉
