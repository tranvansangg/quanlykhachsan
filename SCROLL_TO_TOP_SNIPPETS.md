# ScrollToTop - Code Snippets

## 📄 Complete Implementation

### 1. ScrollToTop Component

**File:** `client/src/components/scrollToTop/ScrollToTop.jsx`

```jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component
 * 
 * Automatically scrolls to the top of the page when the route changes.
 * 
 * Usage:
 *   <BrowserRouter>
 *     <ScrollToTop />
 *     <Routes>
 *       <Route path="/" element={<Home/>} />
 *       ...
 *     </Routes>
 *   </BrowserRouter>
 * 
 * Features:
 * - Works with all React Router navigation (useNavigate, <Link>, etc.)
 * - No configuration needed
 * - Minimal performance impact
 * - Doesn't render any visible elements
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top whenever the pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // Instant scroll
    });
    
    console.log(`✓ Scrolled to top on route: ${pathname}`);
  }, [pathname]); // Only run when pathname changes

  return null; // This component doesn't render anything
};

export default ScrollToTop;
```

---

### 2. Updated App.js

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
      {/* 
        ScrollToTop must be INSIDE BrowserRouter but OUTSIDE Routes
        It listens to route changes via useLocation hook
      */}
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

---

## 🎨 Variant 1: Smooth Scrolling

If you want smooth scroll animation instead of instant:

```jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTopSmooth = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // Smooth animation
    });
  }, [pathname]);

  return null;
};

export default ScrollToTopSmooth;
```

**Usage:**
```jsx
<BrowserRouter>
  <ScrollToTopSmooth /> {/* Replace ScrollToTop with this */}
  <Routes>
    ...
  </Routes>
</BrowserRouter>
```

---

## 🎨 Variant 2: With Navbar Offset

If you have a fixed navbar and want to scroll below it:

```jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTopWithOffset = ({ navbarHeight = 80 }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: navbarHeight, // Scroll to navbar height instead of 0
      left: 0,
      behavior: "auto",
    });
  }, [pathname, navbarHeight]);

  return null;
};

export default ScrollToTopWithOffset;
```

**Usage:**
```jsx
<BrowserRouter>
  <ScrollToTopWithOffset navbarHeight={80} /> {/* Navbar is 80px tall */}
  <Routes>
    ...
  </Routes>
</BrowserRouter>
```

---

## 🎨 Variant 3: Exclude Specific Routes

If you want some routes to NOT scroll to top:

```jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTopExclude = ({ excludeRoutes = [] }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Don't scroll if current route is in excludeRoutes
    if (excludeRoutes.includes(pathname)) {
      console.log(`⊘ Skipped scroll for route: ${pathname}`);
      return;
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
    
    console.log(`✓ Scrolled to top for route: ${pathname}`);
  }, [pathname, excludeRoutes]);

  return null;
};

export default ScrollToTopExclude;
```

**Usage:**
```jsx
<BrowserRouter>
  {/* Don't scroll on home page and favorites */}
  <ScrollToTopExclude excludeRoutes={["/", "/favorites"]} />
  <Routes>
    ...
  </Routes>
</BrowserRouter>
```

---

## 🎨 Variant 4: Advanced with All Features

Combine smooth scroll, offset, and exclude routes:

```jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTopAdvanced = ({
  smooth = false,        // Enable smooth scroll animation
  offset = 0,            // Scroll offset for fixed navbar
  excludeRoutes = [],    // Routes to exclude from scroll
}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Skip if current route is excluded
    if (excludeRoutes.includes(pathname)) {
      console.log(`⊘ Scroll skipped for: ${pathname}`);
      return;
    }

    const scrollOptions = {
      top: offset,
      left: 0,
      behavior: smooth ? "smooth" : "auto",
    };

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      window.scrollTo(scrollOptions);
      
      // Fallback for some browsers
      document.documentElement.scrollTop = offset;
      document.body.scrollTop = offset;
    });

    console.log(`✓ Scrolled to ${offset}px on route: ${pathname}`);
  }, [pathname, smooth, offset, excludeRoutes]);

  return null;
};

export default ScrollToTopAdvanced;
```

**Usage Examples:**

