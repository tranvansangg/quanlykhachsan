# 🏨 Favorite Hotel - Quick Reference Card

## 🎯 Quick Links

| Item | Location |
|------|----------|
| 📖 **Full Guide** | `FAVORITE_HOTEL_GUIDE.md` |
| 🧪 **API Tests** | `API_TEST_COLLECTION.md` |
| ✅ **Completion Status** | `COMPLETION_SUMMARY.md` |

---

## 💡 Core Components

### 1️⃣ FavoriteButton Component
**Location:** `client/src/components/favoriteButton/FavoriteButton.jsx`

```jsx
<FavoriteButton hotelId={hotel._id} />
<FavoriteButton hotelId={hotel._id} className="ml-4" />
```

**Props:**
- `hotelId` (required): String - Hotel ID
- `className` (optional): String - CSS classes

---

### 2️⃣ Favorites Page
**Location:** `client/src/pages/favorites/Favorites.jsx`
**Route:** `/favorites`

Shows all favorite hotels with ability to remove

---

### 3️⃣ Backend API
**Base URL:** `http://localhost:8800/api/favorites`

```javascript
// Main Endpoints
POST   /:userId/toggle          // Add/Remove ❤️ RECOMMENDED
GET    /:userId/check           // Check status
GET    /:userId/hotels          // Get details
```

---

## 🔧 How to Integrate

### In SearchItem Component
```jsx
import FavoriteButton from "../favoriteButton/FavoriteButton";

<div className="relative">
  <img src={item.photos?.[0]} alt={item.name} />
  <div className="absolute top-3 right-3">
    <FavoriteButton hotelId={item._id} />
  </div>
</div>
```

### In Hotel Detail Page
```jsx
import FavoriteButton from "../../components/favoriteButton/FavoriteButton";

<div style={{ display: "flex", justifyContent: "space-between" }}>
  <h1>{data.name}</h1>
  <FavoriteButton hotelId={data._id} />
</div>
```

---

## 🔌 API Usage

### Check if Favorite
```bash
GET /favorites/{userId}/check?hotelId={hotelId}
Header: Authorization: Bearer {token}

Response: { "isFavorite": true/false }
```

### Toggle Favorite
```bash
POST /favorites/{userId}/toggle
Header: Authorization: Bearer {token}
Body: { "hotelId": "..." }

Response: { "isFavorite": true/false }
```

### Get All Favorites (with details)
```bash
GET /favorites/{userId}/hotels
Header: Authorization: Bearer {token}

Response: { "count": 2, "hotels": [...] }
```

---

## 🎨 Styling

### Heart Icon Colors
- **Not Favorite:** Gray/Default
- **Favorite:** Red (#ff0000) ❤️

### Button States
- **Normal:** 40x40px button with heart
- **Hover:** Slight scale up + background color
- **Active:** Red heart + animation
- **Loading:** Opacity reduced

### Animation
```css
heartBeat: 0% scale(1) → 100% scale(1)
Duration: 0.4s cubic-bezier
```

---

## 🧪 Quick Test

1. **Login** as test user
2. **Find a hotel** → Click heart icon
3. **See it turn red** ❤️
4. **Go to /favorites** → Hotel appears
5. **Click again** → Hotel removed 🤍

---

## 🐛 Debug Tips

```javascript
// Check user logged in
console.log(user);

// Check favorites list
console.log(localStorage.getItem("user"));

// Check API response
console.log(response.data);

// Check component state
console.log(isFavorite, loading);
```

---

## 📊 Database Schema

```javascript
// User favorites field
{
  favorites: [String]  // Array of Hotel IDs
}

// Example:
{
  favorites: [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ]
}
```

---

## ✨ Features at a Glance

| Feature | Status |
|---------|--------|
| Add Favorite | ✅ |
| Remove Favorite | ✅ |
| View List | ✅ |
| Persistent Storage | ✅ |
| Authentication Required | ✅ |
| Heart Animation | ✅ |
| Empty State | ✅ |
| Error Handling | ✅ |
| Responsive Design | ✅ |
| Loading States | ✅ |

---

## 🚀 Performance Tips

- Component caches favorite status locally
- Only fetches when necessary
- Batch queries for hotel details
- Graceful error handling

---

## 📱 Responsive Behavior

- **Desktop:** Full-size heart button
- **Mobile:** Optimized touch target
- **Tablet:** Adaptive layout

---

## 🔐 Security Notes

✅ JWT authentication required  
✅ User can only modify own favorites  
✅ Server-side validation  
✅ Token verification on all endpoints

---

## 🎬 Common Flows

### User Adds Favorite
```
1. User clicks heart icon
2. API POST /toggle
3. Database updates
4. UI shows red heart ❤️
5. Tooltip shows "Đã thích"
```

### User Views Favorites
```
1. Navigate to /favorites
2. Check if authenticated
3. Fetch all favorite hotels
4. Display in list
5. Can remove from here
```

### User Removes Favorite
```
1. Click red heart ❤️
2. API POST /toggle
3. Database updates
4. UI shows white heart 🤍
5. List refreshes
```

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Button disabled | User not logged in |
| Heart doesn't change | Check API response |
| Favorites don't persist | Check localStorage token |
| API 401 error | Token expired, need re-login |
| Favorites page empty | No favorites saved yet |

---

## 📚 File References

```
✅ FavoriteButton.jsx       - Main component
✅ favorite.js              - Backend controller
✅ favorites.js             - Routes
✅ User.js                  - Database model
✅ Favorites.jsx            - Favorites page
✅ SearchItem.jsx           - Integration point 1
✅ Hotel.jsx                - Integration point 2
```

---

## 🎯 Success Metrics

- ✅ User can save favorite hotels
- ✅ Favorites persist across sessions
- ✅ Data stored in MongoDB
- ✅ Responsive on all devices
- ✅ Fast API response time
- ✅ Smooth animations
- ✅ Clear error messages
- ✅ Good UX flow

---

## 🔄 Update Flow

```
User Action (click) 
    ↓
FavoriteButton Handler
    ↓
Check Authentication
    ↓
API POST /toggle
    ↓
Backend Update (MongoDB)
    ↓
API Response
    ↓
Update Component State
    ↓
UI Renders (heart color change)
```

---

## 🎉 Ready to Use!

Just import and use:
```jsx
<FavoriteButton hotelId={hotel._id} />
```

That's it! 🚀

---

**Version:** 1.0  
**Quick Reference Card for Favorite Hotel Feature**
