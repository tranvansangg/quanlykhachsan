# ⚡ Quick Start - Test Cancel Booking Feature

## 🎬 How to Test

### Prerequisites
```bash
# Terminal 1: API Server
cd api
npm start
# Should be running on http://localhost:8800

# Terminal 2: Client
cd client
npm run dev
# Should be running on http://localhost:5173

# Terminal 3: Admin (optional)
cd admin
npm start
# Should be running on http://localhost:3000
```

---

## 🧪 Test Scenario

### Step 1: Create a Booking (as User)
1. Go to http://localhost:5173
2. Login or create account
3. Search for hotels
4. Make a booking
5. Pay and confirm

### Step 2: View My Bookings
1. Click "Lịch Sử Đặt Phòng" in navbar
2. See your booking in the list
3. Status should be "Đã Thanh Toán"

### Step 3: Cancel Booking
1. Click "Xem Chi Tiết" button on booking card
2. Detail modal opens
3. Scroll down in modal
4. Click "Hủy Đặt Phòng" button (red button, left side)
5. Cancel confirmation modal appears:
   ```
   ⚠️ Xác Nhận Hủy Đặt Phòng
   - Shows booking code
   - Shows hotel name
   - Shows refund amount (same as booking total)
   ```

### Step 4: Confirm Cancellation
1. Click "Xác Nhận Hủy" button (red, right side)
2. Wait for processing (button shows "Đang xử lý...")
3. Success alert appears:
   ```
   Hủy phòng thành công!
   Số tiền hoàn lại: 5,000,000 VND
   Tiền sẽ được hoàn lại trong 3-5 ngày làm việc
   ```
4. Modal closes
5. Booking list refreshes
6. Booking status changes to "Đã Hủy"

### Step 5: Verify Cancel Button Disappears
1. Click "Xem Chi Tiết" again on same booking
2. "Hủy Đặt Phòng" button is gone (only shows for confirmed)
3. Status shows "Đã Hủy"

---

## 🔍 Check Backend Changes

### Test API Endpoint Directly
```bash
# 1. Get booking ID first
curl http://localhost:8800/api/bookings/user/{userId} \
  -H "Authorization: Bearer {your_token}"

# Copy the booking ID where status = "confirmed"

# 2. Cancel the booking
curl -X PUT http://localhost:8800/api/bookings/{bookingId}/cancel \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json" \
  -d '{}'

# Should return:
{
  "success": true,
  "message": "Hủy đặt phòng thành công...",
  "data": {
    "bookingId": "...",
    "refundAmount": 5000000,
    "refundStatus": "refunded",
    "cancelDate": "2025-01-15T10:30:00.000Z"
  }
}

# 3. Verify booking updated
curl http://localhost:8800/api/bookings/{bookingId} \
  -H "Authorization: Bearer {your_token}"

# Should show:
{
  "status": "cancelled",
  "paymentStatus": "refunded",
  "cancelDate": "2025-01-15T10:30:00.000Z"
}
```

---

## 📊 Admin Panel Test

### View Cancelled Bookings (Admin)
1. Go to http://localhost:3000
2. Login as admin
3. Go to "Quản Lý Đơn Đặt Phòng"
4. Check header stats: "Đã hủy: X" should increase
5. Select filter "Đã hủy" from dropdown
6. See only cancelled bookings
7. Click "👁️" icon to view details
8. Scroll down to see:
   ```
   🔄 Thông Tin Hoàn Tiền
   
   Trạng Thái Hoàn Tiền: ✓ Đã Hoàn
   Số Tiền Hoàn: 5,000,000 VND
   Ngày Hủy: 15/01/2025
   ```

---

## ✅ Expected Results

### Client Side
- [x] Booking list shows all bookings
- [x] Detail modal has "Hủy Đặt Phòng" button (confirmed only)
- [x] Cancel modal shows refund info
- [x] Cancel works without errors
- [x] Status changes to "Đã Hủy"
- [x] Button disappears after cancel

### Backend
- [x] Booking status updated to "cancelled"
- [x] paymentStatus updated to "refunded"
- [x] cancelDate set to current date
- [x] Room dates freed up (unavailableDates removed)
- [x] Room can be re-booked immediately

### Admin Panel
- [x] Cancelled count in stats
- [x] Can filter by cancelled status
- [x] Refund info section shows
- [x] Dates show correctly

---

## 🐛 Troubleshooting

### Button doesn't appear
- Check booking status is "confirmed"
- Check token is valid
- Check browser console for errors

### Cancel fails with error
- Check backend is running
- Check token is in Authorization header
- Check booking ID is valid
- Check booking status is "confirmed" (not already cancelled)

### Modal doesn't show
- Check bookingId is in URL
- Check selectedBooking state is set
- Check CSS is loading correctly

### Room dates not freed
- Check backend console for errors
- Check MongoDB document is updated
- Try booking same dates again

### Admin page empty
- Check token has admin privileges
- Check API returns bookings data
- Check MongoDB has booking documents

---

## 🔧 Code Locations

### Frontend
- **Component:** `client/src/pages/myBookings/MyBookings.jsx`
- **Styles:** `client/src/pages/myBookings/myBookings.css`
- **API URL:** `http://localhost:8800/api/bookings/{id}/cancel`

### Backend
- **Controller:** `api/controllers/booking.js` (lines 147-212)
- **Routes:** `api/routes/bookings.js` (lines 34-35)
- **Model:** `api/models/Booking.js` (lines 50-62)

### Admin
- **Component:** `admin/src/pages/bookings/Bookings.jsx`
- **Styles:** `admin/src/pages/bookings/bookings.scss`

---

## 📝 Test Log

Date: ___________
Tester: _________

| Test Case | Status | Notes |
|-----------|--------|-------|
| Create booking | [ ] Pass [ ] Fail | _____ |
| View My Bookings | [ ] Pass [ ] Fail | _____ |
| Show cancel button | [ ] Pass [ ] Fail | _____ |
| Open cancel modal | [ ] Pass [ ] Fail | _____ |
| API call succeeds | [ ] Pass [ ] Fail | _____ |
| Status updates | [ ] Pass [ ] Fail | _____ |
| List refreshes | [ ] Pass [ ] Fail | _____ |
| Admin sees cancelled | [ ] Pass [ ] Fail | _____ |
| Rooms freed up | [ ] Pass [ ] Fail | _____ |

---

## 💡 Tips

1. **Multiple bookings:** Create 2-3 bookings to test different scenarios
2. **Check dates:** Verify room dates are freed by trying to re-book
3. **Admin view:** Always check admin panel to verify data consistency
4. **Browser dev tools:** Use Network tab to inspect API calls
5. **MongoDB:** Use MongoDB Compass to verify collections updated

