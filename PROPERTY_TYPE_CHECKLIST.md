# Property Type Filter - Interactive Checklist & Verification

## ✅ Pre-Deployment Checklist

### Frontend Verification

- [ ] **PropertyList Component Loads**
  ```bash
  npm start (in client folder)
  Open: http://localhost:3000
  See: 5 property type cards displayed
  ```

- [ ] **PropertyList Shows Correct Data**
  ```javascript
  // Browser console
  fetch('/api/hotels/countByType')
    .then(r => r.json())
    .then(d => console.log(d))
  // Should show array with counts
  ```

- [ ] **PropertyList Card Click Works**
  - [ ] Click "hotel" card
  - [ ] URL changes to `/hotels?type=hotel`
  - [ ] LocalStorage updated with type

- [ ] **List Page Loads with Type**
  - [ ] URL is `/hotels?type=hotel`
  - [ ] Page loads without errors
  - [ ] Search results appear

- [ ] **List Page Shows Correct Hotels**
  ```javascript
  // Browser console on List page
  const typeParam = new URLSearchParams(window.location.search).get('type');
  console.log('Type:', typeParam);
  // Should show "hotel", "apartment", etc.
  ```

- [ ] **No Console Errors**
  - [ ] Open DevTools (F12)
  - [ ] Go to Console tab
  - [ ] No red error messages

- [ ] **Mobile Responsive**
  - [ ] Open DevTools (F12)
  - [ ] Toggle device toolbar
  - [ ] Test on mobile view
  - [ ] PropertyList cards stack correctly

---

### Backend Verification

- [ ] **Backend Running**
  ```bash
  npm start (in api folder)
  See: Server listening on port 8800
  ```

- [ ] **countByType Endpoint Works**
  ```bash
  curl -X GET http://localhost:8800/api/hotels/countByType
  # Should return JSON array with counts
  ```

- [ ] **search-available Accepts Type**
  ```bash
  curl -X POST http://localhost:8800/api/hotels/search-available \
    -H "Content-Type: application/json" \
    -d '{"city":"","type":"hotel","roomRequests":[{"adults":1,"children":0}]}'
  # Should return array of hotels
  ```

- [ ] **Filters Correctly**
  ```bash
  # Test type filter
  curl -X POST http://localhost:8800/api/hotels/search-available \
    -H "Content-Type: application/json" \
    -d '{"city":"","type":"hotel","roomRequests":[{"adults":1,"children":0}]}'
  
  # Test combined filter
  curl -X POST http://localhost:8800/api/hotels/search-available \
    -H "Content-Type: application/json" \
    -d '{"city":"Ho Chi Minh","type":"apartment","roomRequests":[{"adults":1,"children":0}]}'
  # Results should match filter
  ```

- [ ] **Error Handling Works**
  ```bash
  # Test missing filter
  curl -X POST http://localhost:8800/api/hotels/search-available \
    -H "Content-Type: application/json" \
    -d '{"city":"","type":"","roomRequests":[{"adults":1,"children":0}]}'
  # Should return 400 error
  ```

- [ ] **No Errors in Backend Logs**
  - [ ] Watch npm start output
  - [ ] Make API calls
  - [ ] Check for error stack traces

---

### Database Verification

- [ ] **Hotels Have Type Field**
  ```bash
  mongo
  > use quanlykhachsan
  > db.hotels.findOne()
  # Should have "type" field
  ```

- [ ] **Type Values Are Lowercase**
  ```bash
  > db.hotels.find({}, {type: 1}).pretty()
  # All types should be lowercase: "hotel", "apartment", etc.
  ```

- [ ] **Type Values Are Valid**
  ```bash
  > db.hotels.find({type: {$nin: ["hotel","apartment","resort","villa","cabin"]}}).count()
  # Should return 0 (no invalid types)
  ```

- [ ] **All 5 Types Have Hotels**
  ```bash
  > db.hotels.find({type: "hotel"}).count()      // > 0
  > db.hotels.find({type: "apartment"}).count()  // > 0
  > db.hotels.find({type: "resort"}).count()     // > 0
  > db.hotels.find({type: "villa"}).count()      // > 0
  > db.hotels.find({type: "cabin"}).count()      // > 0
  ```

- [ ] **No Null Types**
  ```bash
  > db.hotels.find({type: null}).count()           // 0
  > db.hotels.find({type: {$exists: false}}).count() // 0
  ```

- [ ] **Query Performance OK**
  ```bash
  > db.hotels.find({type: "hotel"}).explain("executionStats")
  # Check executionStats.executedStages.stage
  # Ideally should be COLLSCAN or INDEX
  ```

---

### API Integration Testing

