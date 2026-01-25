import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, RefreshCw, Building2, Star, MapPin, DollarSign } from 'lucide-react';
import './hotels.scss';

const Hotels = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8800/api/hotels', {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHotels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHotel = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8800/api/hotels/${id}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      });
      setHotels(hotels.filter(h => h._id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting hotel:', error);
    }
  };

  const toggleFeatured = async (id, current) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8800/api/hotels/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ featured: !current }),
      });
      const updated = await res.json();
      setHotels(prev => prev.map(h => (h._id === id ? updated : h)));
    } catch (err) {
      console.error('Error updating featured:', err);
    }
  };

  const filteredHotels = hotels
    .filter(h =>
      h.name?.toLowerCase().includes(search.toLowerCase()) ||
      h.city?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'city') return a.city.localeCompare(b.city);
      if (sortBy === 'price') return (a.cheapestPrice || 0) - (b.cheapestPrice || 0);
      return 0;
    });

  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHotels = filteredHotels.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="hotels-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <Building2 size={32} />
          </div>
          <div>
            <h1>Quản Lý Khách Sạn</h1>
            <p>Quản lý tất cả các tài sản khách sạn của bạn</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <p className="stat-label">Tổng khách sạn</p>
            <p className="stat-value">{hotels.length}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="page-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc thành phố..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button onClick={loadHotels} className="btn-refresh">
          <RefreshCw size={18} />
          <span>Làm mới</span>
        </button>
        <button onClick={() => navigate('/hotels/new')} className="btn-add-hotel">
          <Plus size={18} />
          <span>Thêm khách sạn</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải danh sách khách sạn...</p>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Building2 size={48} />
          </div>
          <h3>Không tìm thấy khách sạn</h3>
          <p>Không có khách sạn nào phù hợp với tìm kiếm của bạn</p>
        </div>
      ) : (
        <div className="hotels-grid">
          {paginatedHotels.map((hotel) => (
            <div key={hotel._id} className="hotel-card">
              <div className="hotel-image-container">
                {hotel.photos && hotel.photos.length > 0 ? (
                  <>
                    <img
                      src={hotel.photos[0]}
                      alt={hotel.name}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="image-overlay">
                      <button
                        className="view-details-btn"
                        onClick={() => navigate(`/hotels/${hotel._id}?mode=view`)}
                      >
                        Xem Chi Tiết
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="no-image">📸</div>
                )}
              </div>
              <div className="hotel-card-content">
                <h3 className="hotel-name">{hotel.name}</h3>
                <div className="hotel-meta">
                  <span className="type-badge">{hotel.type}</span>
                  <div className="city-info">
                    <MapPin size={14} />
                    <span>{hotel.city}</span>
                  </div>
                </div>
                <div className="hotel-details">
                  <div className="price-detail">
                    <span className="label">Giá/Đêm:</span>
                    <span className="value">
                      <DollarSign size={14} />
                      {hotel.cheapestPrice || 'N/A'}
                    </span>
                  </div>
                  <div className="rating-detail">
                    <span className="label">Sao:</span>
                    <span className="value">
                      <Star size={14} fill="#fbbf24" color="#fbbf24" />
                      {hotel.star || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="hotel-actions">
                  <button
                    className={`action-btn btn-featured ${hotel.featured ? 'active' : 'inactive'}`}
                    onClick={() => toggleFeatured(hotel._id, hotel.featured)}
                    title={hotel.featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                  >
                    <Star size={18} />
                    <span>{hotel.featured ? 'Nổi bật' : ""}</span>
                  </button>

                  <button
                    className="action-btn btn-edit"
                    onClick={() => navigate(`/hotels/${hotel._id}?mode=edit`)}
                    title="Sửa"
                  >
                    <Edit size={18} />
                    <span>Sửa</span>
                  </button>
                  <button
                    className="action-btn btn-delete"
                    onClick={() => setDeleteConfirm(hotel._id)}
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredHotels.length > 0 && (
        <div className="page-footer">
          <div className="footer-info">
            <p>Hiển thị <strong>{startIndex + 1}</strong>-<strong>{Math.min(startIndex + itemsPerPage, filteredHotels.length)}</strong> trên <strong>{filteredHotels.length}</strong> khách sạn</p>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Xác nhận xóa</h2>
            </div>
            <div className="modal-body">
              <p>Bạn chắc chắn muốn xóa khách sạn này? Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Hủy
              </button>
              <button className="btn-delete-confirm" onClick={() => deleteHotel(deleteConfirm)}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hotels;
