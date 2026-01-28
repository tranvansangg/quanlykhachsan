import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, X, Check, AlertCircle } from 'lucide-react';
import './bookingDetailSidebar.scss';

const BookingDetailSidebar = ({ bookingId, isOpen, onClose }) => {
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

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A';
  const formatCurrency = (num) => (num || 0).toLocaleString('vi-VN');

  const nights = booking?.dates?.startDate && booking?.dates?.endDate
    ? Math.ceil((new Date(booking.dates.endDate) - new Date(booking.dates.startDate)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`booking-detail-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <h2>Chi Tiết Đơn Đặt</h2>
          <button className="close-btn" onClick={onClose} title="Đóng">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="sidebar-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Đang tải...</p>
            </div>
          ) : error || !booking ? (
            <div className="error-state">
              <AlertCircle size={48} />
              <p>{error || 'Không tìm thấy đơn đặt'}</p>
              <button className="btn-close" onClick={onClose}>Đóng</button>
            </div>
          ) : (
            <>
              {/* Booking ID & Status */}
              <div className="section">
                <div className="section-label">Mã Đơn</div>
                <code className="booking-id-code">{booking._id.slice(-8).toUpperCase()}</code>
                <div className="status-badge-container">
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status === 'confirmed' ? '✓ Đã thanh toán' : booking.status === 'completed' ? '✓ Hoàn thành' : '✗ Đã hủy'}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="section">
                <div className="section-label">👤 Khách Hàng</div>
                <div className="info-item">
                  <span className="label">Tên:</span>
                  <span className="value">{booking.userName}</span>
                </div>
                <div className="info-item">
                  <span className="label">Chủ thẻ:</span>
                  <span className="value">{booking.cardholderName || 'N/A'}</span>
                </div>
              </div>

              {/* Hotel Info */}
              {booking.hotelId && typeof booking.hotelId === 'object' && (
                <div className="section">
                  <div className="section-label">🏨 Khách Sạn</div>
                  <div className="info-item">
                    <span className="label">Tên:</span>
                    <span className="value">{booking.hotelId.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Thành phố:</span>
                    <span className="value">{booking.hotelId.city}</span>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="section">
                <div className="section-label">📅 Thời Gian</div>
                <div className="info-item">
                  <span className="label">Nhận phòng:</span>
                  <span className="value">{formatDate(booking.dates?.startDate)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Trả phòng:</span>
                  <span className="value">{formatDate(booking.dates?.endDate)}</span>
                </div>
                <div className="info-item highlight">
                  <span className="label">Số đêm:</span>
                  <span className="value">{nights} đêm</span>
                </div>
              </div>

              {/* Rooms */}
              {booking.roomTypes && booking.roomTypes.length > 0 && (
                <div className="section">
                  <div className="section-label">🛏️ Phòng</div>
                  {booking.roomTypes.map((room, idx) => {
                    const qty = booking.selectedRooms?.[room._id] || 1;
                    const subtotal = (room.price || 0) * qty * nights;
                    return (
                      <div key={idx} className="room-item">
                        <div className="room-title">{room.title} x{qty}</div>
                        <div className="room-detail">
                          {room.price && <span>{formatCurrency(room.price)} VND/đêm</span>}
                          {subtotal > 0 && <span className="subtotal">{formatCurrency(subtotal)} VND</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Payment Summary */}
              <div className="section payment-summary">
                <div className="summary-item">
                  <span className="label">Tổng tiền:</span>
                  <span className="amount">{formatCurrency(booking.totalAmount)} VND</span>
                </div>
                <div className="summary-item">
                  <span className="label">Trạng thái thanh toán:</span>
                  <span className={`payment-status ${booking.paymentStatus}`}>
                    {booking.paymentStatus === 'completed' ? '✓ Đã thanh toán' : booking.paymentStatus === 'refunded' ? '↩️ Đã hoàn' : 'Chờ'}
                  </span>
                </div>
              </div>

              {/* Card Info if Cancelled */}
              {booking.status === 'cancelled' && (
                <div className="section card-info-section">
                  <div className="section-label">💳 Thông Tin Hoàn Tiền</div>
                  <div className="card-display">
                    <div className="card-holder-name">{booking.cardholderName || 'Không xác định'}</div>
                  </div>
                  <p className="refund-note">Tiền sẽ hoàn trong 3-5 ngày làm việc</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        {booking && !loading && (
          <div className="sidebar-footer">
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
                ✗ Hủy Đơn
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default BookingDetailSidebar;