- [ ] **Network Call Successful**
  - [ ] Open DevTools (F12)
  - [ ] Go to Network tab
  - [ ] Clear network tab
  - [ ] Click property card on homepage
  - [ ] Check network requests:
    - [ ] `/countByType` returns 200
    - [ ] Page navigates successfully

- [ ] **List Page API Call**
  - [ ] Still on Network tab
  - [ ] Let page load
  - [ ] Filter by "search-available"
  - [ ] Check request:
    - [ ] URL: `/hotels/search-available`
    - [ ] Method: POST
    - [ ] Status: 200
    - [ ] Response has hotel array

- [ ] **Request/Response Format**
  - [ ] Request body includes `type`
  - [ ] Response is JSON array
  - [ ] Each hotel has expected fields:
    - [ ] `_id`
    - [ ] `name`
    - [ ] `type`
    - [ ] `city`
    - [ ] `cheapestPrice`

- [ ] **Response Time Acceptable**
  - [ ] Check DevTools → Network → countByType: < 200ms
  - [ ] Check DevTools → Network → search-available: < 500ms

---

### End-to-End Testing

#### Test Case 1: Hotel Type
- [ ] Open homepage
- [ ] Click "hotel" card
- [ ] URL becomes `/hotels?type=hotel`
- [ ] List page loads
- [ ] Hotels displayed
- [ ] All hotels have `type: "hotel"` (verify in DevTools → Response)

#### Test Case 2: Apartment Type
- [ ] Go back to homepage
- [ ] Click "apartments" card
- [ ] URL becomes `/hotels?type=apartment`
- [ ] List page shows apartments only
- [ ] Verify type in API response

#### Test Case 3: Combined Filter (Type + City)
- [ ] Navigate to `/hotels?type=hotel&city=Hanoi`
- [ ] Should show only hotels in Hanoi
- [ ] Verify in DevTools Network: request includes both type and city

#### Test Case 4: Combined Filter (Type + Dates)
- [ ] Open `/hotels?type=resort`
- [ ] Set check-in/check-out dates
- [ ] Click search
- [ ] Should show resorts available on those dates

#### Test Case 5: Filter Combination (Type + City + Dates + Guests)
- [ ] Navigate to `/hotels?type=villa&city=Dalat`
- [ ] Set dates: 2024-02-15 to 2024-02-17
- [ ] Set guests: 2 adults, 1 child
- [ ] Click search
- [ ] Should show villas in Dalat with availability

#### Test Case 6: Price Filter
- [ ] Go to `/hotels?type=apartment`
- [ ] Set price range: $50-$150
- [ ] Should show only apartments in price range
- [ ] Verify filtering works

#### Test Case 7: Rating Filter
- [ ] Go to `/hotels?type=hotel`
- [ ] Filter by 4+ stars
- [ ] Should show only high-rated hotels
- [ ] Verify filtering works

#### Test Case 8: No Results
- [ ] Navigate to `/hotels?type=cabin&city=NonExistentCity`
- [ ] Should show empty state message
- [ ] No JavaScript errors

#### Test Case 9: Go Back Navigation
- [ ] Click property card (type filter)
- [ ] Click another property card (different type)
- [ ] Use browser back button
- [ ] Should correctly navigate between type filters

#### Test Case 10: Refresh Page
- [ ] Go to `/hotels?type=hotel`
- [ ] Press F5 to refresh
- [ ] Page should reload with same filter
- [ ] Results should be the same

---

### Browser Compatibility

- [ ] **Chrome**
  - [ ] Latest version
  - [ ] No console errors
  - [ ] All features work

- [ ] **Firefox**
  - [ ] Latest version
  - [ ] No console errors
  - [ ] All features work

- [ ] **Safari**
  - [ ] Latest version
  - [ ] No console errors
  - [ ] All features work

- [ ] **Edge**
  - [ ] Latest version
  - [ ] No console errors
  - [ ] All features work

---

### Device Testing

- [ ] **Desktop (1920x1080)**
  - [ ] PropertyList cards display 5 columns
  - [ ] All text readable
  - [ ] Buttons clickable

- [ ] **Tablet (768x1024)**
  - [ ] PropertyList cards responsive
  - [ ] Layout adjusts properly
  - [ ] Touch works

- [ ] **Mobile (375x667)**
  - [ ] PropertyList cards stack vertically (2-3 per row)
  - [ ] Typography readable
  - [ ] Touch interactions work
  - [ ] No horizontal scroll

---

### Performance Testing

- [ ] **Load Time < 3 seconds**
  ```bash
  # Check DevTools → Network
  # Total load time should be < 3s
  ```

- [ ] **API Response < 500ms**
  ```bash
  # Check DevTools → Network
  # Each API call should complete < 500ms
  ```

