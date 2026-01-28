# ScrollToTop - Quick Reference

## 🎯 Quick Start

### Step 1: Create Component
Create file: `client/src/components/scrollToTop/ScrollToTop.jsx`

```jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
```

### Step 2: Update App.js
```jsx
import ScrollToTop from "./components/scrollToTop/ScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop /> {/* Add this line */}
      <Routes>
        ...
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 📋 Checklist

- [ ] ScrollToTop.jsx created
- [ ] App.js imported ScrollToTop
- [ ] ScrollToTop placed inside BrowserRouter, outside Routes
- [ ] Test: Click property card → scroll to top
- [ ] Test: Click hotel card → scroll to top
- [ ] Test: Browser back button → scroll reset

---

## 🧪 Test Cases

| Test | Expected | Status |
|------|----------|--------|
| Click hotel type card | Page scrolls to top | ✅ |
| Scroll down, click hotel | Detail page scrolls to top | ✅ |
| Browser back button | Returns with scroll reset | ✅ |

---

## ⚠️ Common Mistakes

**❌ Wrong Position:**
```jsx
<BrowserRouter>
  <Routes>
    <ScrollToTop /> {/* Wrong - inside Routes */}
  </Routes>
</BrowserRouter>
```

**✅ Correct Position:**
```jsx
<BrowserRouter>
  <ScrollToTop /> {/* Right - outside Routes */}
  <Routes>
  </Routes>
</BrowserRouter>
```

---

## 🎨 Variants

### Basic (Instant Scroll)
```jsx
window.scrollTo({
  top: 0,
  left: 0,
  behavior: "auto",
});
```

### Smooth Scroll
```jsx
window.scrollTo({
  top: 0,
  left: 0,
  behavior: "smooth",
});
```

### With Navbar Offset
```jsx
window.scrollTo({
  top: 60, // Height of fixed navbar
  left: 0,
  behavior: "auto",
});
```

---

## 🔗 Related Components

- PropertyList.jsx - Click card → navigate with type param
- Hotel.jsx - Click hotel → navigate with ID
- List.jsx - Shows filtered hotels

All use `useNavigate()` or `<Link>` for routing, which triggers ScrollToTop.

---

## 💬 How It Works

```
User navigates to new route
  ↓
pathname changes
  ↓
useEffect detects change
  ↓
window.scrollTo(0, 0) executes
  ↓
Page scrolls to top
```

---

## ✨ Benefits

✅ Better UX - User sees top of page  
✅ Consistent behavior across routes  
✅ No manual scroll management needed  
✅ Works automatically for all routes  
✅ Minimal code (just 1 component)  

---

## 🚀 Done!

That's it! The ScrollToTop component automatically handles all route changes.
