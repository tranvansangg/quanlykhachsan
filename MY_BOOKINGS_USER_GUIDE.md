# 🏨 Hướng Dẫn Sử Dụng Chức Năng "Lịch Sử Đặt Phòng"

## 👋 Giới Thiệu
Chức năng "Lịch Sử Đặt Phòng" cho phép bạn:
- 📋 Xem tất cả các booking của mình
- 🔍 Tìm kiếm và lọc booking theo trạng thái
- 📊 Xem chi tiết booking
- 💰 Kiểm tra giá tiền và ngày ở

## 🚀 Cách Truy Cập

### Cách 1: Qua Dropdown Menu
```
1. Click vào ảnh đại diện user (góc phải navbar)
2. Chọn "Lịch sử đặt phòng"
3. Hoặc trực tiếp truy cập URL: /my-bookings
```

### Cách 2: Direct URL
```
Nhập vào address bar: 
http://yourdomain.com/my-bookings
```

## 📝 Hướng Dẫn Từng Bước

### Bước 1: Đăng Nhập
```
⚠️ LƯU Ý: Bạn PHẢI đăng nhập để xem booking
- Click nút "Đăng Nhập"
- Nhập email/username và password
- Click "Đăng Nhập"
```

### Bước 2: Truy Cập Trang
```
1. Click vào avatar user (góc phải navbar)
2. Chọn "Lịch sử đặt phòng" từ dropdown menu
3. Trang load và hiển thị tất cả booking của bạn
```

### Bước 3: Lọc Booking
```
Các nút lọc ở phía trên:
┌─────────────┬────────────┬──────────┬────────┐
│ Tất Cả (5)  │Đã Thanh(3) │ Hoàn(2) │Đã Hủy(0)│
└─────────────┴────────────┴──────────┴────────┘

- Click nút để lọc
- Hiển thị count booking trong mỗi category
```

### Bước 4: Xem Chi Tiết Booking
```
1. Click nút "Xem Chi Tiết" trên booking card
2. Modal hiển thị toàn bộ thông tin:
   - Tên khách sạn + địa chỉ
   - Mã đơn
   - Thông tin phòng (loại, số lượng, giá)
   - Ngày nhận/trả phòng
   - Thông tin khách hàng
   - Tổng tiền
3. Click "Đóng" hoặc click ngoài modal để đóng
```

## 📊 Các Thông Tin Hiển Thị

### Trên Booking Card
```
┌──────────────────────────────┐
│ 🏨 Tên Khách Sạn  [Trạng Thái]│
├──────────────────────────────┤
│ 🛏️ Loại Phòng: Double Room    │
│ 📅 Nhận Phòng: 01/01/2024    │
│ 📅 Trả Phòng: 03/01/2024     │
│ ⏰ Số Đêm: 2 đêm              │
│ 💰 Tổng Tiền: 10,000,000 VND │
│ Mã Đơn: ABC12345             │
├──────────────────────────────┤
│ [Xem Chi Tiết] Đặt 15/12/2023│
└──────────────────────────────┘
```

### Các Trạng Thái Booking
```
✅ Đã Thanh Toán  → Đơn đã được xác nhận
✅ Đã Hoàn Thành  → Bạn đã check out
❌ Đã Hủy         → Đơn đã bị hủy
⏱️  Chờ Xử Lý     → Đang chờ xác nhận
```

## 💡 Mẹo & Thủ Thuật

### 💡 Mẹo 1: Lọc Nhanh
```
- Click "Tất Cả" để xem hết
- Click "Đã Thanh Toán" để xem booking sắp tới
- Click "Đã Hủy" để xem các booking không thành công
```

### 💡 Mẹo 2: Xem Mã Đơn
```
- Mã đơn hiển thị trên card (dạng "ABC12345")
- Hoặc xem mã đầy đủ trong modal chi tiết
- Dùng mã này khi liên hệ hỗ trợ
```

### 💡 Mẹo 3: Kiểm Tra Giá
```
- Card hiển thị tổng tiền
- Modal hiển thị chi tiết:
  * Giá phòng/đêm
  * Số đêm ở
  * Tính toán tự động
```

### 💡 Mẹo 4: In Booking
```
- Click "Xem Chi Tiết" để mở modal
- Dùng Ctrl+P hoặc Cmd+P để in
- Lưu làm PDF để giữ hồ sơ
```

## ❓ Câu Hỏi Thường Gặp

### Q: Tại sao không thấy booking?
```
A: Kiểm tra:
   1. Bạn đã đăng nhập chưa?
   2. Bạn đã đặt phòng chưa?
   3. Thử F5 để refresh trang
   4. Thử clear cache (Ctrl+Shift+Delete)
```

