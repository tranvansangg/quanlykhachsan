import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './userDetail.scss';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    country: '',
    city: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8800/api/users/${id}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFormData({
        username: data.username || '',
        email: data.email || '',
        country: data.country || '',
        city: data.city || '',
        phone: data.phone || '',
        password: '', // Don't load the actual password
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      alert('Lỗi khi tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8800/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Cập nhật người dùng thành công!');
        navigate('/users');
      } else {
        const errorData = await res.json();
        alert(`Lỗi: ${errorData.message || 'Lỗi khi lưu người dùng'}`);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert(`Lỗi khi lưu người dùng: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="user-detail">
      {/* Header */}
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/users')}>
          <ArrowLeft size={20} />
          Quay Lại
        </button>
        <h1>✏️ Sửa Thông Tin Người Dùng</h1>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="user-form">
                {/* Basic Information */}
                <div className="form-section">
                  <h2>Thông Tin Cơ Bản</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tên Đăng Nhập</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Nhập tên đăng nhập"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Nhập email"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="form-section">
                  <h2>Thông Tin Địa Chỉ</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Quốc Gia</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Nhập quốc gia"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Thành Phố</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Nhập thành phố"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="form-section">
                  <h2>Thông Tin Liên Hệ</h2>
                  <div className="form-group">
                    <label>Số Điện Thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="form-section">
                  <h2>Bảo Mật</h2>
                  <div className="form-group">
                    <label>Mật Khẩu <span style={{ color: '#999', fontSize: '12px' }}>(để trống nếu không muốn đổi)</span></label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu mới (tùy chọn)"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="form-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => navigate('/users')}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              </form>
            )}
    </div>
  );
};

export default UserDetail;
