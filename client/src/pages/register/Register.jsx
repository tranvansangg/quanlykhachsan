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
    phone: "",
    city: "",
    country: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.username.trim()) {
      setError("Tên đăng nhập không được để trống");
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
        formData
      );
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi đăng ký. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="register">
        <div className="registerWrapper">
          <div className="registerForm">
            <h1 className="registerTitle">Đăng ký tài khoản</h1>
            <p className="registerSubtitle">
              Tham gia HotelBook để tìm khách sạn tuyệt vời
            </p>

            <form onSubmit={handleSubmit} className="form">
              <div className="formGroup">
                <label htmlFor="username">Tên đăng nhập</label>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  id="username"
                  name="username"
                  onChange={handleChange}
                  value={formData.username}
                  className="formInput"
                />
              </div>

              <div className="formGroup">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  id="email"
                  name="email"
                  onChange={handleChange}
                  value={formData.email}
                  className="formInput"
                />
              </div>

              <div className="formGroup">
                <label htmlFor="password">Mật khẩu</label>
                <div className="passwordWrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    id="password"
                    name="password"
                    onChange={handleChange}
                    value={formData.password}
                    className="formInput"
                  />
                  <button
                    type="button"
                    className="togglePassword"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                    />
                  </button>
                </div>
              </div>

              <div className="formGroup">
                <label htmlFor="phone">Số điện thoại</label>
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  id="phone"
                  name="phone"
                  onChange={handleChange}
                  value={formData.phone}
                  className="formInput"
                />
              </div>

              <div className="formGroup">
                <label htmlFor="city">Thành phố</label>
                <input
                  type="text"
                  placeholder="Nhập thành phố"
                  id="city"
                  name="city"
                  onChange={handleChange}
                  value={formData.city}
                  className="formInput"
                />
              </div>

              <div className="formGroup">
                <label htmlFor="country">Quốc gia</label>
                <input
                  type="text"
                  placeholder="Nhập quốc gia"
                  id="country"
                  name="country"
                  onChange={handleChange}
                  value={formData.country}
                  className="formInput"
                />
              </div>

              {error && <div className="errorMessage">{error}</div>}

              <button disabled={loading} type="submit" className="submitBtn">
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </button>
            </form>

            <div className="registerFooter">
              <p>
                Đã có tài khoản?{" "}
                <Link to="/login" className="loginLink">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>

          <div className="registerImage">
            <img
              src="https://cf.bstatic.com/static/img/theme-index/flights_v2/search_flights_new_one_hero_blue_340x428.webp"
              alt="Register"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
