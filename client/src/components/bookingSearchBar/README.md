# BookingSearchBar - Thanh Tìm Kiếm Kiểu Booking.com

## 📋 Tổng Quan
BookingSearchBar là component thanh tìm kiếm hiệu suất cao kiểu Booking.com với:

### Compact View (mặc định)
- Hiển thị: "T3, 27 tháng 1 — T7, 31 tháng 1"
- Khách: "2 khách • 1 phòng"
- Button "Thay đổi tìm kiếm"
- Sticky ở trên cùng

### Expanded View (khi click)
- Date range picker cho check-in/check-out
- Guests dropdown với:
  - Người lớn (13+ tuổi)
  - Trẻ em (dưới 13 tuổi)
  - Số phòng
- Nút +/- để tăng/giảm
- Buttons: Hủy, Tìm kiếm

## 📂 File
```
client/src/components/bookingSearchBar/
├── BookingSearchBar.jsx       (Component)
└── bookingSearchBar.css       (Styling)
```

## 🚀 Cách Sử Dụng

### Import
```jsx
import BookingSearchBar from "../../components/bookingSearchBar/BookingSearchBar";
```

### Sử dụng
```jsx
<BookingSearchBar onSearch={handleSearch} />
```

### Props
```jsx
{
  onSearch: Function (optional) - Callback khi tìm kiếm
}
```

## 📊 Luồng Dữ Liệu

```
1. Component mount → Đọc từ SearchContext
   - dates: [{ startDate, endDate }]
   - options: { adult, children, room }

2. User click "Thay đổi tìm kiếm" → Expanded view mở

3. User chọn:
   - Ngày check-in (date picker)
   - Ngày check-out (date picker)
   - Số người lớn, trẻ em, phòng

4. Click "Tìm kiếm"
   - Validate dữ liệu
   - dispatch({ type: "NEW_SEARCH", payload: {...} })
   - SearchContext cập nhật
   - Close expanded view
   - Gọi onSearch callback

5. Compact view cập nhật hiển thị
```

## ✨ Features

### 1. Date Range Picker
- Input type="date" HTML5
- Format display: "T3, 27 tháng 1 — T7, 31 tháng 1"
- Validate: checkout > checkin
- Min date: hôm nay
- Tự động set checkout = checkin + 1 ngày

### 2. Guests Selector
- Người lớn: min 1, max 10
- Trẻ em: min 0, max 10
- Phòng: min 1, max 10
- Dropdown với +/- buttons
- Input thay đổi trực tiếp

### 3. Validation
```
✓ Check-in không bỏ trống
✓ Check-out không bỏ trống
✓ Checkout > Checkin
✓ Người lớn ≥ 1
```

### 4. Styling
- Kiểu Booking.com
- Gradient purple (#667eea)
- Rounded corners (8px-12px)
- Animations: fadeIn, slideUp, slideDown
- Modal overlay (khi expanded)
- Responsive: desktop, tablet, mobile

## 🎨 UI Components

### Compact View
```
┌─────────────────────────────────────────────┐
│ 📅 T3, 27 tháng 1 — T7, 31 tháng 1 │ 👥 2 khách • 1 phòng │ [Thay đổi tìm kiếm] │
└─────────────────────────────────────────────┘
```

### Expanded View
```
Modal overlay với:
┌──────────────────────────────────────┐
│ 📅 Nhận phòng                        │
│ [2025-01-27] Thu, 27 tháng 1        │
├──────────────────────────────────────┤
│ 📅 Trả phòng                        │
│ [2025-01-31] Thứ Bảy, 31 tháng 1  │
├──────────────────────────────────────┤
│ 👥 Khách                            │
│ ▼ 1 người lớn • 0 trẻ em • 1 phòng  │
│  Người lớn: −  1  +                 │
│  Trẻ em:    −  0  +                 │
│  Phòng:     −  1  +                 │
├──────────────────────────────────────┤
│ [Hủy]  [Tìm kiếm]                  │
└──────────────────────────────────────┘
```

## 📝 Ví Dụ

### Sử dụng cơ bản
```jsx
function Hotel() {
  return (
    <div>
      <BookingSearchBar />
      {/* Nội dung khác */}
    </div>
  );
}
```

### Với callback
```jsx
function Hotel() {
  const handleSearch = () => {
    // Reload danh sách phòng
    console.log("Search triggered!");
  };

  return <BookingSearchBar onSearch={handleSearch} />;
}
```

### Dữ liệu từ Context
```jsx
// SearchContext state
{
  dates: [
    {
      startDate: new Date("2025-01-27"),
      endDate: new Date("2025-01-31")
    }
  ],
  options: {
    adult: 1,
    children: 0,
    room: 1
  }
}
```

## 🔄 Context Update

Khi click "Tìm kiếm", component dispatch:
```javascript
{
  type: "NEW_SEARCH",
  payload: {
    city: undefined,
    dates: [
      {
        startDate: Date,
        endDate: Date
      }
    ],
    options: {
      adult: number,
      children: number,
      room: number
    }
  }
}
```

## 📱 Responsive

**Desktop (> 768px)**
- Compact view ngang 1 dòng
- Modal expanded center

**Tablet (480px - 768px)**
- Compact view flex column
- Modal 95% width

**Mobile (< 480px)**
- Compact view stack dọc
- Ẩn text button
- Guests dropdown static

## 🐛 Debug

```javascript
// Thêm log để debug
const handleSearch = () => {
  console.log("Start date:", startDate);
  console.log("End date:", endDate);
  console.log("Adults:", adults);
  console.log("Children:", children);
  console.log("Rooms:", rooms);
};
```

## 🎯 Key Points

✅ **Compact view** hiển thị sẵn dữ liệu từ context
✅ **Click button** mở expanded view
✅ **Date picker** HTML5 native
✅ **Guests dropdown** +/- buttons
✅ **Validation** check trước khi submit
✅ **Context update** dispatch NEW_SEARCH
✅ **Callback** onSearch trigger nếu có
✅ **Sticky** header dính ở trên
✅ **Modal overlay** khi expanded
✅ **Responsive** tất cả devices
✅ **Animations** smooth fade/slide
✅ **Styling** kiểu Booking.com

## 🔧 Customization

Thay đổi màu:
```css
--primary-color: #667eea;  /* Thay trong CSS */
```

Thay đổi format date:
```javascript
// BookingSearchBar.jsx line ~100
const formatDateForDisplay = (dateStr) => {
  // Modify format tại đây
};
```

Thay đổi sticky position:
```css
/* bookingSearchBar.css line ~8 */
position: sticky;
top: 0;  /* Thay bằng giá trị khác */
```

## 📚 Summary

✅ Component đầy đủ Booking.com style
✅ Compact + Expanded views
✅ Date range + Guests selector
✅ Validation + Context update
✅ Responsive + Animations
✅ Sẵn sàng sử dụng!
