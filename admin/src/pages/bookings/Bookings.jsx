import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Eye, Filter } from 'lucide-react';
import BookingSlidePanel from './BookingSlidePanel';
import './bookings.scss';

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [slidePanelOpen, setSlidePanelOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
    // Removed auto-refresh to improve performance
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Run auto-complete in parallel with fetching bookings (non-blocking)
      const autoCompletePromise = axios.post('http://localhost:8800/api/bookings/action/auto-complete', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).catch(err => {
        // Auto-complete failures are non-critical
        console.log('Auto-complete request (non-critical):', err.message);
      });
      
      // Fetch bookings immediately
      const response = await axios.get('http://localhost:8800/api/bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Auto-complete can happen in background
      autoCompletePromise.then(() => {
        console.log('Auto-complete finished');
      });

      // If response is array, use it directly; if it has data property, use that
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi lấy đơn đặt:', err);
      setError('Không thể lấy danh sách đơn đặt');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn đặt này?')) return;

    try {
      await axios.delete(
        `http://localhost:8800/api/bookings/${bookingId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setBookings(bookings.filter(b => b._id !== bookingId));
      if (selectedBookingId === bookingId) {
        setSlidePanelOpen(false);
      }
    } catch (err) {
      console.error('Lỗi khi xóa đơn đặt:', err);
      alert('Không thể xóa đơn đặt');
    }
  };

  const handleOpenDetail = (bookingId) => {
    setSelectedBookingId(bookingId);
    setSlidePanelOpen(true);
  };

  const handleCloseSlide = () => {
    setSlidePanelOpen(false);
    setSelectedBookingId(null);
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchSearch =
      booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking._id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed': return 'Đã thanh toán';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return 'Chờ xử lý';
    }
  };

  if (loading) return <div className="bookings-loader">Đang tải...</div>;

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h1>Quản Lý Đơn Đặt Phòng</h1>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Tổng đơn:</span>
            <span className="stat-value">{bookings.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Đã thanh toán:</span>
            <span className="stat-value">{bookings.filter(b => b.status === 'confirmed').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Đã hủy:</span>
            <span className="stat-value cancelled">{bookings.filter(b => b.status === 'cancelled').length}</span>
          </div>
        </div>
      </div>

      <div className="bookings-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên khách hoặc ID đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={20} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="confirmed">Đã thanh toán</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="bookings-list">
        {filteredBookings.length === 0 ? (
          <div className="no-data">Không có đơn đặt nào</div>
        ) : (
          <table className="bookings-table">
            <thead>
              <tr>
                <th>ID Đơn</th>
                <th>Khách Hàng</th>
                <th>Ngày Đặt</th>
                <th>Nhận Phòng</th>
                <th>Trả Phòng</th>
                <th>Tổng Tiền</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="booking-row">
                  <td className="booking-id">
                    <button
                      onClick={() => handleOpenDetail(booking._id)}
                      className="id-link"
                      title="Xem chi tiết đơn đặt"
                    >
                      <code>{booking._id.slice(-8).toUpperCase()}</code>
                    </button>
                  </td>
                  <td className="booking-customer">
                    <div className="customer-info">
                      <strong>{booking.userName}</strong>
                      <small>{booking.cardholderName || 'N/A'}</small>
                    </div>
                  </td>
                  <td>
                    {new Date(booking.paymentDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    {booking.dates?.startDate
                      ? new Date(booking.dates.startDate).toLocaleDateString('vi-VN')
                      : 'N/A'
                    }
                  </td>
                  <td>
                    {booking.dates?.endDate
                      ? new Date(booking.dates.endDate).toLocaleDateString('vi-VN')
                      : 'N/A'
                    }
                  </td>
                  <td className="booking-amount">
                    <strong>{booking.totalAmount.toLocaleString('vi-VN')} VND</strong>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </td>
                  <td className="booking-actions">
                    <button
                      className="btn-view"
                      onClick={() => handleOpenDetail(booking._id)}
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => deleteBooking(booking._id)}
                      title="Xóa đơn"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Booking Detail Slide Panel */}
      <BookingSlidePanel 
        bookingId={selectedBookingId}
        isOpen={slidePanelOpen}
        onClose={handleCloseSlide}
      />
    </div>
  );
};

export default Bookings;
