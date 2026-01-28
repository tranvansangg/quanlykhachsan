import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component
 * Automatically scrolls to the top of the page when the route changes
 * 
 * Usage: Place inside <BrowserRouter> but outside <Routes>
 * Example:
 *   <BrowserRouter>
 *     <ScrollToTop />
 *     <Routes>
 *       ...
 *     </Routes>
 *   </BrowserRouter>
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top immediately (no smooth animation)
    // Reset both document.documentElement and document.body for cross-browser compatibility
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;
