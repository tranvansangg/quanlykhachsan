import { useState, useContext } from "react";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { AuthContext } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faShield,
  faCheck,
  faClock,
  faTrash,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import "./settings.css";

const Settings = () => {
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [settings, setSettings] = useState({
    language: user?.settings?.language || "vi",
  });

  const handleSelectChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await axiosInstance.put(`/users/${user._id}/settings`, { language: settings.language });
      setMessage({ type: "success", text: "Cài đặt đã được lưu thành công!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Lỗi lưu cài đặt" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/users/${user._id}`);
      dispatch({ type: "LOGOUT" });
      navigate("/");
    } catch (error) {
      setMessage({ type: "error", text: "Không thể xóa tài khoản. Vui lòng thử lại!" });
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="settings-container">
        <div className="settings-wrapper">
          {/* Message Alert */}
          {message && (
            <div className={`message-alert message-${message.type}`}>
              <FontAwesomeIcon icon={message.type === "success" ? faCheck : faGlobe} />
              <span>{message.text}</span>
            </div>
          )}

          <div className="settings-header">
            <h1>Cài đặt</h1>
            <p>Quản lý tùy chọn cá nhân của bạn</p>
          </div>

          <div className="settings-grid">
            {/* Language Settings */}
            <div className="settings-card">
              <div className="card-header">
                <FontAwesomeIcon icon={faGlobe} className="card-icon" />
                <h2>Ngôn ngữ</h2>
              </div>
              <div className="settings-options">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Chọn ngôn ngữ</h3>
                    <p>Chọn ngôn ngữ ưa thích của bạn</p>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSelectChange("language", e.target.value)}
                    className="select-input"
                  >
                    <option value="vi">🇻🇳 Tiếng Việt</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="zh">🇨🇳 中文</option>
                    <option value="ja">🇯🇵 日本語</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="settings-card">
              <div className="card-header">
                <FontAwesomeIcon icon={faShield} className="card-icon" />
                <h2>Thông tin tài khoản</h2>
              </div>
              <div className="account-info">
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{user?.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">Tên người dùng:</span>
                  <span className="value">{user?.username}</span>
                </div>
                <div className="info-item">
                  <span className="label">
                    <FontAwesomeIcon icon={faClock} />
                    Tài khoản được tạo:
                  </span>
                  <span className="value">
                    {new Date(user?.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">
                    <FontAwesomeIcon icon={faClock} />
                    Cập nhật lần cuối:
                  </span>
                  <span className="value">
                    {new Date(user?.updatedAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Khách sạn yêu thích:</span>
                  <span className="value">{user?.favorites?.length || 0} khách sạn</span>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="settings-card">
              <div className="card-header">
                <FontAwesomeIcon icon={faKey} className="card-icon" />
                <h2>Bảo mật</h2>
              </div>
              <div className="settings-options">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Đổi mật khẩu</h3>
                    <p>Cập nhật mật khẩu của tài khoản</p>
                  </div>
                  <button
                    onClick={() => navigate("/account")}
                    className="btn-secondary"
                  >
                    Đổi mật khẩu
                  </button>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Trạng thái tài khoản</h3>
                    <p>Tài khoản của bạn đang hoạt động</p>
                  </div>
                  <span className="status-badge active">Hoạt động</span>
                </div>
              </div>
            </div>

            {/* Danger Zone - Delete Account */}
            <div className="settings-card danger-zone">
              <div className="card-header">
                <FontAwesomeIcon icon={faTrash} className="card-icon danger" />
                <h2>Vùng nguy hiểm</h2>
              </div>
              <div className="danger-content">
                <p>Những hành động này không thể hoàn tác. Vui lòng thận trọng!</p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-danger"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  <span>Xóa tài khoản</span>
                </button>
                
                {showDeleteConfirm && (
                  <div className="confirm-dialog">
                    <h3>Bạn chắc chắn muốn xóa tài khoản?</h3>
                    <p>Hành động này sẽ xóa vĩnh viễn tài khoản và tất cả dữ liệu liên quan</p>
                    <div className="confirm-actions">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className="btn-confirm-danger"
                      >
                        {loading ? "Đang xóa..." : "Xóa vĩnh viễn"}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={loading}
                        className="btn-confirm-cancel"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="settings-footer">
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="btn-primary-large"
            >
              {loading ? "Đang lưu..." : "Lưu cài đặt"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Settings;
