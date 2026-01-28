# SearchBar Component - Thanh Tìm Kiếm Khách Sạn

## 📋 Tổng Quan
Component SearchBar cung cấp giao diện tìm kiếm khách sạn đầy đủ với:
- ✅ Input chọn ngày check-in và check-out
- ✅ Input số lượng khách (người lớn + trẻ em)
- ✅ Validation dữ liệu đầu vào
- ✅ Cập nhật SearchContext
- ✅ Hiển thị dữ liệu đã chọn sẵn từ context
- ✅ Responsive design (mobile, tablet, desktop)

## 📂 File Tạo Mới
```
client/src/components/searchBar/
├── SearchBar.jsx       (Component chính)
└── searchBar.css       (Style)
```

## 🚀 Cách Sử Dụng

### 1. Import Component
```jsx
import SearchBar from "../../components/searchBar/SearchBar";
```

### 2. Thêm vào Component
```jsx
function YourComponent() {
  return (
    <div>
      <SearchBar />
      {/* Nội dung khác */}
    </div>
  );
}
```

### 3. Đã thêm vào Reserve.jsx
Thanh tìm kiếm được thêm vào đầu component Reserve để người dùng có thể thay đổi ngày và số khách bất cứ lúc nào.

## 📊 Dữ Liệu Context

SearchBar tương tác với SearchContext:

```javascript
// Đọc từ context
const { dates, options, dispatch } = useContext(SearchContext);

// dates: Array<{ startDate: Date, endDate: Date }>
// options: { adult: number, children: number, room: number }

// Cập nhật context
dispatch({
  type: "NEW_SEARCH",
  payload: {
    city: undefined,
    dates: [{ startDate: Date, endDate: Date }],
    options: { adult: number, children: number, room: number }
  }
});
```

## ✨ Features

### 1. **Chọn Ngày**
- Input type="date" HTML5
- Validate: check-out > check-in
- Hiển thị ngày định dạng vi-VN
- Ngày check-out minimum = ngày check-in

### 2. **Chọn Số Khách**
- Input: Người lớn (adult) - mặc định 1
- Input: Trẻ em (children) - mặc định 0
- Hiển thị tổng số khách
- Min: 0, Max: 10 mỗi loại

### 3. **Validation**
```
✓ Check-in không được bỏ trống
✓ Check-out không được bỏ trống
✓ Check-out > Check-in
✓ Tổng khách > 0
```

### 4. **Styling**
- Gradient background (purple)
- Sticky position (dính ở trên khi scroll)
- Responsive: desktop, tablet, mobile
- Icons từ FontAwesome

## 🎨 Responsive Design

**Desktop (> 1024px)**
- Hiển thị tất cả trên 1 dòng
- Full width input

**Tablet (768px - 1024px)**
- Input nhỏ hơn
- Wrap khi cần

**Mobile (< 768px)**
- Flex direction column
- Full width items
- Ẩn text nút search
- Compact design

**Very Small (< 480px)**
- Stack dọc
- Full width
- Đơn giản hóa UI

## 📝 Ví Dụ Sử Dụng

### Tìm kiếm đơn giản
```jsx
import SearchBar from "../searchBar/SearchBar";

function HotelList() {
  return (
    <>
      <SearchBar />
      {/* Hiển thị danh sách khách sạn */}
    </>
  );
}
```

### Với cập nhật danh sách tự động
```jsx
function HotelList() {
  const { dates, options } = useContext(SearchContext);
  const { data } = useFetch(`/hotels/search?...`);
  
  return (
    <>
      <SearchBar />
      {/* data sẽ update khi SearchContext thay đổi */}
    </>
  );
}
```

## 🔄 Luồng Dữ Liệu

```
1. User nhập ngày check-in, check-out, số khách
   ↓
2. Click "Tìm kiếm"
   ↓
3. Validate dữ liệu
   ↓
4. dispatch({ type: "NEW_SEARCH", payload: {...} })
   ↓
5. SearchContext cập nhật
   ↓
6. navigate("/hotels") → chuyển trang
   ↓
7. Component tìm kiếm hiển thị dữ liệu mới
```

## 🐛 Debug

Kiểm tra console:
```javascript
// Nếu không thấy cập nhật, kiểm tra:
1. SearchContextProvider có wrap component không?
2. dispatch có được gọi không? (thêm console.log)
3. Dữ liệu payload đúng format không?
```

## 📱 Tất Cả Props

SearchBar không có props bắt buộc:
```jsx
<SearchBar hideLocation={false} /> // hideLocation: boolean (optional)
```

Hiện tại hideLocation chưa implement, có thể dùng sau.

## 🎯 Summary

✅ Tạo 2 file:
- SearchBar.jsx (Component + Logic)
- searchBar.css (Styling responsive)

✅ Thêm vào Reserve.jsx

✅ Tính năng:
- Chọn ngày check-in/check-out
- Chọn số khách
- Validation
- Cập nhật context
- Hiển thị dữ liệu sẵn
- Responsive

✅ Sẵn sàng sử dụng!