- [ ] **No Memory Leaks**
  - [ ] Open DevTools → Memory
  - [ ] Record heap snapshot
  - [ ] Click through features
  - [ ] Record another snapshot
  - [ ] Compare: memory should not grow exponentially

- [ ] **No Unused Code**
  - [ ] Check Network tab
  - [ ] CSS/JS files should be < 1MB total
  - [ ] No 404 errors

---

### Security Testing

- [ ] **No XSS Vulnerabilities**
  ```javascript
  // In console, try:
  // Should escape HTML, not render as HTML
  fetch('/api/hotels/search-available', {
    method: 'POST',
    body: JSON.stringify({
      type: '<script>alert("xss")</script>',
      city: '',
      roomRequests: [{adults: 1}]
    })
  })
  ```

- [ ] **CORS Allowed**
  - [ ] Frontend and API on same domain: ✅
  - [ ] Or proper CORS headers set

- [ ] **Authentication Not Bypassed**
  - [ ] If auth required, test without token
  - [ ] Should get 401/403 error

- [ ] **Input Validation**
  - [ ] Test with invalid type values
  - [ ] Test with SQL injection attempts
  - [ ] Should validate and reject

---

### Accessibility Testing

- [ ] **Keyboard Navigation**
  - [ ] Tab through PropertyList cards
  - [ ] Enter key activates click
  - [ ] Can navigate without mouse

- [ ] **Screen Reader**
  - [ ] Cards have proper labels
  - [ ] Images have alt text
  - [ ] Buttons are labeled

- [ ] **Color Contrast**
  - [ ] Text has sufficient contrast
  - [ ] Use: https://webaim.org/resources/contrastchecker/

- [ ] **Font Size**
  - [ ] All text readable at default zoom
  - [ ] Text scales properly

---

## 📊 Test Results Summary

### Date: ___________

### Frontend Tests
- PropertyList component: ✅ / ❌
- Click navigation: ✅ / ❌
- List page loads: ✅ / ❌
- Type filtering: ✅ / ❌
- No console errors: ✅ / ❌

**Issues Found:**
```
1. ___________________________
2. ___________________________
3. ___________________________
```

### Backend Tests
- API countByType: ✅ / ❌
- API search-available: ✅ / ❌
- Type filtering: ✅ / ❌
- Error handling: ✅ / ❌
- No errors in logs: ✅ / ❌

**Issues Found:**
```
1. ___________________________
2. ___________________________
3. ___________________________
```

### Database Tests
- Hotel type field: ✅ / ❌
- Lowercase values: ✅ / ❌
- Valid enum values: ✅ / ❌
- All types populated: ✅ / ❌
- No null values: ✅ / ❌

**Issues Found:**
```
1. ___________________________
2. ___________________________
3. ___________________________
```

### E2E Tests
- Homepage → Click card → List page: ✅ / ❌
- Type filtering works: ✅ / ❌
- Combined filters work: ✅ / ❌
- Price filter works: ✅ / ❌
- Rating filter works: ✅ / ❌

**Issues Found:**
```
1. ___________________________
2. ___________________________
3. ___________________________
```

### Performance Tests
- Load time < 3s: ✅ / ❌
- API response < 500ms: ✅ / ❌
- No memory leaks: ✅ / ❌
- Mobile responsive: ✅ / ❌

**Issues Found:**
```
1. ___________________________
2. ___________________________
3. ___________________________
```

---

## 🚀 Deployment Sign-Off

### Code Review: _____ (Approved/Changes Needed)
**Reviewer:** ________________  **Date:** __________

### QA Testing: _____ (Passed/Failed)
**Tester:** ________________  **Date:** __________

### Performance Review: _____ (OK/Needs Work)
**Engineer:** ________________  **Date:** __________

### Security Review: _____ (Secure/Issues)
**Security:** ________________  **Date:** __________

### Final Approval: _____ (APPROVED/REJECTED)
**Manager:** ________________  **Date:** __________

---

## 🎯 Critical Issues Found

| Issue | Severity | Status | Assigned To |
|-------|----------|--------|-------------|
| | High/Med/Low | Open/Fixed | |
| | High/Med/Low | Open/Fixed | |
| | High/Med/Low | Open/Fixed | |

---

## ✅ Go/No-Go Decision

- [ ] **GO** - Feature ready for production
- [ ] **NO-GO** - Issues must be resolved first

**Decision By:** ________________ **Date:** __________

---

## 📝 Notes

```
_____________________________________________________________________________

_____________________________________________________________________________

_____________________________________________________________________________
```

---

**This checklist must be 100% completed before deployment.**

**Last Updated:** January 2024
**Version:** 1.0
**Status:** Ready for Testing
