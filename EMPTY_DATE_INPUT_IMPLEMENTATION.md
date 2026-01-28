# 📅 Empty Date Input Implementation - Complete

## Problem
Trước đây, ngày check-in và check-out được mặc định là **hôm nay + ngày mai**, bắt buộc người dùng phải xóa và chọn lại. Yêu cầu: Để trống để người dùng **tự chọn từ đầu**.

## Solution Implemented

### 1️⃣ **Header.jsx - Thay đổi Default State**

**Trước:**
```javascript
const [dates, setDates] = useState(() => {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);
  return [{ startDate, endDate, key: "selection" }];
});
```

**Sau:**
```javascript
const [dates, setDates] = useState([]);  // Empty by default
```

### 2️⃣ **Header.jsx - Placeholder Text Khi Không Có Ngày**

**Button hiển thị (Desktop)**:
```javascript
{dates && dates[0] ? (
  <>
    <span className="font-medium">{format(dates[0].startDate, "dd MMM")}</span>
    <span className="text-slate-400">—</span>
    <span className="font-medium">{format(dates[0].endDate, "dd MMM")}</span>
  </>
) : (
  <span className="text-slate-400">Chọn ngày nhận - trả phòng</span>
)}
```

**Input hiển thị (Mobile)**:
```javascript
value={dates && dates[0] ? `${format(...)}` : ""}
placeholder="Chọn ngày"
```

### 3️⃣ **Header.jsx - Validation Khi Tìm Kiếm**

```javascript
const handleSearch = () => {
  // ... existing destination check ...
  
  // Check if dates are selected
  if (!dates || !dates[0] || !dates[0].startDate || !dates[0].endDate) {
    alert("Vui lòng chọn ngày nhận và trả phòng!");
    return;
  }
  
  // ... rest of validation ...
}
```

### 4️⃣ **Header.jsx - Xóa Stale Dates Thay Vì Reset**

Khi ngày cũ được load từ localStorage:

**Trước:**
```javascript
// Reset to today + 1 day
loadedDates = [{ startDate: newStartDate, endDate: newEndDate, key: "selection" }];
```

**Sau:**
```javascript
// Clear dates - user must select new dates
loadedDates = null;
localStorage.removeItem("searchData");
```

**Lý do**: Thay vì tự động reset ngày, chúng ta để trống để người dùng tự chọn ngày hiện tại.

### 5️⃣ **Reserve.jsx - Remove Fallback Dates**

**Trước:**
```javascript
const dates = propDates || contextDates || [{ startDate: new Date(), endDate: new Date() }];
```

**Sau:**
```javascript
const dates = propDates || contextDates || [];  // No fallback
```

## User Flow

### Scenario 1: Lần đầu tiên mở app
```
User mở app
    ↓
Header: dates = [] (trống)
    ↓
Button hiển thị: "Chọn ngày nhận - trả phòng" (placeholder)
    ↓
User click button → DatePicker mở
    ↓
User chọn ngày
    ↓
Button hiển thị: "01 Feb — 02 Feb" (ngày được chọn)
    ↓
User click "Tìm kiếm"
    ↓
Validation pass ✓ → Navigate to results
```

### Scenario 2: Mở lại app hôm sau
```
User mở app trên ngày mới
    ↓
loadSearchData() kiểm tra localStorage
    ↓
Tìm thấy ngày cũ từ hôm trước
    ↓
Check-in date < today? YES
    ↓
Clear dates + localStorage
    ↓
dates = [] (trống)
    ↓
Button hiển thị: "Chọn ngày nhận - trả phòng"
    ↓
User phải chọn ngày mới
```

### Scenario 3: Tìm kiếm mà chưa chọn ngày
```
User click "Tìm kiếm" mà chưa chọn ngày
    ↓
handleSearch() check dates
    ↓
dates.length === 0 → Alert: "Vui lòng chọn ngày nhận và trả phòng!"
    ↓
User phải chọn ngày trước
```

## Files Modified

| File | Changes |
|------|---------|
| `client/src/components/header/Header.jsx` | • Khởi tạo dates = [] (empty)<br>• Thêm placeholder "Chọn ngày"<br>• Validate dates trước tìm kiếm<br>• Clear stale dates thay vì reset |
| `client/src/components/reserve/Reserve.jsx` | • Remove fallback dates |

## Testing Checklist

```
✅ App mở lên, button hiển thị "Chọn ngày nhận - trả phòng"
✅ Click button → DatePicker mở
✅ Chọn ngày → Button cập nhật với ngày chọn
✅ Click "Tìm kiếm" mà chưa chọn ngày → Alert xuất hiện
✅ Chọn ngày rồi click "Tìm kiếm" → Navigate bình thường
✅ Mở app trên ngày mới → dates trống (không hiển thị ngày cũ)
✅ Input mobile cũng hiển thị placeholder "Chọn ngày"
✅ Không có console error
```

## Benefits

✨ **User Experience**:
- Người dùng không phải xóa ngày mặc định
- Rõ ràng rằng phải chọn ngày (có placeholder tường minh)
- Ngày không bị stale sau ngày hôm sau

🔒 **Data Integrity**:
- Không bao giờ hiển thị ngày trong quá khứ
- Người dùng luôn phải chọn ngày hợp lệ
- Tránh confusion từ ngày cũ

⚡ **Performance**:
- Không tự động tạo fallback dates
- Rõ ràng hiều khi nào cần fetch API

## Remarks

- Text "Chọn ngày nhận - trả phòng" có thể tùy chỉnh
- Validation message có thể dịch sang tiếng Anh nếu cần
- Placeholder color là `text-slate-400` (xám nhẹ) để khác biệt với text thực
