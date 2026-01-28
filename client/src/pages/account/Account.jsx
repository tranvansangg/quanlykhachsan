import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { AuthContext } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapPin,
  faKey,
  faCheck,
  faTimes,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "../../utils/axiosInstance";
import "./account.css";

const Account = () => {
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateProfile = () => {
    const newErrors = {};
    if (!formData.username?.trim()) newErrors.username = "Tên người dùng không được để trống";
    if (!formData.email?.trim()) newErrors.email = "Email không được để trống";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (formData.phone && !/^[0-9\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }
    return newErrors;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!passwordData.oldPassword?.trim()) newErrors.oldPassword = "Mật khẩu hiện tại không được để trống";
    if (!passwordData.newPassword?.trim()) newErrors.newPassword = "Mật khẩu mới không được để trống";
    if (passwordData.newPassword?.length < 6) newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    return newErrors;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const newErrors = validateProfile();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.put(`/users/${user._id}`, formData);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: response.data
      });
      setMessage({ type: "success", text: "Cập nhật hồ sơ thành công!" });
      setIsEditing(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Lỗi cập nhật hồ sơ" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const newErrors = validatePassword();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(`/users/${user._id}/change-password`, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setIsChangingPassword(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Lỗi đổi mật khẩu" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="account-container">
        <div className="account-wrapper">
          {/* Message Alerts */}
          {message && (
            <div className={`message-alert message-${message.type}`}>
              <div className="message-content">
                <FontAwesomeIcon icon={message.type === "success" ? faCheck : faTimes} />
                <span>{message.text}</span>
              </div>
            </div>
          )}

          <div className="account-grid">
            {/* Profile Section */}
            <div className="account-section">
              <div className="section-header">
                <h2>Thông tin cá nhân</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="edit-btn"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    <span>Chỉnh sửa</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="account-form">
                  <div className="form-group">
                    <label>
                      <FontAwesomeIcon icon={faUser} />
                      <span>Tên người dùng</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={errors.username ? "error" : ""}
                    />
                    {errors.username && <span className="error-text">{errors.username}</span>}
                  </div>

                  <div className="form-group">
                    <label>
                      <FontAwesomeIcon icon={faEnvelope} />
                      <span>Email</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? "error" : ""}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label>
                      <FontAwesomeIcon icon={faPhone} />
                      <span>Số điện thoại</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+84 xxx xxx xxx"
                      className={errors.phone ? "error" : ""}
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label>
                      <FontAwesomeIcon icon={faMapPin} />
                      <span>Địa chỉ</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Số nhà, đường phố"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FontAwesomeIcon icon={faMapPin} />
                      <span>Thành phố</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Tên thành phố"
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          username: user?.username || "",
                          email: user?.email || "",
                          phone: user?.phone || "",
                          address: user?.address || "",
                          city: user?.city || "",
                        });
                        setErrors({});
                      }}
                      className="btn-secondary"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info">
                  <div className="info-row">
                    <div className="info-label">
                      <FontAwesomeIcon icon={faUser} />
                      <span>Tên người dùng</span>
                    </div>
                    <div className="info-value">{user.username}</div>
                  </div>

                  <div className="info-row">
                    <div className="info-label">
                      <FontAwesomeIcon icon={faEnvelope} />
                      <span>Email</span>
                    </div>
                    <div className="info-value">{user.email}</div>
                  </div>

                  <div className="info-row">
                    <div className="info-label">
                      <FontAwesomeIcon icon={faPhone} />
                      <span>Số điện thoại</span>
                    </div>
                    <div className="info-value">{user.phone || "Chưa cập nhật"}</div>
                  </div>

                  <div className="info-row">
                    <div className="info-label">
                      <FontAwesomeIcon icon={faMapPin} />
                      <span>Địa chỉ</span>
                    </div>
                    <div className="info-value">{user.address || "Chưa cập nhật"}</div>
                  </div>

                  <div className="info-row">
                    <div className="info-label">
                      <FontAwesomeIcon icon={faMapPin} />
                      <span>Thành phố</span>
                    </div>
                    <div className="info-value">{user.city || "Chưa cập nhật"}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Security Section */}
            <div className="account-section">
              <div className="section-header">
                <h2>Bảo mật</h2>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="edit-btn"
                  >
                    <FontAwesomeIcon icon={faKey} />
                    <span>Đổi mật khẩu</span>
                  </button>
                )}
              </div>

              {isChangingPassword ? (
                <form onSubmit={handleChangePassword} className="account-form">
                  <div className="form-group">
                    <label>
                      <FontAwesomeIcon icon={faKey} />
                      <span>Mật khẩu hiện tại</span>
                    </label>
                    <input
                      type="password"
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      className={errors.oldPassword ? "error" : ""}
                    />
                    {errors.oldPassword && <span className="error-text">{errors.oldPassword}</span>}
                  </div>

                  <div className="form-group">
                    <label>
                      <FontAwesomeIcon icon={faKey} />
                      <span>Mật khẩu mới</span>
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={errors.newPassword ? "error" : ""}
                    />
                    {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
                  </div>

                  <div className="form-group">
                    <label>
                      <FontAwesomeIcon icon={faKey} />
                      <span>Xác nhận mật khẩu mới</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={errors.confirmPassword ? "error" : ""}
                    />
                    {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                        setErrors({});
                      }}
                      className="btn-secondary"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="security-info">
                  <div className="security-card">
                    <div className="security-icon">
                      <FontAwesomeIcon icon={faKey} />
                    </div>
                    <div className="security-content">
                      <h3>Mật khẩu</h3>
                      <p>Đổi mật khẩu để bảo vệ tài khoản của bạn</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
