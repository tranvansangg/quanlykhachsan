import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import "./forgot-password.css";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: reset password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Step 1: Submit email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email.trim()) {
      setError("Email không được để trống");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Email không hợp lệ");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:8800/api/auth/forgot-password", {
        email,
      });
      setSuccess("Mã OTP đã được gửi đến email của bạn!");
      setTimeout(() => {
        setStep(2);
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Email không được tìm thấy");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!otp.trim()) {
      setError("Mã OTP không được để trống");
      setLoading(false);
      return;
    }

    if (otp.length < 4) {
      setError("Mã OTP phải có ít nhất 4 ký tự");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:8800/api/auth/verify-otp", {
        email,
        otp,
      });
      setSuccess("Xác minh OTP thành công!");
      setTimeout(() => {
        setStep(3);
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Mã OTP không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!newPassword.trim()) {
      setError("Mật khẩu mới không được để trống");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:8800/api/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      setSuccess("Đặt lại mật khẩu thành công! Đang chuyển hướng...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="forgot-password-card">
            {/* Header */}
            <div className="forgot-password-header">
              <h1 className="forgot-password-title">Đặt Lại Mật Khẩu</h1>
              <p className="forgot-password-subtitle">
                {step === 1 && "Nhập email của bạn để nhận mã xác minh"}
                {step === 2 && "Nhập mã OTP được gửi đến email"}
                {step === 3 && "Tạo mật khẩu mới của bạn"}
              </p>
            </div>

            {/* Step Indicator */}
            <div className="step-indicator">
              <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
              <div className={`step-line ${step >= 2 ? "active" : ""}`}></div>
              <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
              <div className={`step-line ${step >= 3 ? "active" : ""}`}></div>
              <div className={`step ${step >= 3 ? "active" : ""}`}>3</div>
            </div>

            {/* Step 1: Email */}
            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="forgot-password-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                  />
                </div>

                {error && (
                  <div className="error-alert">
                    <span className="error-icon">⚠</span>
                    <p>{error}</p>
                  </div>
                )}

                {success && (
                  <div className="success-alert">
                    <span className="success-icon">✓</span>
                    <p>{success}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Đang gửi...
                    </>
                  ) : (
                    "Gửi Mã OTP"
                  )}
                </button>
              </form>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <form onSubmit={handleOtpSubmit} className="forgot-password-form">
                <div className="form-group">
                  <label htmlFor="otp" className="form-label">
                    Mã OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    placeholder="Nhập mã OTP (4-6 ký tự)"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="form-input"
                  />
                  <p className="hint-text">Mã OTP đã được gửi đến {email}</p>
                </div>

                {error && (
                  <div className="error-alert">
                    <span className="error-icon">⚠</span>
                    <p>{error}</p>
                  </div>
                )}

                {success && (
                  <div className="success-alert">
                    <span className="success-icon">✓</span>
                    <p>{success}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Đang xác minh...
                    </>
                  ) : (
                    "Xác Minh OTP"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="back-btn"
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> Quay Lại
                </button>
              </form>
            )}

            {/* Step 3: Reset Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="forgot-password-form">
                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">
                    Mật Khẩu Mới
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Xác Nhận Mật Khẩu
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                  />
                </div>

                {error && (
                  <div className="error-alert">
                    <span className="error-icon">⚠</span>
                    <p>{error}</p>
                  </div>
                )}

                {success && (
                  <div className="success-alert">
                    <span className="success-icon">✓</span>
                    <p>{success}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Đang cập nhật...
                    </>
                  ) : (
                    "Đặt Lại Mật Khẩu"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="back-btn"
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> Quay Lại
                </button>
              </form>
            )}

            {/* Footer */}
            <div className="forgot-password-footer">
              <p>
                Nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
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

export default ForgotPassword;
