# ScrollToTop Component Guide

## 🎯 Problem
Khi click vào hotel/apartment card để xem chi tiết, trang detail tự động scroll xuống (giữ lại vị trí scroll từ trang trước), gây trải nghiệm xấu.

## ✅ Solution
Dùng `ScrollToTop` component với React Router để reset scroll position khi route thay đổi.

---

## 📁 File Structure

```
client/src/components/scrollToTop/
├── ScrollToTop.jsx          (Simple version)
└── ScrollToTopAdvanced.jsx  (Advanced version with features)

App.js (Updated)
```

---

## 1️⃣ Basic ScrollToTop Component

**File:** `client/src/components/scrollToTop/ScrollToTop.jsx`

```jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top whenever pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname]);

  return null; // Component doesn't render anything
};

export default ScrollToTop;
```

### How It Works:
1. `useLocation()` - Hook từ React Router để theo dõi route hiện tại
2. `pathname` - Thay đổi mỗi khi user navigate tới route mới
3. `useEffect` - Chạy khi pathname thay đổi
4. `window.scrollTo()` - Reset scroll position về top (0, 0)
5. `return null` - Component không render UI, chỉ xử lý side effects

---

## 2️⃣ Advanced ScrollToTop Component

**File:** `client/src/components/scrollToTop/ScrollToTopAdvanced.jsx`

```jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTopAdvanced = ({ 
  smooth = false,     // Smooth scroll animation
  offset = 0,         // Scroll offset (cho fixed header)
  excludeRoutes = []  // Routes không cần scroll
}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Skip if route is excluded
    if (excludeRoutes.includes(pathname)) {
      return;
    }

    const scrollOptions = {
      top: offset,
      left: 0,
      behavior: smooth ? "smooth" : "auto",
    };

    requestAnimationFrame(() => {
      window.scrollTo(scrollOptions);
      document.documentElement.scrollTop = offset;
      document.body.scrollTop = offset;
    });

    console.log(`✓ Scrolled to top: ${pathname}`);
  }, [pathname, smooth, offset, excludeRoutes]);

  return null;
};

export default ScrollToTopAdvanced;
```

### Features:
- **smooth**: Smooth scroll animation thay vì instant
- **offset**: Scroll không hẳn top (e.g., vì có fixed header)
- **excludeRoutes**: Exclude routes cụ thể khỏi scroll reset
- **requestAnimationFrame**: Tối ưu performance
- **Fallback**: Set scroll trên cả html và body element

---

## 3️⃣ Integration với App.js

**File:** `client/src/App.js`

```jsx
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import ScrollToTop from "./components/scrollToTop/ScrollToTop";
import Home from "./pages/home/Home";
import Hotel from "./pages/hotel/Hotel";
import List from "./pages/list/List";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import Favorites from "./pages/favorites/Favorites";
import Account from "./pages/account/Account";
import Settings from "./pages/settings/Settings";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/hotels" element={<List/>}/>
        <Route path="/hotels/:id" element={<Hotel/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/favorites" element={<Favorites/>}/>
        <Route path="/account" element={<Account/>}/>
        <Route path="/settings" element={<Settings/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Important:
⚠️ **MUST**: `<ScrollToTop />` phải nằm **INSIDE** `<BrowserRouter>` nhưng **OUTSIDE** `<Routes>`

Sai:
```jsx
<BrowserRouter>
  <Routes>
    <ScrollToTop /> {/* ❌ Wrong - won't work */}
  </Routes>
</BrowserRouter>
```

Đúng:
```jsx
<BrowserRouter>
  <ScrollToTop /> {/* ✅ Correct */}
  <Routes>
  </Routes>
</BrowserRouter>
```

---

## 4️⃣ Usage Examples

### Simple Usage (Basic Component)
```jsx
// App.js
import ScrollToTop from "./components/scrollToTop/ScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        ...
      </Routes>
    </BrowserRouter>
  );
}
```

### Advanced Usage with Smooth Scroll
```jsx
// App.js
import ScrollToTopAdvanced from "./components/scrollToTop/ScrollToTopAdvanced";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTopAdvanced smooth={true} />
      <Routes>
        ...
      </Routes>
    </BrowserRouter>
  );
}
```

### Advanced Usage with Fixed Header (60px)
```jsx
// App.js
import ScrollToTopAdvanced from "./components/scrollToTop/ScrollToTopAdvanced";

