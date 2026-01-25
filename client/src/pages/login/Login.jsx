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
    <>
      <Navbar />
      <div className="login">
        <div className="loginWrapper">
          <div className="loginForm">
            <h1 className="loginTitle">Đăng nhập</h1>
            <p className="loginSubtitle">Chào mừng bạn quay lại HotelBook</p>

            <form onSubmit={handleClick} className="form">
              <div className="formGroup">
                <label htmlFor="username">Tên đăng nhập</label>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập của bạn"
                  id="username"
                  onChange={handleChange}
                  value={credentials.username}
                  className="formInput"
                />
              </div>

              <div className="formGroup">
                <label htmlFor="password">Mật khẩu</label>
                <div className="passwordWrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu của bạn"
                    id="password"
                    onChange={handleChange}
                    value={credentials.password}
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

              {error && (
                <div className="errorMessage">
                  <p>{error.message || "Lỗi đăng nhập. Vui lòng thử lại."}</p>
                </div>
              )}

              <button
                disabled={loading}
                type="submit"
                className="submitBtn"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <div className="divider">
              <span>hoặc</span>
            </div>

            <div className="socialLogin">
              <button className="socialBtn google">
                <span>🔵</span> Đăng nhập với Google
              </button>
              <button className="socialBtn facebook">
                <span>📘</span> Đăng nhập với Facebook
              </button>
            </div>

            <div className="loginFooter">
              <p>
                Chưa có tài khoản?{" "}
                <Link to="/register" className="signupLink">
                  Đăng ký ngay
                </Link>
              </p>
              <p>
                <a href="#" className="forgotLink">
                  Quên mật khẩu?
                </a>
              </p>
            </div>
          </div>

          <div className="loginImage">
            <img
              src="https://cf.bstatic.com/static/img/theme-index/flights_v2/search_flights_new_one_hero_blue_340x428.webp"
              alt="Login"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
