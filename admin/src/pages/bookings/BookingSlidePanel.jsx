import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Check, X, Trash2, Copy } from 'lucide-react';
import './bookingSlidePanel.scss';

const BookingSlidePanel = ({ bookingId, isOpen, onClose }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchBooking();
    }
  }, [isOpen, bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:8800/api/bookings/${bookingId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const data = response.data?.data || response.data;
      setBooking(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Thay đổi trạng thái thành ${newStatus}?`)) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:8800/api/bookings/${bookingId}`,
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setBooking(prev => ({ ...prev, status: newStatus }));
      alert('Cập nhật thành công!');
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Hủy đơn và hoàn tiền?')) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `http://localhost:8800/api/bookings/${bookingId}/cancel`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setBooking(prev => ({
        ...prev,
        status: 'cancelled',
        paymentStatus: 'refunded'
      }));
      alert(`Hủy thành công! Hoàn: ${response.data?.data?.refundAmount || booking?.totalAmount} VND`);
    } catch (err) {
      alert(err.response?.data?.message || 'Hủy thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Xóa đơn vĩnh viễn?')) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `http://localhost:8800/api/bookings/${bookingId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      alert('Xóa thành công!');
      onClose();
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Đã sao chép!');
  };

  if (!isOpen) return null;

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A';
  const formatCurrency = (num) => (num || 0).toLocaleString('vi-VN');

  const nights = booking?.dates?.startDate && booking?.dates?.endDate
    ? Math.ceil((new Date(booking.dates.endDate) - new Date(booking.dates.startDate)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <>
      {/* Overlay */}
      <div className={`slide-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />

      {/* Slider Panel */}
      <div className={`slide-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="slide-header">
          <h2>Chi Tiết Đơn Đặt</h2>
          <button className="close-btn" onClick={onClose} title="Đóng">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="slide-content">
          {loading && <div className="loading-state">Đang tải...</div>}

          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchBooking} className="retry-btn">Thử lại</button>
            </div>
          )}

          {booking && !loading && (
            <>
              {/* ID & Status */}
              <div className="info-section">
                <div className="info-group">
                  <label>Mã Đơn</label>
                  <div className="info-value-group">
                    <code>{booking._id}</code>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(booking._id)}
                      title="Sao chép"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                <div className="info-group">
                  <label>Trạng Thái</label>
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="info-section">
                <h3>👤 Khách Hàng</h3>
                <div className="info-group">
                  <label>Tên:</label>
                  <span>{booking.userName || 'N/A'}</span>
                </div>
                <div className="info-group">
                  <label>Chủ Thẻ:</label>
                  <span>{booking.cardholderName || 'N/A'}</span>
                </div>
              </div>

              {/* Hotel Info */}
              {booking.hotelId && typeof booking.hotelId === 'object' && (
                <div className="info-section">
                  <h3>🏨 Khách Sạn</h3>
                  <div className="info-group">
                    <label>Tên:</label>
                    <span>{booking.hotelId.name}</span>
                  </div>
                  <div className="info-group">
                    <label>Thành Phố:</label>
                    <span>{booking.hotelId.city}</span>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="info-section">
                <h3>📅 Thời Gian</h3>
                <div className="info-group">
                  <label>Nhận Phòng:</label>
                  <span>{formatDate(booking.dates?.startDate)}</span>
                </div>
                <div className="info-group">
                  <label>Trả Phòng:</label>
                  <span>{formatDate(booking.dates?.endDate)}</span>
                </div>
                <div className="info-group highlight">
                  <label>Số Đêm:</label>
                  <span>{nights} đêm</span>
                </div>
              </div>

              {/* Rooms */}
              {booking.roomTypes && booking.roomTypes.length > 0 && (
                <div className="info-section">
                  <h3>🛏️ Phòng</h3>
                  {booking.roomTypes.map((room, idx) => {
                    const qty = booking.selectedRooms?.[room._id] || 1;
                    const subtotal = (room.price || 0) * qty * nights;
                    return (
                      <div key={idx} className="room-item">
                        <div className="room-header">
                          <strong>{room.title}</strong>
                          <span className="qty">x{qty}</span>
                        </div>
                        <div className="room-price">
                          {formatCurrency(subtotal)} VND
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Payment Info */}
              <div className="info-section">
                <h3>💰 Thanh Toán</h3>
                <div className="info-group">
                  <label>Tổng Tiền:</label>
                  <span className="amount">{formatCurrency(booking.totalAmount)} VND</span>
                </div>
                <div className="info-group">
                  <label>Trạng Thái:</label>
                  <span className={`badge ${booking.paymentStatus}`}>
                    {booking.paymentStatus === 'completed' ? '✓ Đã thanh toán' : booking.paymentStatus === 'refunded' ? '↩️ Đã hoàn' : 'Chờ'}
                  </span>
                </div>
              </div>

              {/* Refund Info (if cancelled) */}
              {booking.status === 'cancelled' && (
                <div className="info-section refund-section">
                  <h3>🔄 Thông Tin Hoàn Tiền</h3>
                  <div className="card-display">
                    <div className="card-name">{booking.cardholderName || 'Không xác định'}</div>
                    <div className="card-icon">💳</div>
                  </div>
                  <p className="refund-note">⏱️ Hoàn trong 3-5 ngày làm việc</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions Footer */}
        {booking && !loading && (
          <div className="slide-footer">
            {booking.status === 'confirmed' && (
              <button
                className="action-btn complete"
                onClick={() => handleStatusUpdate('completed')}
                disabled={actionLoading}
              >
                <Check size={18} /> Hoàn Thành
              </button>
            )}
            {booking.status !== 'cancelled' && (
              <button
                className="action-btn cancel"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                <X size={18} /> Hủy
              </button>
            )}
            <button
              className="action-btn delete"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              <Trash2 size={18} /> Xóa
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default BookingSlidePanel;
