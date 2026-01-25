import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faUser,
  faSignOut,
  faSignIn,
  faHeart,
  faCog,
  faStar,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./src/context/AuthContext";
import ServiceTabs from "./src/components/serviceTabs/ServiceTabs";
import "./navbar.css";

const Navbar = () => {
  const { user, dispatch } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showStickyTabs, setShowStickyTabs] = useState(false);
  const navigate = useNavigate();

  // IntersectionObserver để track header visibility
  useEffect(() => {
    const headerElement = document.getElementById("headerHero");
    if (!headerElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Nếu header còn visible => ẩn sticky tabs
        // Nếu header ra khỏi viewport => hiển thị sticky tabs
        setShowStickyTabs(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(headerElement);

    return () => observer.disconnect();
  }, []);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
    setShowDropdown(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 border-b border-blue-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar Row */}
        <div className="py-3 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-85 transition-opacity"
          >
            <span className="hidden sm:block text-xl font-bold text-white font-display">HotelBook.com</span>
          </button>



          {/* Right Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                {/* Notification */}
                <button className="relative p-2 text-white hover:text-yellow-300 transition-colors hidden sm:flex items-center gap-2">
                  <FontAwesomeIcon icon={faBell} className="text-lg" />
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">3</span>
                </button>

                {/* Favorites */}
                <button
                  onClick={() => navigate("/favorites")}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 text-white hover:text-yellow-300 transition-colors"
                >
                  <FontAwesomeIcon icon={faHeart} className="text-lg" />
                  <span className="text-sm font-medium">Yêu thích</span>
                </button>

                {/* User Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-500 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-blue-900 font-bold text-sm">
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-white">{user.username}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-blue-200 overflow-hidden animate-scale-in origin-top-right">
                      {/* Header */}
                      <div className="px-4 py-4 bg-gradient-to-r from-blue-600 to-blue-500 border-b border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-blue-900 font-bold">
                            {user.username?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{user.username}</p>
                            <p className="text-xs text-blue-100">{user.email || "email@example.com"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={() => { navigate("/account"); setShowDropdown(false); }}
                          className="w-full px-4 py-2 flex items-center gap-3 text-slate-700 hover:bg-blue-50 transition-colors"
                        >
                          <FontAwesomeIcon icon={faUser} className="text-sm text-blue-600" />
                          <span className="text-sm">Tài khoản của tôi</span>
                        </button>
                        <button
                          onClick={() => { navigate("/bookings"); setShowDropdown(false); }}
                          className="w-full px-4 py-2 flex items-center gap-3 text-slate-700 hover:bg-blue-50 transition-colors"
                        >
                          <FontAwesomeIcon icon={faHeart} className="text-sm text-blue-600" />
                          <span className="text-sm">Đơn đặt phòng</span>
                        </button>
                        <button
                          onClick={() => { navigate("/favorites"); setShowDropdown(false); }}
                          className="w-full px-4 py-2 flex items-center gap-3 text-slate-700 hover:bg-blue-50 transition-colors"
                        >
                          <FontAwesomeIcon icon={faStar} className="text-sm text-blue-600" />
                          <span className="text-sm">Danh sách yêu thích</span>
                        </button>
                        <button
                          onClick={() => { navigate("/settings"); setShowDropdown(false); }}
                          className="w-full px-4 py-2 flex items-center gap-3 text-slate-700 hover:bg-blue-50 transition-colors"
                        >
                          <FontAwesomeIcon icon={faCog} className="text-sm text-blue-600" />
                          <span className="text-sm">Cài đặt</span>
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-slate-200 py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FontAwesomeIcon icon={faSignOut} className="text-sm" />
                          <span className="text-sm font-medium">Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="hidden sm:flex btn-primary-outline gap-2 items-center border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all"
                >
                  <FontAwesomeIcon icon={faSignIn} className="text-sm" />
                  <span>Đăng nhập</span>
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="btn-primary text-sm bg-yellow-400 text-blue-900 hover:bg-yellow-300 transition-all font-semibold"
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sticky Service Tabs - Hiển thị khi header ra khỏi viewport */}
        {showStickyTabs && (
          <div className="border-t border-blue-700 bg-white bg-opacity-95 backdrop-blur-sm">
            <ServiceTabs sticky={true} />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
