# 🧪 Quick Test Guide - My Bookings Feature

## ✅ Pre-Test Checklist

### 1. Verify Files Created/Updated
```bash
# Frontend files
✓ client/src/pages/myBookings/MyBookings.jsx
✓ client/src/pages/myBookings/myBookings.css
✓ client/src/App.js (updated with route)
✓ client/src/components/navbar/Navbar.jsx (updated with link)
```

### 2. Verify Backend Ready
```bash
# API endpoints (should exist)
✓ GET /api/bookings/user/:userId (line ~95 in booking.js)
✓ POST /api/bookings (create booking)
✓ Hotel model with Booking reference
```

---

## 🚀 Test Scenarios

### Scenario 1: User Not Logged In
```
1. Go to: http://localhost:3000/my-bookings
2. Expected:
   ✓ Login prompt shows
   ✓ Message: "Vui lòng đăng nhập"
   ✓ No API call made
```

### Scenario 2: User Logged In, No Bookings
```
1. Login with any account
2. Go to: /my-bookings
3. Expected:
   ✓ Page loads
   ✓ Loading spinner visible briefly
   ✓ Empty state shows: "Chưa có booking nào"
   ✓ Filter buttons show (0) count
```

### Scenario 3: View Bookings (After Payment)
```
1. Login
2. Make a booking via payment
3. Go to: /my-bookings
4. Expected:
   ✓ Booking card appears
   ✓ Shows hotel name
   ✓ Shows room type
   ✓ Shows dates (check-in/out)
   ✓ Shows total amount (VND format)
   ✓ Shows status badge
   ✓ Count updates in filter buttons
```

### Scenario 4: Filter Bookings
```
1. Click "Đã Thanh Toán" button
2. Expected:
   ✓ Only confirmed bookings show
   ✓ Button highlighted
   ✓ Count displays correctly

3. Click "Tất Cả" button
4. Expected:
   ✓ All bookings show again
   ✓ Button highlighted
   ✓ All counts accurate
```

### Scenario 5: View Booking Details
```
1. Click "Xem Chi Tiết" on a card
2. Expected:
   ✓ Modal opens with smooth animation
   ✓ All sections visible:
     - Thông Tin Khách Sạn
     - Thông Tin Đặt Phòng
     - Phòng Đã Đặt
     - Thời Gian Ở
     - Thông Tin Khách Hàng
     - Tổng Cộng
   ✓ Hotel name populated correctly
   ✓ Room details show price/night/quantity
   ✓ Total calculation correct

3. Click "Đóng"
4. Expected:
   ✓ Modal closes smoothly
   ✓ Back to booking list
```

### Scenario 6: Close Modal by Clicking Outside
```
1. Open detail modal
2. Click on overlay (dark area outside modal)
3. Expected:
   ✓ Modal closes
   ✓ No errors in console
```

### Scenario 7: Responsive Design - Desktop
```
1. View on 1200px+ screen
2. Expected:
   ✓ 2-column grid layout
   ✓ Cards properly spaced
   ✓ Modal centered
   ✓ All text readable
```

### Scenario 8: Responsive Design - Tablet
```
1. View on 768-1200px screen
2. Expected:
   ✓ 1-column grid layout
   ✓ Full-width cards
   ✓ Touch-friendly buttons
   ✓ Modal fullscreen
```

### Scenario 9: Responsive Design - Mobile
```
1. View on <768px screen (or use DevTools mobile mode)
2. Expected:
   ✓ 1-column layout
   ✓ Stacked cards
   ✓ Large buttons
   ✓ Readable text
   ✓ Modal fullscreen
   ✓ No horizontal scroll
```

### Scenario 10: Navigation from Navbar
```
1. Login
2. Click avatar (top-right)
3. Click "Lịch sử đặt phòng"
4. Expected:
   ✓ Navigate to /my-bookings
   ✓ Dropdown closes
   ✓ Bookings load
```

---

## 🔍 What to Check

### Visual Elements
- [ ] Header displays correctly
- [ ] Filter buttons visible and clickable
- [ ] Booking cards render properly
- [ ] Status badges show correct colors
- [ ] Icons display (FontAwesome)
- [ ] Modal layout clean and readable
- [ ] Loading spinner smooth
- [ ] Empty state displays nicely

### Functionality
- [ ] Filter buttons actually filter
- [ ] Modal opens on click
- [ ] Modal closes on button/outside click
- [ ] Dates format correctly
- [ ] Money formats as VND
- [ ] Counts update correctly
- [ ] No JavaScript errors
- [ ] Navigation works

