import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
    country: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validation
    if (!formData.username.trim()) {
      setError("Tên đăng nhập không được để trống");
      setLoading(false);
      return;
    }
    if (formData.username.length < 3) {
      setError("Tên đăng nhập phải có ít nhất 3 ký tự");
      setLoading(false);
      return;
    }
    if (!formData.email.trim()) {
      setError("Email không được để trống");
      setLoading(false);
      return;
    }
    if (!formData.email.includes("@")) {
      setError("Email không hợp lệ");
      setLoading(false);
      return;
    }
    if (!formData.password.trim()) {
      setError("Mật khẩu không được để trống");
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setLoading(false);
      return;
    }
    if (!formData.phone.trim()) {
      setError("Số điện thoại không được để trống");
      setLoading(false);
      return;
    }
    if (!formData.city.trim()) {
      setError("Thành phố không được để trống");
      setLoading(false);
      return;
    }
    if (!formData.country.trim()) {
      setError("Quốc gia không được để trống");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8800/api/auth/register",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          city: formData.city,
          country: formData.country,
        }
      );
      setSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi đăng ký. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <div className="register-page">
        <div className="register-container">
          <div className="register-card">
            {/* Header Card */}
            <div className="register-card-header">
              <h1 className="register-title">Đăng Ký</h1>
              <p className="register-subtitle">Tham gia HotelBook để tìm khách sạn tuyệt vời</p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="register-form">
              {/* Username Field */}
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập (tối thiểu 3 ký tự)"
                  id="username"
                  name="username"
                  onChange={handleChange}
                  value={formData.username}
                  className="form-input"
                />
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  id="email"
                  name="email"
                  onChange={handleChange}
                  value={formData.email}
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
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    id="password"
                    name="password"
                    onChange={handleChange}
                    value={formData.password}
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

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Xác nhận mật khẩu
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    id="confirmPassword"
                    name="confirmPassword"
                    onChange={handleChange}
                    value={formData.confirmPassword}
                    className="form-input password-input"
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEyeSlash : faEye}
                    />
                  </button>
                </div>
              </div>

              {/* Phone Field */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  id="phone"
                  name="phone"
                  onChange={handleChange}
                  value={formData.phone}
                  className="form-input"
                />
              </div>

              {/* City and Country in One Row */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city" className="form-label">
                    Thành phố
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập thành phố"
                    id="city"
                    name="city"
                    onChange={handleChange}
                    value={formData.city}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="country" className="form-label">
                    Quốc gia
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập quốc gia"
                    id="country"
                    name="country"
                    onChange={handleChange}
                    value={formData.country}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-alert">
                  <span className="error-icon">⚠</span>
                  <p>{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="success-alert">
                  <span className="success-icon">✓</span>
                  <p>{success}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                disabled={loading}
                type="submit"
                className="register-btn"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Đang đăng ký...
                  </>
                ) : (
                  "Đăng Ký"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="register-card-footer">
              <p className="login-link">
                Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
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

export default Register;