```jsx
// Basic
<ScrollToTopAdvanced />

// With smooth scroll
<ScrollToTopAdvanced smooth={true} />

// With navbar offset
<ScrollToTopAdvanced offset={80} />

// Exclude home and favorites
<ScrollToTopAdvanced excludeRoutes={["/", "/favorites"]} />

// All features
<ScrollToTopAdvanced 
  smooth={true}
  offset={80}
  excludeRoutes={["/", "/favorites"]}
/>
```

---

## 🧪 Testing Code

### Test in Browser Console

```javascript
// Check if scroll resets on navigation
const originalScrollTo = window.scrollTo;
window.scrollTo = function(...args) {
  console.log("🔄 Scroll triggered:", args);
  return originalScrollTo.apply(window, args);
};

// Now navigate using router and check console
// Should see "🔄 Scroll triggered: [Object]" on each route change
```

### Test Component

Create `client/src/test/ScrollToTopTest.jsx`:

```jsx
import { useLocation } from "react-router-dom";

export const ScrollToTopTest = () => {
  const { pathname } = useLocation();

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      backgroundColor: "#333",
      color: "#fff",
      padding: "10px",
      borderRadius: "5px",
      fontSize: "12px",
      zIndex: 9999,
    }}>
      Current Route: <strong>{pathname}</strong>
    </div>
  );
};
```

**Usage in App.js:**
```jsx
import { ScrollToTopTest } from "./test/ScrollToTopTest";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ScrollToTopTest /> {/* Shows current route in corner */}
      <Routes>
        ...
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🚨 Common Issues & Fixes

### Issue: Scroll not working at all

**Fix 1:** Check position in App.js
```jsx
❌ Wrong
<BrowserRouter>
  <Routes>
    <ScrollToTop />
  </Routes>
</BrowserRouter>

✅ Correct
<BrowserRouter>
  <ScrollToTop />
  <Routes>
  </Routes>
</BrowserRouter>
```

**Fix 2:** Check useLocation works
```jsx
// In console
import { useLocation } from "react-router-dom";
const loc = useLocation();
console.log(loc.pathname); // Should show current path
```

**Fix 3:** Check dependencies
```jsx
// ❌ Wrong - missing pathname
useEffect(() => {
  window.scrollTo(0, 0);
}, []); // Empty array = runs once on mount

// ✅ Correct
useEffect(() => {
  window.scrollTo(0, 0);
}, [pathname]); // Runs when pathname changes
```

### Issue: Scroll is too slow (smooth mode)

**Fix:** Use instant scroll
```jsx
// Change from
behavior: "smooth"

// To
behavior: "auto"
```

### Issue: Scroll goes to middle of page

**Fix:** Adjust offset
```jsx
// If showing middle, increase offset
offset={0}  // Change to
offset={100} // or appropriate value
```

---

## 📊 Performance Comparison

| Variant | Smooth | Offset | Exclude | Best For |
|---------|--------|--------|---------|----------|
| Basic | ❌ | ❌ | ❌ | Most apps |
| Smooth | ✅ | ❌ | ❌ | Slower connections |
| Offset | ❌ | ✅ | ❌ | Fixed navbar |
| Exclude | ❌ | ❌ | ✅ | Special routes |
| Advanced | ✅ | ✅ | ✅ | Complex apps |

---

## ✅ Implementation Checklist

- [ ] Create ScrollToTop.jsx
- [ ] Import in App.js
- [ ] Place inside BrowserRouter, outside Routes
- [ ] Remove any other scroll-to-top logic
- [ ] Test with property type cards
- [ ] Test with hotel detail cards
- [ ] Test browser back button
- [ ] Check console logs
- [ ] Remove test component if added
- [ ] Verify on mobile devices

---

## 🎯 File Locations

```
project/
├── client/
│   └── src/
│       ├── components/
│       │   └── scrollToTop/
│       │       ├── ScrollToTop.jsx
│       │       └── ScrollToTopAdvanced.jsx (optional)
│       ├── App.js (updated)
│       └── ...
└── ...
```

---

## 🚀 Quick Copy-Paste

**Minimal setup (3 steps):**

1. Create `client/src/components/scrollToTop/ScrollToTop.jsx` with basic component
2. Import in App.js: `import ScrollToTop from "./components/scrollToTop/ScrollToTop";`
3. Add in App.js before `<Routes>`: `<ScrollToTop />`

Done! ✅
