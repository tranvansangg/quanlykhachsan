# 🏨 Hướng Dẫn Cài Đặt Admin Dashboard

## 📦 Cấu Trúc Admin

Admin đã được tạo hoàn chỉnh với:

```
admin/
├── src/
│   ├── App.js                 # App chính
│   ├── index.js               # Entry point
│   ├── components/
│   │   ├── Sidebar.jsx        # Menu bên trái
│   │   ├── Navbar.jsx         # Header
│   ├── pages/
│   │   ├── login/Login.jsx    # Trang đăng nhập
│   │   ├── dashboard/         # Dashboard chính
│   │   ├── hotels/            # Quản lý khách sạn (CRUD)
│   │   ├── rooms/             # Quản lý phòng (CRUD)
│   │   ├── users/             # Quản lý người dùng
│   │   ├── reviews/           # Quản lý đánh giá
│   ├── styles/                # Global styles
│   └── context/               # Context API (sẵn sàng)
├── public/
│   └── index.html
├── package.json
└── README.md
```

## 🚀 Bước 1: Cài Đặt Dependencies

```bash
cd admin
npm install
```

## 🔑 Bước 2: Cấu Hình API URL

Hiện tại admin sử dụng:
```
http://localhost:8800/api
```

Nếu cần thay đổi, hãy tìm kiếm các fetch trong các trang và cập nhật URL.

## 🏃 Bước 3: Chạy Admin

```bash
npm start
```

Admin sẽ mở tại: `http://localhost:3000`

## 🔐 Đăng Nhập

**Tài khoản demo:**
- Username: `admin`
- Password: `password123`

## ✨ Các Tính Năng

### 📊 Dashboard
- Hiển thị thống kê: Khách sạn, Phòng, Người dùng, Đánh giá
- Bảng dữ liệu khách sạn gần đây
- Thống kê nhanh

### 🏨 Quản Lý Khách Sạn
- ✅ **Xem** - Danh sách tất cả khách sạn
- ✅ **Thêm** - Tạo khách sạn mới
- ✅ **Sửa** - Cập nhật thông tin khách sạn
- ✅ **Xóa** - Xóa khách sạn
- 🔍 Tìm kiếm theo tên/thành phố
- 📊 Sắp xếp theo tên, thành phố, giá

**Thông tin khách sạn:**
- Tên, loại, thành phố
- Giá rẻ nhất, đánh giá
- Mô tả chi tiết
- Tải lên ảnh

### 🚪 Quản Lý Phòng
- ✅ **Xem** - Danh sách phòng
- ✅ **Thêm** - Tạo phòng mới
- ✅ **Xóa** - Xóa phòng
- 🔍 Tìm kiếm theo tên phòng

### 👥 Quản Lý Người Dùng
- 📋 Danh sách tất cả người dùng
- 🔍 Tìm kiếm theo tên/email
- 🗑️ Xóa tài khoản người dùng

### ⭐ Quản Lý Đánh Giá
- 📝 Xem tất cả đánh giá
- ⭐ Hiển thị số sao
- 🔍 Tìm kiếm đánh giá
- 🗑️ Xóa đánh giá

## 🎨 Giao Diện

### Thiết Kế
- **Màu chủ đạo:** Xanh dương (#1e40af)
- **Phong cách:** Modern, sang trọng, chuyên nghiệp
- **Responsive:** Hoàn toàn tương thích mobile/tablet

### Thành Phần UI
- Sidebar điều hướng
- Header/Navbar
- Cards, Tables, Modals
- Forms với validation
- Loading & Empty states

## 📱 Responsive Design

Admin hoạt động hoàn hảo trên:
- 💻 Desktop (1920px+)
- 📱 Tablet (768px - 1024px)
- 📱 Mobile (< 768px)

## 🔒 Bảo Mật

- 🔐 JWT Token authentication
- 🛡️ Token lưu trong localStorage
- 🔄 Tự động kiểm tra token khi vào
- 🚪 Tự động chuyển hướng nếu chưa đăng nhập

## 📝 Mở Rộng

### Thêm Trang Mới

1. Tạo thư mục trong `src/pages/`
2. Tạo file `.jsx` và `.scss`
3. Thêm route trong `App.js`
4. Thêm menu item trong `Sidebar.jsx`

### Thêm Chức Năng

- Tất cả API calls trong các trang
- Context API sẵn sàng trong `src/context/`
- Custom hooks trong `src/hooks/`

## 🚨 Lưu Ý

1. Đảm bảo backend chạy trên port 8800
2. Đảm bảo bạn đã đăng nhập vào tài khoản admin
3. CORS phải được cấu hình đúng trên backend
4. Token phải được gửi trong header: `Authorization: Bearer TOKEN`

## 🐛 Troubleshooting

**Không thể đăng nhập:**
- Kiểm tra backend có chạy không
- Kiểm tra tài khoản demo đã tạo chưa

**Lỗi CORS:**
- Kiểm tra backend đã cho phép origin này

**Không thể tải dữ liệu:**
- Kiểm tra token có hợp lệ không
- Kiểm tra API endpoints

## 📚 Tài Liệu Thêm

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Lucide React Icons](https://lucide.dev)

---

**Created with ❤️ for Hotel Booking System**
