import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import './login.scss';

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8800/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.details));
        setIsAuthenticated(true);
        navigate('/');
      } else {
        setError(data.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối đến server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container-admin">
        {/* Decorative Elements */}
        <div className="decoration-blob blob-1"></div>
        <div className="decoration-blob blob-2"></div>

        {/* Main Card */}
        <div className="login-card-admin">
          {/* Header */}
          <div className="login-header-admin">
            <h1 className="title">Quản Lý Khách Sạn</h1>
            <p className="subtitle">Admin Dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form-admin">
            {/* Error Alert */}
            {error && (
              <div className="error-alert-admin">
                <span className="error-icon">⚠</span>
                <p>{error}</p>
              </div>
            )}

            {/* Username Field */}
            <div className="form-group-admin">
              <label htmlFor="username" className="form-label-admin">
                Tên Đăng Nhập
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                className="form-input-admin"
                required
              />
            </div>

            {/* Password Field */}
            <div className="form-group-admin">
              <label htmlFor="password" className="form-label-admin">
                Mật Khẩu
              </label>
              <div className="password-wrapper-admin">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="form-input-admin password-input-admin"
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn-admin"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-login-admin"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-admin"></div>
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng Nhập Admin'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer-admin">
            <p>🔒 Quản lý khách sạn - Vui lòng đăng nhập với tài khoản của bạn</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

