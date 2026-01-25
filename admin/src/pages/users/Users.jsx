import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Search, RefreshCw, Lock, Unlock, Shield, Users as UsersIcon, Plus, X } from 'lucide-react';
import './users.scss';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    phone: '',
    city: '',
    country: ''
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8800/api/users', {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Xóa người dùng này?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:8800/api/users/${id}`, {
          method: 'DELETE',
          headers: { authorization: `Bearer ${token}` },
        });
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const toggleDisable = async (user) => {
    const confirmMsg = user.disabled ? 'Mở khóa người dùng này?' : 'Khóa người dùng này?';
    if (!window.confirm(confirmMsg)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8800/api/users/disable/${user._id}`, {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ disabled: !user.disabled }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || res.statusText);
      }
      loadUsers();
    } catch (error) {
      console.error('Error toggling disabled:', error);
      alert('Không thể thay đổi trạng thái người dùng.');
    }
  };

  const toggleAdmin = async (user) => {
    const confirmMsg = user.isAdmin ? 'Hủy quyền admin cho người dùng này?' : 'Cấp quyền admin cho người dùng này?';
    if (!window.confirm(confirmMsg)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8800/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAdmin: !user.isAdmin }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || res.statusText);
      }
      loadUsers();
    } catch (error) {
      console.error('Error toggling admin:', error);
      alert('Không thể thay đổi quyền người dùng.');
    }
  };

  const editUser = (user) => {
    navigate(`/users/${user._id}`);
  };

  const handleAddUser = () => {
    setShowModal(true);
    setFormData({ username: '', email: '', password: '', phone: '', city: '', country: '' });
    setFormError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ username: '', email: '', password: '', phone: '', city: '', country: '' });
    setFormError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setFormError('Vui lòng nhập tên đăng nhập');
      return false;
    }
    if (!formData.email.trim()) {
      setFormError('Vui lòng nhập email');
      return false;
    }
    if (!formData.email.includes('@')) {
      setFormError('Email không hợp lệ');
      return false;
    }
    if (!formData.password.trim()) {
      setFormError('Vui lòng nhập mật khẩu');
      return false;
    }
    if (formData.password.length < 6) {
      setFormError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (!formData.phone.trim()) {
      setFormError('Vui lòng nhập số điện thoại');
      return false;
    }
    if (!formData.city.trim()) {
      setFormError('Vui lòng nhập thành phố');
      return false;
    }
    if (!formData.country.trim()) {
      setFormError('Vui lòng nhập quốc gia');
      return false;
    }
    return true;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8800/api/auth/register', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Không thể tạo người dùng');
      }

      loadUsers();
      handleCloseModal();
      alert('Tạo người dùng mới thành công!');
    } catch (error) {
      console.error('Error creating user:', error);
      setFormError(error.message || 'Lỗi khi tạo người dùng');
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="users-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <UsersIcon size={32} />
          </div>
          <div>
            <h1>Quản Lý Người Dùng</h1>
            <p>Quản lý và kiểm soát các tài khoản người dùng của hệ thống</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <p className="stat-label">Tổng người dùng</p>
            <p className="stat-value">{users.length}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="page-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button onClick={loadUsers} className="btn-refresh">
          <RefreshCw size={18} />
          <span>Làm mới</span>
        </button>
        <button onClick={handleAddUser} className="btn-add-user">
          <Plus size={18} />
          <span>Thêm người dùng</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải danh sách người dùng...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <UsersIcon size={48} />
          </div>
          <h3>Không tìm thấy người dùng</h3>
          <p>Không có người dùng nào phù hợp với tìm kiếm của bạn</p>
        </div>
      ) : (
        <div className="users-container">
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Người Dùng</th>
                  <th>Email</th>
                  <th>Trạng Thái</th>
                  <th>Quyền Hạn</th>
                  <th>Ngày Tạo</th>
                  <th className="actions-header">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user._id} className={user.disabled ? 'disabled-row' : ''}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                        <div className="user-info">
                          <p className="user-name">{user.username}</p>
                          <p className="user-email">{user.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="email-text">{user.email || 'N/A'}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.disabled ? 'status-disabled' : 'status-active'}`}>
                        {user.disabled ? 'Bị khóa' : 'Hoạt động'}
                      </span>
                    </td>
                    <td>
                      {user.isAdmin ? (
                        <span className="admin-badge">
                          <Shield size={14} /> Admin
                        </span>
                      ) : (
                        <span className="user-badge">Người dùng</span>
                      )}
                    </td>
                    <td>
                      <span className="date-text">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                    </td>
                    <td>
                      <div className="actions-group">
                        <button
                          className={`action-btn ${user.disabled ? 'btn-unlock' : 'btn-lock'}`}
                          onClick={() => toggleDisable(user)}
                          title={user.disabled ? 'Mở khóa' : 'Khóa'}
                        >
                          {user.disabled ? <Unlock size={16} /> : <Lock size={16} />}
                        </button>
                        <button
                          className={`action-btn ${user.isAdmin ? 'btn-shield-off' : 'btn-shield'}`}
                          onClick={() => toggleAdmin(user)}
                          title={user.isAdmin ? 'Hủy quyền admin' : 'Cấp quyền admin'}
                        >
                          <Shield size={16} />
                        </button>
                        <button
                          className="action-btn btn-edit"
                          onClick={() => editUser(user)}
                          title="Sửa"
                        >
                          ✎
                        </button>
                        <button
                          className="action-btn btn-delete"
                          onClick={() => deleteUser(user._id)}
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filteredUsers.length > 0 && (
        <div className="page-footer">
          <div className="footer-info">
            <p>Hiển thị <strong>{startIndex + 1}</strong>-<strong>{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</strong> trên <strong>{filteredUsers.length}</strong> người dùng</p>
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ← Trang trước
              </button>
              <span className="pagination-info">Trang {currentPage}/{totalPages}</span>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Trang sau →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Thêm Người Dùng */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm Người Dùng Mới</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="modal-form">
              <div className="form-group">
                <label htmlFor="username">Tên Đăng Nhập *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Nhập tên đăng nhập"
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ email"
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật Khẩu *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Số Điện Thoại *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại"
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">Thành Phố *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Nhập thành phố"
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Quốc Gia *</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Nhập quốc gia"
                  disabled={formLoading}
                />
              </div>

              {formError && (
                <div className="form-error">
                  <p>{formError}</p>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                  disabled={formLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={formLoading}
                >
                  {formLoading ? 'Đang tạo...' : 'Tạo Người Dùng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
