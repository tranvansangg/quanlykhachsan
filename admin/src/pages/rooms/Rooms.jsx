import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, RefreshCw, Bed, DollarSign, X } from 'lucide-react';
import './rooms.scss';

const Rooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterHotel, setFilterHotel] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Load rooms
      const roomsRes = await fetch('http://localhost:8800/api/rooms', {
        headers: { authorization: `Bearer ${token}` },
      });
      const roomsData = await roomsRes.json();
      setRooms(Array.isArray(roomsData) ? roomsData : []);

      // Load hotels for filter
      const hotelsRes = await fetch('http://localhost:8800/api/hotels', {
        headers: { authorization: `Bearer ${token}` },
      });
      const hotelsData = await hotelsRes.json();
      setHotels(Array.isArray(hotelsData) ? hotelsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const room = rooms.find(r => r._id === id);
      const hotelId = room?.hotelId?._id || room?.hotelId;

      if (!hotelId) {
        alert('Không tìm thấy hotelId cho phòng này. Không thể xóa.');
        setDeleteConfirm(null);
        return;
      }

      const res = await fetch(`http://localhost:8800/api/rooms/${id}/${hotelId}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await (async () => {
          try { return (await res.json()).message || JSON.stringify(await res.json()); } catch { return await res.text(); }
        })();
        throw new Error(text || `${res.status} ${res.statusText}`);
      }

      setRooms(rooms.filter(r => r._id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Lỗi khi xóa phòng: ' + (error.message || error));
    }
  };

  const filteredRooms = rooms
    .filter(r => {
      const matchesSearch = r.title?.toLowerCase().includes(search.toLowerCase()) || r.desc?.toLowerCase().includes(search.toLowerCase());
      const matchesHotel = !filterHotel || r.hotelId?._id === filterHotel;
      return matchesSearch && matchesHotel;
    });

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRooms = filteredRooms.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="rooms-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <Bed size={32} />
          </div>
          <div>
            <h1>Quản Lý Phòng</h1>
            <p>Quản lý tất cả các phòng khách sạn</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <p className="stat-label">Tổng phòng</p>
            <p className="stat-value">{rooms.length}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="page-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mô tả phòng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filterHotel}
          onChange={(e) => setFilterHotel(e.target.value)}
        >
          <option value="">Tất cả khách sạn</option>
          {hotels.map(h => (
            <option key={h._id} value={h._id}>{h.name}</option>
          ))}
        </select>

        <button onClick={loadData} className="btn-refresh">
          <RefreshCw size={18} />
          <span>Làm mới</span>
        </button>
        <button onClick={() => navigate('/rooms/new')} className="btn-add-room">
          <Plus size={18} />
          <span>Thêm phòng</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛏️</div>
          <h3>Chưa có phòng nào</h3>
          <p>Hãy thêm phòng đầu tiên của bạn</p>
          <button
            onClick={() => navigate('/rooms/new')}
            className="btn btn-primary"
          >
            <Plus size={18} />
            Thêm Phòng
          </button>
        </div>
      ) : (
        <div className="rooms-grid">
          {paginatedRooms.map((room) => (
            <div key={room._id} className="room-card">
              <div className="room-image-container">
                {room.photos && room.photos.length > 0 ? (
                  <>
                    <img
                      src={room.photos[0]}
                      alt={room.title}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="image-overlay">
                      <button
                        className="view-details-btn"
                        onClick={() => navigate(`/rooms/${room._id}?mode=view`)}
                      >
                        Xem Chi Tiết
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="no-image">📸</div>
                )}
              </div>
              <div className="room-card-content">
                <h3 className="room-title">{room.title}</h3>
                <p className="room-desc">{room.desc?.substring(0, 80) || 'Không có mô tả'}</p>
                <div className="room-meta">
                  <span className="hotel-badge">{room.hotelId?.name || 'N/A'}</span>
                </div>
                <div className="room-details">
                  <div className="detail-item">
                    <span className="label">Giá/Đêm:</span>
                    <span className="value">
                      <DollarSign size={14} />
                      ${room.price || '0'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Sức chứa:</span>
                    <span className="value">{room.maxPeople || '-'} người</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Phòng:</span>
                    <span className="value">{room.roomNumbers?.length || 0}</span>
                  </div>
                </div>
                <div className="room-actions">
                  <button
                    className="action-btn btn-edit"
                    onClick={() => navigate(`/rooms/${room._id}?mode=edit`)}
                    title="Chỉnh sửa"
                  >
                    <Edit size={18} />
                    <span>Sửa</span>
                  </button>
                  <button
                    className="action-btn btn-delete"
                    onClick={() => setDeleteConfirm(room._id)}
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

      {!loading && filteredRooms.length > 0 && (
        <div className="page-footer">
          <div className="footer-info">
            <p>Hiển thị <strong>{startIndex + 1}</strong>-<strong>{Math.min(startIndex + itemsPerPage, filteredRooms.length)}</strong> trên <strong>{filteredRooms.length}</strong> phòng</p>
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
          <div className="modal-content">
            <div className="modal-header">
              <h2>Xác nhận xóa phòng</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn chắc chắn muốn xóa phòng này?</p>
              <p className="modal-warning">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-modal cancel" onClick={() => setDeleteConfirm(null)}>
                Hủy
              </button>
              <button
                className="btn-modal delete"
                onClick={() => deleteRoom(deleteConfirm)}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
