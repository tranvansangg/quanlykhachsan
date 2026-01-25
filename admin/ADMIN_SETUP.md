# 🎉 Admin Dashboard - Hướng Dẫn Hoàn Chỉnh

## ✨ Admin Dashboard Đã Được Tạo

Một giao diện quản trị sang trọng, đầy đủ CRUD cho hệ thống đặt phòng khách sạn.

---

## 📋 Danh Sách Tính Năng

### ✅ Đã Hoàn Thành

| Tính Năng | Mô Tả |
|---------|-------|
| **Đăng Nhập** | Xác thực JWT, lưu token |
| **Dashboard** | Thống kê tổng quan, dữ liệu nhanh |
| **Khách Sạn** | CRUD đầy đủ, tải ảnh, tìm kiếm, sắp xếp |
| **Phòng** | CRUD đầy đủ, form nhanh |
| **Người Dùng** | Xem danh sách, xóa tài khoản |
| **Đánh Giá** | Xem danh sách, xóa, hiển thị sao |
| **Giao Diện** | Responsive, sang trọng, hiện đại |
| **Sidebar** | Menu điều hướng, đăng xuất |
| **Navbar** | Header thông tin user |

---

## 🚀 Cài Đặt Nhanh

### 1️⃣ Cài Dependencies

```bash
cd c:\Do_An\Hotel\Hotel-booking\admin
npm install
```

### 2️⃣ Chạy Admin

```bash
npm start
```

Admin mở tại: **http://localhost:3000**

### 3️⃣ Đăng Nhập

```
Username: admin
Password: password123
```

---

## 📁 Cấu Trúc Thư Mục

```
admin/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Header với user info
│   │   ├── Navbar.scss
│   │   ├── Sidebar.jsx          # Menu sidebar
│   │   └── Sidebar.scss
│   ├── pages/
│   │   ├── login/
│   │   │   ├── Login.jsx
│   │   │   └── Login.scss
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Dashboard.scss
│   │   ├── hotels/
│   │   │   ├── Hotels.jsx       # Danh sách + CRUD
│   │   │   ├── Hotels.scss
│   │   │   ├── HotelDetail.jsx  # Form thêm/sửa
│   │   │   └── HotelDetail.scss
│   │   ├── rooms/
│   │   │   ├── Rooms.jsx
│   │   │   └── Rooms.scss
│   │   ├── users/
│   │   │   ├── Users.jsx
│   │   │   └── Users.scss
│   │   └── reviews/
│   │       ├── Reviews.jsx
│   │       └── Reviews.scss
│   ├── styles/
│   │   ├── index.scss           # Global styles
│   │   └── App.scss
│   ├── App.js                   # Route chính
│   └── index.js                 # Entry point
├── package.json
├── README.md
├── GUIDE.md
└── .gitignore
```

---

## 🎨 Tính Năng Giao Diện Chi Tiết

### 🏨 Trang Khách Sạn (Hotels)

**Danh sách khách sạn (Hotels.jsx):**
- 🔍 Tìm kiếm theo tên/thành phố
- 📊 Sắp xếp: tên, thành phố, giá
- 🖼️ Hiển thị ảnh thumbnail
- ⭐ Hiển thị đánh giá
- 💰 Hiển thị giá rẻ nhất
- ✏️ Nút sửa → chi tiết
- 🗑️ Nút xóa với xác nhận
- 📊 Thống kê số khách sạn

**Form chi tiết (HotelDetail.jsx):**
- ➕ Thêm khách sạn mới
- ✏️ Sửa thông tin khách sạn
- 📋 Form 2 cột: thông tin + hình ảnh
- 🖼️ Tải lên nhiều ảnh
- 👁️ Xem trước ảnh
- ❌ Xóa ảnh
- 💾 Lưu tự động xử lý

### 🚪 Trang Phòng (Rooms)

- ➕ Thêm phòng với form nhanh
- 📋 Bảng danh sách phòng
- 🔍 Tìm kiếm phòng
- ✏️ Sửa phòng
- 🗑️ Xóa phòng

### 👥 Trang Người Dùng (Users)

- 📋 Danh sách tất cả người dùng
- 👤 Avatar hiển thị chữ cái đầu
- 📧 Email người dùng
- 📅 Ngày tạo tài khoản
- 🗑️ Xóa tài khoản

### ⭐ Trang Đánh Giá (Reviews)

- 📝 Hiển thị card đánh giá
- ⭐⭐⭐ Sao đánh giá
- 💬 Nội dung comment
- 👤 Tên người đánh giá
- 📅 Ngày đánh giá
- 🗑️ Xóa đánh giá

### 📊 Dashboard

- 4 card thống kê: Khách sạn, Phòng, Users, Reviews
- 📈 Bảng dữ liệu khách sạn gần đây
- 🎯 Quick stats (sẵn sàng mở rộng)