### Data
- [ ] Hotel name loads (populated)
- [ ] Room types display
- [ ] Quantities show
- [ ] Dates correct
- [ ] Total amount correct
- [ ] All booking info present
- [ ] Subtotal calculation correct

### Responsiveness
- [ ] Desktop: 2 columns
- [ ] Tablet: 1 column
- [ ] Mobile: Full width, stacked
- [ ] No horizontal scroll
- [ ] Text readable on all sizes
- [ ] Buttons clickable on mobile

---

## 🐛 Common Issues & Solutions

### Issue: 404 Error on API Call
```
Problem: API returns 404
Solution:
1. Check token is valid
2. Check userId is correct
3. Verify endpoint exists:
   GET /api/bookings/user/:userId
4. Check backend running on :8800
5. Restart backend if needed
```

### Issue: No Bookings Showing
```
Problem: Page loads but shows empty
Solution:
1. Check if user has bookings (check DB)
2. Verify userId is correct
3. Check hotelId is populated
4. Look at Network tab in DevTools
5. Check browser console for errors
```

### Issue: Modal Not Opening
```
Problem: Click detail button, nothing happens
Solution:
1. Check console for JavaScript errors
2. Verify CSS imports working
3. Check modal CSS not hidden
4. Look at onClick handlers
5. Try hard refresh (Ctrl+F5)
```

### Issue: Styling Broken
```
Problem: Page looks ugly or misaligned
Solution:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+Delete)
3. Check myBookings.css imported
4. Verify FontAwesome loaded
5. Check viewport meta tag in index.html
```

### Issue: Login Redirect Loop
```
Problem: Stuck on login page
Solution:
1. Check token saved in localStorage
2. Verify JWT still valid
3. Clear cookies if needed
4. Try different browser
5. Check AuthContext working
```

---

## 📊 Expected Results

### Success Criteria
- [x] Component loads without errors
- [x] Displays bookings correctly
- [x] Filter works
- [x] Modal displays details
- [x] Responsive on all devices
- [x] No console errors
- [x] All data populates
- [x] Date formatting correct
- [x] Money formatting correct
- [x] Navigation works

### Performance Targets
- API response: < 500ms
- Component render: < 100ms
- Modal open: < 200ms
- Filter: instant
- No lag on scroll

---

## 🔧 Debugging Tips

### Enable Logging
```javascript
// Add to MyBookings.jsx for debugging
console.log("User:", user);
console.log("Bookings loaded:", bookings);
console.log("Filtered bookings:", filteredBookings);
console.log("Selected booking:", selectedBooking);
```

### Check Network Requests
```
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "bookings"
4. Look for GET request
5. Check response in Preview tab
6. Verify hotelId populated
```

### Check Local Storage
```
1. Open DevTools (F12)
2. Go to Application tab
3. Check localStorage for:
   - token (should exist)
   - user (should have _id)
4. Copy token and verify JWT at jwt.io
```

### Check Console
```
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors (red)
4. Look for warnings (yellow)
5. Check all console.log output
```

---

## ✅ Sign-Off Checklist

After testing, verify:

- [ ] Component renders
- [ ] Bookings load (if user has any)
- [ ] Filter works
- [ ] Modal opens
- [ ] Modal closes
- [ ] Details show correctly
- [ ] Responsive design works
- [ ] No console errors
- [ ] Navigation works
- [ ] Data is accurate

---

## 📝 Test Report Template

```
Date: ___________
Tester: ___________
Browser: Chrome / Firefox / Safari / Edge
Device: Desktop / Tablet / Mobile

Scenarios Tested:
[ ] User not logged in
[ ] User logged in, no bookings
[ ] View bookings
[ ] Filter bookings
[ ] View booking details
[ ] Close modal
[ ] Navigation from navbar
[ ] Desktop responsive
[ ] Tablet responsive
[ ] Mobile responsive

Issues Found:
(List any issues encountered)

Screenshots:
(Attach screenshots of any issues)

Sign-off: ___________
```

---

## 🚀 Ready to Deploy?

Before production deployment:

- [ ] All tests passed
- [ ] No console errors/warnings
- [ ] Mobile tested thoroughly
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] No hardcoded URLs
- [ ] Environment variables set
- [ ] Error messages helpful
- [ ] Loading states show

---

**Happy Testing! 🎉**

If issues found, check:
1. Console errors (F12)
2. Network requests (DevTools)
3. Backend logs
4. Database (MongoDB)
5. Token validity

Good luck! 💪
