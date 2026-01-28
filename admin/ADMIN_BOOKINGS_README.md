# Admin Panel - Quản Lý Đặt Phòng & Thống Kê

## 🎯 Tính Năng Mới

### 1. **Trang Quản Lý Đặt Phòng** (`/bookings`)
- ✅ Xem danh sách tất cả đơn đặt phòng
- ✅ Tìm kiếm đơn theo tên khách hoặc ID
- ✅ Lọc theo trạng thái: Đã thanh toán, Hoàn thành, Đã hủy
- ✅ Xem chi tiết đơn đặt (khách hàng, phòng, ngày, tổng tiền)
- ✅ Cập nhật trạng thái đơn (Hủy, Đánh dấu hoàn thành)
- ✅ Xóa đơn đặt

**Chi Tiết Hiển Thị:**
- ID đơn đặt (mã rút gọn)
- Tên khách hàng & tên chủ thẻ
- Ngày đặt, ngày nhận, ngày trả
- Tổng số tiền (VND)
- Trạng thái thanh toán

### 2. **Trang Thống Kê & Phân Tích** (`/statistics`)
- 📊 **KPI Cards:**
  - Tổng số đơn đặt
  - Tổng doanh thu
  - Số đơn đã thanh toán
  - Số đơn hoàn thành

- 📈 **Biểu Đồ Doanh Thu Theo Tháng**
  - Hiển thị doanh thu 12 tháng gần nhất
  - Hover để xem chi tiết

- 📊 **Biểu Đồ Doanh Thu Theo Ngày**
  - Chọn tháng để xem chi tiết theo ngày
  - Scroll ngang để xem tất cả ngày

- 📋 **Bảng Tóm Tắt**
  - Doanh thu theo tháng
  - Số lượng đơn
  - Doanh thu trung bình

## 🔧 Cài Đặt

### Backend API Endpoints

```
GET    /api/bookings              - Lấy tất cả đơn (Admin)
POST   /api/bookings              - Tạo đơn đặt mới
GET    /api/bookings/:id          - Lấy chi tiết đơn
GET    /api/bookings/user/:userId - Lấy đơn của user
GET    /api/bookings/hotel/:hotelId - Lấy đơn của hotel
PUT    /api/bookings/:id          - Cập nhật trạng thái
DELETE /api/bookings/:id          - Xóa đơn
```

### Trạng Thái Đơn Đặt

```javascript
{
  "confirmed": "Đã thanh toán",   // Màu xanh lá
  "completed": "Hoàn thành",      // Màu xanh nước biển
  "cancelled": "Đã hủy"           // Màu đỏ
}
```

## 📱 Menu Sidebar

Thêm 2 menu mới vào sidebar:
1. **Đặt Phòng** (BookOpen icon) → `/bookings`
2. **Thống Kê** (BarChart3 icon) → `/statistics`

## 🎨 Giao Diện

### Bookings Page
- **Header:** Tiêu đề + Thống kê nhanh (Tổng đơn, Đã thanh toán)
- **Controls:** Tìm kiếm + Bộ lọc trạng thái
- **Table:** Danh sách đơn với columns chính
- **Modal:** Chi tiết đơn khi click "Xem"

### Statistics Page
- **Header:** Tiêu đề + Subtitle
- **KPI Grid:** 4 card thống kê chính
- **Charts:** 2 biểu đồ (tháng + ngày)
- **Table:** Tóm tắt doanh thu

## 🔐 Bảo Mật

- Tất cả endpoints cần **token xác thực** (trừ POST /api/bookings)
- Admin token lưu trong localStorage
- Yêu cầu header: `Authorization: Bearer <token>`

## 📊 Dữ Liệu Booking

```javascript
{
  _id: ObjectId,
  hotelId: ObjectId,
  userId: ObjectId,
  userName: String,           // Tên đăng nhập
  cardholderName: String,     // Tên chủ thẻ
  roomTypes: Array,           // Thông tin phòng
  selectedRooms: Map,         // Số lượng từng loại
  totalAmount: Number,        // Tổng tiền (VND)
  dates: {
    startDate: Date,          // Ngày nhận phòng
    endDate: Date             // Ngày trả phòng
  },
  paymentDate: Date,          // Ngày thanh toán
  status: String,             // confirmed/completed/cancelled
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Cách Sử Dụng

### Quản Lý Đơn Đặt

1. **Xem danh sách:**
   - Admin → Đặt Phòng
   - Bảng hiển thị tất cả đơn

2. **Tìm kiếm:**
   - Gõ tên khách hoặc ID vào ô tìm kiếm

3. **Lọc:**
   - Chọn trạng thái từ dropdown "Tất cả trạng thái"

4. **Xem chi tiết:**
   - Click icon "Mắt" để mở modal
   - Xem đầy đủ info khách, phòng, ngày, tiền

5. **Cập nhật trạng thái:**
   - Click "Hủy Đơn" hoặc "Đánh Dấu Hoàn Thành"

6. **Xóa:**
   - Click icon "Trash" để xóa (cần xác nhận)

### Phân Tích Doanh Thu

1. **Tổng quát:**
   - 4 KPI card hiển thị số liệu chính

2. **Xu hướng tháng:**
   - Biểu đồ cột so sánh doanh thu 12 tháng

3. **Chi tiết theo ngày:**
   - Chọn tháng bằng date picker
   - Biểu đồ bar nhỏ cho từng ngày

4. **Báo cáo bảng:**
   - Xem tóm tắt doanh thu, số đơn, trung bình

## 💡 Tính Năng Nâng Cao

- **Lọc đơn theo date range** (có thể thêm sau)
- **Export báo cáo** (CSV/PDF)
- **Thống kê theo hotel** (nếu cần)
- **Biểu đồ pie** cho phân bổ phòng
- **Nhắc nhở hết hạn check-out**

## ⚠️ Lưu Ý

- Cần MongoDB connection chạy bình thường
- API server phải chạy trên port 8800
- Admin phải đăng nhập để xem dữ liệu
- Ngày tháng hiển thị theo định dạng Việt Nam (dd/mm/yyyy)
- Tiền hiển thị định dạng VND với dấu phân cách