---

## 🎯 Hướng Dẫn Sử Dụng

### 📝 Thêm Khách Sạn

1. Nhấn nút "➕ Thêm Khách Sạn"
2. Điền form:
   - Tên khách sạn (bắt buộc)
   - Loại (Hotel, Apartment, Resort, v.v.)
   - Thành phố (bắt buộc)
   - Giá rẻ nhất (bắt buộc)
   - Địa chỉ, tiêu đề, mô tả
   - Đánh giá (1-5)
3. Tải lên ảnh (kéo thả hoặc chọn)
4. Nhấn "Tạo Mới"

### ✏️ Sửa Khách Sạn

1. Nhấn nút "Sửa" hoặc "Xem Chi Tiết" trên card
2. Chỉnh sửa thông tin
3. Thêm hoặc xóa ảnh
4. Nhấn "Cập Nhật"

### 🗑️ Xóa Khách Sạn

1. Nhấn nút "Xóa" trên card
2. Xác nhận trong modal
3. Khách sạn sẽ bị xóa

### 🔍 Tìm Kiếm

- Nhập tên hoặc thành phố trong ô tìm kiếm
- Danh sách tự động cập nhật

### 📊 Sắp Xếp

- Chọn loại sắp xếp trong dropdown
- Danh sách tự động sắp xếp

---

## 🔌 API Endpoints Sử Dụng

```
GET  /api/hotels              - Lấy danh sách khách sạn
POST /api/hotels              - Thêm khách sạn
PUT  /api/hotels/:id          - Cập nhật khách sạn
DELETE /api/hotels/:id        - Xóa khách sạn

GET /api/rooms                - Lấy danh sách phòng
POST /api/rooms               - Thêm phòng
DELETE /api/rooms/:id         - Xóa phòng

GET /api/users                - Lấy danh sách người dùng
DELETE /api/users/:id         - Xóa người dùng

GET /api/reviews              - Lấy danh sách đánh giá
DELETE /api/reviews/:id       - Xóa đánh giá

POST /api/auth/login          - Đăng nhập
```

---

## 🎨 Màu Sắc & Kiểu Dáng

### Màu Chủ Đạo
- **Xanh chủ đạo**: #1e40af
- **Xanh đậm**: #1e3a8a
- **Xanh nhạt**: #3b82f6
- **Tím**: #8b5cf6
- **Xanh lá**: #10b981
- **Đỏ**: #ef4444
- **Cam**: #f59e0b

### Kiểu Dáng
- Rounded corners: 8px
- Shadows: Drop shadows chuyên nghiệp
- Transitions: Smooth 0.3s
- Font: System fonts

---

## 📱 Responsive

- ✅ Desktop: 1920px+
- ✅ Tablet: 768px - 1024px
- ✅ Mobile: < 768px

Sidebar tự động ẩn/hiện trên mobile.

---

## 🔒 Bảo Mật

- 🔐 JWT Token authentication
- 💾 Token lưu trong localStorage
- 🛡️ Kiểm tra token khi vào
- 🔄 Tự động logout nếu token hết hạn
- 🚪 Chuyển hướng nếu chưa đăng nhập

---

## 📦 Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "lucide-react": "^0.263.1",
  "axios": "^1.3.0",
  "sass": "^1.58.0"
}
```

---

## 🚀 Production Build

```bash
npm run build
```

Build output sẽ trong thư mục `build/`

---

## 🎓 Mở Rộng

### Thêm Trang Mới

1. Tạo thư mục: `src/pages/new-page/`
2. Tạo file: `NewPage.jsx` và `NewPage.scss`
3. Thêm route trong `App.js`:
   ```jsx
   <Route path="/new-page" element={<NewPage />} />
   ```
4. Thêm menu item trong `Sidebar.jsx`

### Thêm API Call

```jsx
const res = await fetch('http://localhost:8800/api/endpoint', {
  headers: { authorization: `Bearer ${token}` },
});
const data = await res.json();
```

---

## 🐛 Troubleshooting

| Lỗi | Giải Pháp |
|-----|---------|
| **Module not found** | Chạy `npm install` |
| **CORS error** | Kiểm tra backend CORS config |
| **Cannot read property** | Kiểm tra API response format |
| **Token invalid** | Đăng nhập lại, xóa localStorage |
| **Port 3000 đã sử dụng** | Chạy `npm start` với port khác |

---

## 📞 Hỗ Trợ

- ✅ Tất cả CRUD đã hoàn chỉnh
- ✅ Responsive hoàn toàn
- ✅ Giao diện sang trọng
- ✅ Bảo mật JWT
- ✅ Sẵn sàng deploy

---

**Chúc bạn sử dụng thành công! 🎉**

Tạo bởi: Admin Dashboard System