function App() {
  return (
    <BrowserRouter>
      {/* Scroll to 60px from top (height of fixed navbar) */}
      <ScrollToTopAdvanced 
        smooth={true} 
        offset={60} 
      />
      <Navbar /> {/* Fixed navbar with height 60px */}
      <Routes>
        ...
      </Routes>
    </BrowserRouter>
  );
}
```

### Advanced Usage with Excluded Routes
```jsx
// App.js
import ScrollToTopAdvanced from "./components/scrollToTop/ScrollToTopAdvanced";

function App() {
  return (
    <BrowserRouter>
      {/* Don't scroll on /home, /favorites */}
      <ScrollToTopAdvanced 
        smooth={true}
        excludeRoutes={["/", "/favorites"]}
      />
      <Routes>
        ...
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🔄 User Flow

```
User on /hotels (List page, scrolled to bottom)
    ↓
Click Hotel Card (e.g., "Sunny Hotel")
    ↓
Navigate to /hotels/:id (Hotel detail page)
    ↓
Route pathname changes from "/hotels" to "/hotels/123"
    ↓
ScrollToTop useEffect triggers
    ↓
window.scrollTo({ top: 0, left: 0 })
    ↓
Page scrolls to top automatically ✓
    ↓
User sees hotel details from top (good UX!)
```

---

## 🎨 Comparison: With vs Without ScrollToTop

### WITHOUT ScrollToTop
```
Homepage (scrolled down to PropertyList section)
    ↓
Click "hotel" card
    ↓
Navigate to /hotels?type=hotel
    ↓
Page loads but stays at same scroll position
    ↓
❌ User sees middle/bottom of List page (bad UX)
    ↓
User has to manually scroll up to see top
```

### WITH ScrollToTop
```
Homepage (scrolled down to PropertyList section)
    ↓
Click "hotel" card
    ↓
Navigate to /hotels?type=hotel
    ↓
Page loads AND automatically scrolls to top
    ↓
✅ User sees top of List page (good UX)
    ↓
User can start viewing immediately
```

---

## 🚀 How Navigation Works in Your App

### Method 1: Using useNavigate Hook (NO SCROLL ISSUE)
```jsx
import { useNavigate } from "react-router-dom";

const PropertyList = () => {
  const navigate = useNavigate();

  const handlePropertyClick = (type) => {
    // ✅ This causes route change → ScrollToTop triggers
    navigate(`/hotels?type=${type}`);
  };

  return <div onClick={() => handlePropertyClick("hotel")}>...</div>;
};
```

### Method 2: Using <Link> Component (NO SCROLL ISSUE)
```jsx
import { Link } from "react-router-dom";

const SearchItem = ({ hotel }) => {
  return (
    <Link to={`/hotels/${hotel._id}`}>
      <div className="hotel-card">
        {/* ✅ Clicking link triggers route change → ScrollToTop triggers */}
      </div>
    </Link>
  );
};
```

### Method 3: Using <a> tag (HAS SCROLL ISSUE - DON'T USE)
```jsx
// ❌ DON'T DO THIS
const SearchItem = ({ hotel }) => {
  return (
    <a href={`/hotels/${hotel._id}`}>
      {/* ❌ Full page reload - wastes data, bad UX, ScrollToTop not needed */}
    </a>
  );
};
```

---

## 🧪 Testing

### Test 1: Navigate to List Page
```
1. Scroll down on homepage
2. Click a property type card
3. ✅ Should scroll to top of /hotels page
```

### Test 2: Navigate to Hotel Detail
```
1. Scroll down on /hotels?type=hotel list
2. Click a hotel card
3. ✅ Should scroll to top of /hotels/:id detail page
```

### Test 3: Browser Back Button
```
1. Open /hotels/:id detail page (scrolled)
2. Click browser back button
3. ✅ Should return to /hotels list (ScrollToTop resets scroll)
```

### Test 4: Browser Console Check
```javascript
// In browser console
const location = useLocation();
console.log(location.pathname);
// Should log different paths when navigating
```

---

## 🐛 Troubleshooting

### Issue 1: ScrollToTop Not Working
**Cause**: ScrollToTop component placed OUTSIDE BrowserRouter or INSIDE Routes

**Fix**:
```jsx
✅ Correct:
<BrowserRouter>
  <ScrollToTop />
  <Routes>...</Routes>
</BrowserRouter>

❌ Wrong:
<BrowserRouter>
  <Routes>
    <ScrollToTop />
  </Routes>
</BrowserRouter>
```

### Issue 2: Scroll Not Resetting on Every Route Change
**Cause**: useEffect dependency not including pathname

**Fix**:
```jsx
// ❌ Wrong - missing dependency
useEffect(() => {
  window.scrollTo(0, 0);
}, []);

// ✅ Correct - includes pathname
useEffect(() => {
  window.scrollTo(0, 0);
}, [pathname]);
```

### Issue 3: Scroll Goes to Top Too Late
**Cause**: Using behavior: "smooth" with slow network

**Fix**:
```jsx
// ✅ Use "auto" for instant scroll
window.scrollTo({
  top: 0,
  behavior: "auto", // Instant, not smooth
});
```

### Issue 4: Still Seeing Scroll on Fixed Header
**Cause**: Not accounting for fixed navbar height

**Fix**:
```jsx
// Use ScrollToTopAdvanced with offset
<ScrollToTopAdvanced 
  offset={80} // Height of fixed navbar
/>
```

---

## 📊 Component Comparison

| Feature | ScrollToTop | ScrollToTopAdvanced |
|---------|-------------|-------------------|
| Basic scroll reset | ✅ | ✅ |
| Smooth scroll | ❌ | ✅ |
| Scroll offset | ❌ | ✅ |
| Exclude routes | ❌ | ✅ |
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Simplicity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Use case | Most apps | Complex layouts |

---

## 💡 Best Practices

1. ✅ **Always place ScrollToTop inside BrowserRouter, outside Routes**
2. ✅ **Use useNavigate() or <Link> for navigation (not <a>)**
3. ✅ **Use behavior: "auto" unless smooth scrolling is essential**
4. ✅ **Test on mobile devices for scroll performance**
5. ✅ **Check browser console for scroll log messages**
6. ✅ **Use offset prop if you have fixed headers**
7. ❌ **Don't use excludeRoutes unless necessary**
8. ❌ **Don't place ScrollToTop inside <Routes>**

---

## 🎯 Implementation Checklist

- [ ] Create ScrollToTop.jsx component
- [ ] Import ScrollToTop in App.js
- [ ] Place ScrollToTop inside BrowserRouter
- [ ] Verify placed OUTSIDE Routes
- [ ] Test navigation with property type cards
- [ ] Test navigation with hotel cards
- [ ] Test browser back button
- [ ] Check console for scroll logs
- [ ] Test on mobile devices
- [ ] Verify smooth vs instant scroll preference

---

## 📝 Key Points

| Concept | Explanation |
|---------|------------|
| **Route Change** | When pathname changes in URL (e.g., `/` → `/hotels/:id`) |
| **useLocation()** | React Router hook to access current location |
| **pathname** | Current route path |
| **useEffect(fn, [pathname])** | Runs when pathname changes |
| **window.scrollTo(0, 0)** | Scroll to top-left |
| **behavior: "auto"** | Instant scroll (default) |
| **behavior: "smooth"** | Animated scroll |
| **requestAnimationFrame** | Optimize scroll performance |
| **return null** | Component doesn't render visible elements |

---

## 🚀 Ready to Use!

Copy the ScrollToTop component and integrate it with App.js. Test by clicking on property type cards and hotel cards - the page should scroll to the top automatically!
