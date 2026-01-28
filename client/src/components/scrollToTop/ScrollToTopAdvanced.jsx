import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component - Advanced Version
 * 
 * Features:
 * - Resets scroll position on route change
 * - Smooth or instant scroll to top
 * - Optional scroll offset (for fixed headers)
 * - Excludes specific routes if needed
 * 
 * Props:
 * - smooth (boolean): Use smooth scroll animation. Default: false
 * - offset (number): Scroll offset in pixels. Default: 0
 * - excludeRoutes (array): Routes to exclude from scroll reset. Default: []
 */
const ScrollToTopAdvanced = ({ 
  smooth = false, 
  offset = 0, 
  excludeRoutes = [] 
}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Check if current route should be excluded
    if (excludeRoutes.includes(pathname)) {
      return;
    }

    // Scroll to top with optional smooth behavior
    const scrollOptions = {
      top: offset,
      left: 0,
      behavior: smooth ? "smooth" : "auto",
    };

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      window.scrollTo(scrollOptions);
      
      // Also reset scroll on html element (some browsers need this)
      document.documentElement.scrollTop = offset;
      document.body.scrollTop = offset;
    });

    console.log(`✓ Scrolled to top on route change: ${pathname}`);
  }, [pathname, smooth, offset, excludeRoutes]);

  return null;
};

export default ScrollToTopAdvanced;