### Q: Có thể hủy booking không?
```
A: Hiện tại không thể hủy trực tiếp từ web.
   Liên hệ hỗ trợ khách hàng:
   - Email: support@hotelbook.com
   - Hotline: 1900-xxx-xxx
   - Chat: click icon chat ở góc
```

### Q: Sao giá không đúng?
```
A: Giá được tính toán:
   = (Giá phòng/đêm) × (Số lượng phòng) × (Số đêm)
   
   Ví dụ: 500k/đêm × 2 phòng × 3 đêm = 3 triệu
```

### Q: Booking đã trả phòng vẫn hiển thị?
```
A: Có, lịch sử booking được lưu vĩnh viễn để:
   - Tham khảo khi đặt phòng tiếp
   - Tra cứu thông tin cũ
   - Yêu cầu hoàn tiền
   
   Bạn có thể lọc chỉ xem "Đã Hoàn Thành"
```

### Q: Tại sao không xem được chi tiết?
```
A: Modal chi tiết có thể không load nếu:
   1. JavaScript bị tắt
   2. Kết nối internet yếu
   3. Trình duyệt không hỗ trợ
   
   Thử:
   - F5 refresh
   - Dùng trình duyệt khác (Chrome, Firefox)
   - Kiểm tra mạng internet
```

## 🎯 Trường Hợp Sử Dụng

### Trường Hợp 1: Kiểm Tra Booking Sắp Tới
```
Bước 1: Vào "Lịch sử đặt phòng"
Bước 2: Click "Đã Thanh Toán" để xem booking chưa tới
Bước 3: Xem "Nhận Phòng" để biết ngày check-in
Bước 4: Chuẩn bị tài liệu cần thiết
```

### Trường Hợp 2: Tra Cứu Booking Cũ
```
Bước 1: Vào "Lịch sử đặt phòng"
Bước 2: Cuộn xuống xem lịch sử
Bước 3: Click "Xem Chi Tiết" của booking cũ
Bước 4: Lấy mã đơn, giá tiền nếu cần
```

### Trường Hợp 3: Yêu Cầu Hỗ Trợ
```
Bước 1: Vào "Lịch sử đặt phòng"
Bước 2: Tìm booking liên quan
Bước 3: Click "Xem Chi Tiết"
Bước 4: Copy mã đơn và thông tin
Bước 5: Liên hệ hỗ trợ với mã đơn
```

### Trường Hợp 4: Kiểm Tra Lịch Sử Giá
```
Bước 1: Vào "Lịch sử đặt phòng"
Bước 2: Xem các booking cũ
Bước 3: So sánh giá với booking hiện tại
Bước 4: Kiểm tra mức giá khách sạn
```

## 🖥️ Hỗ Trợ Trình Duyệt

### Trình Duyệt Được Hỗ Trợ
```
✅ Google Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile Chrome
✅ Mobile Safari
```

### Nếu Gặp Vấn Đề
```
1. Update trình duyệt lên phiên bản mới nhất
2. Xóa cache/cookies
3. Disable extensions
4. Thử Private/Incognito mode
5. Liên hệ hỗ trợ nếu vẫn lỗi
```

## 📱 Trên Thiết Bị Di Động

### Responsive Design
```
- Hiển thị tốt trên điện thoại
- Một booking = một card (không 2 column)
- Touch-friendly buttons
- Fullscreen modal chi tiết
```

### Mẹo Mobile
```
1. Landscape mode xem tốt hơn
2. Sử dụng tab Share để gửi booking cho người khác
3. Screenshot chi tiết để lưu trữ
4. Dùng zoom (pinch) nếu text nhỏ
```

## 🔒 Bảo Mật

### Thông Tin An Toàn
```
✅ Token được lưu an toàn
✅ Chỉ xem được booking của chính mình
✅ Mã đơn không truyền qua URL
✅ Connection mã hóa HTTPS
```

### Đừng
```
❌ Chia sẻ token/session
❌ Cho người khác xem browser history
❌ Login trên máy tính công cộng không logout
❌ Tiết lộ mã đơn cho người lạ
```

## 📞 Liên Hệ Hỗ Trợ

Nếu gặp vấn đề:
```
📧 Email: support@hotelbook.com
📞 Hotline: 1900-xxx-xxx
💬 Live Chat: Mở chat từ góc trang
🐦 Twitter: @hotelbook_vn
📱 WhatsApp: +84-9xx-xxx-xxx
```

Khi liên hệ, cung cấp:
```
- Mã đơn booking
- Tên khách sạn
- Ngày check-in/out
- Vấn đề gặp phải
- Screenshot nếu có
```

---

**💡 Mẹo Cuối Cùng**
Lưu bookmark để truy cập nhanh:
- Nhấn Ctrl+D (hoặc Cmd+D trên Mac)
- Đặt tên: "Booking Của Tôi"
- Lúc sau chỉ cần click bookmark

**Enjoy your bookings! 🎉**
