import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/navbar/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./login.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { loading, error, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    dispatch({ type: "LOGIN_START" });
    try {
      const res = await axios.post("http://localhost:8800/api/auth/login", credentials);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { ...res.data.details, isAdmin: res.data.isAdmin }
      });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: err.response?.data?.message || "Lỗi đăng nhập",
      });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            {/* Header Card */}
            <div className="login-card-header">
              <h1 className="login-title">Đăng Nhập</h1>
              <p className="login-subtitle">Chào mừng bạn quay lại HotelBook</p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleClick} className="login-form">
              {/* Username Field */}
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập của bạn"
                  id="username"
                  onChange={handleChange}
                  value={credentials.username}
                  className="form-input"
                />
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Mật khẩu
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu của bạn"
                    id="password"
                    onChange={handleChange}
                    value={credentials.password}
                    className="form-input password-input"
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                    />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-alert">
                  <span className="error-icon">⚠</span>
                  <p>{typeof error === 'string' ? error : error.message || "Lỗi đăng nhập. Vui lòng thử lại."}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                disabled={loading}
                type="submit"
                className="login-btn"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng Nhập"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="login-card-footer">
              <p className="signup-link">
                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
              </p>
              <p className="forgot-password-link">
                <Link to="/forgot-password">Quên mật khẩu?</Link>
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="decoration-blob blob-1"></div>
          <div className="decoration-blob blob-2"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
