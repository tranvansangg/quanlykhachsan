import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Check, X, Trash2 } from 'lucide-react';
import './bookingDetail.scss';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    console.log('BookingDetail mounted, id:', id);
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      console.log('Fetching booking with id:', id);
      const response = await axios.get(
        `http://localhost:8800/api/bookings/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      console.log('API Response:', response);
      const data = response.data?.data || response.data;
      console.log('Extracted booking data:', data);
      setBooking(data);
    } catch (err) {
      console.error('Fetch error:', err);
      console.error('Error details:', err.response?.data);
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
        `http://localhost:8800/api/bookings/${id}`,
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
        `http://localhost:8800/api/bookings/${id}/cancel`,
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
        `http://localhost:8800/api/bookings/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      alert('Xóa thành công!');
      navigate('/admin/bookings');
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="booking-detail-container"><div className="loading">Đang tải...</div></div>;
  
  if (error || !booking) {
    return (
      <div className="booking-detail-container">
        <button className="back-button" onClick={() => navigate('/admin/bookings')}>
          <ArrowLeft size={20} /> Quay lại
        </button>
        <div className="error-box">{error || 'Không tìm thấy'}</div>
      </div>
    );
  }

  const nights = booking.dates?.startDate && booking.dates?.endDate
    ? Math.ceil((new Date(booking.dates.endDate) - new Date(booking.dates.startDate)) / (1000 * 60 * 60 * 24))
    : 0;

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A';
  const formatCurrency = (num) => (num || 0).toLocaleString('vi-VN');

  return (
    <div className="booking-detail-container">
      <div className="detail-header">
        <button className="back-button" onClick={() => navigate('/admin/bookings')}>
          <ArrowLeft size={20} /> Quay lại
        </button>
        <h1>Chi Tiết Đơn Đặt</h1>
        <div></div>
      </div>

      <div className="detail-content">
        <div className="detail-left">
          {/* Customer Info */}
          <div className="detail-card">
            <div className="card-header">
              <h2>👤 Khách Hàng</h2>
            </div>
            <div className="card-body">
              <div className="info-row">
                <label>Tên:</label>
                <span>{booking.userName || 'N/A'}</span>
              </div>
              <div className="info-row">
                <label>Chủ thẻ:</label>
                <span>{booking.cardholderName || 'N/A'}</span>
              </div>
              <div className="info-row">
                <label>ID:</label>
                <code>{typeof booking.userId === 'object' ? booking.userId?._id : booking.userId}</code>
              </div>
              {booking.hotelId && typeof booking.hotelId === 'object' && (
                <>
                  <div className="divider"></div>
                  <div className="info-row">
                    <label>Khách sạn:</label>
                    <span>{booking.hotelId.name}</span>
                  </div>
                  <div className="info-row">
                    <label>Địa chỉ:</label>
                    <span>{booking.hotelId.address}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Rooms */}
          <div className="detail-card">
            <div className="card-header">
              <h2>🛏️ Phòng</h2>
            </div>
            <div className="card-body">
              {booking.roomTypes && booking.roomTypes.length > 0 ? (
                booking.roomTypes.map((room, idx) => {
                  const qty = booking.selectedRooms?.[room._id] || 1;
                  const subtotal = (room.price || 0) * qty * nights;
                  return (
                    <div key={idx} className="room-card">
                      <div className="room-header">
                        <h3>{room.title}</h3>
                        <span className="room-qty">x{qty}</span>
                      </div>
                      {room.description && <p>{room.description}</p>}
                      <div className="room-pricing">
                        <div><span>Giá: {formatCurrency(room.price)} VND/đêm</span></div>
                        <div><span>Đêm: {nights}</span></div>
                        <div><span>Số lượng: {qty}</span></div>
                        <div className="total"><span className="label">Thành tiền:</span> <span>{formatCurrency(subtotal)} VND</span></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>Không có dữ liệu</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="detail-card">
            <div className="card-header">
              <h2>📅 Thời gian</h2>
            </div>
            <div className="card-body">
              <div className="info-row">
                <label>Nhận:</label>
                <span>{formatDate(booking.dates?.startDate)}</span>
              </div>
              <div className="info-row">
                <label>Trả:</label>
                <span>{formatDate(booking.dates?.endDate)}</span>
              </div>
              <div className="info-row highlight">
                <label>Số đêm:</label>
                <span>{nights} đêm</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-right">
          {/* Summary */}
          <div className="detail-card summary-card">
            <div className="card-header">
              <h2>💰 Tóm tắt</h2>
            </div>
            <div className="card-body">
              <div className="summary-item">
                <span className="label">Tổng:</span>
                <span className="value">{formatCurrency(booking.totalAmount)} VND</span>
              </div>
              <div className="summary-item">
                <span className="label">Thanh toán:</span>
                <span className={`badge ${booking.paymentStatus}`}>
                  {booking.paymentStatus === 'completed' ? '✓ Đã thanh toán' : 'Chờ'}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="detail-card">
            <div className="card-header">
              <h2>📊 Trạng thái</h2>
            </div>
            <div className="card-body">
              <div className={`status-display status-${booking.status}`}>
                {booking.status}
              </div>
            </div>
          </div>

          {/* Refund (if cancelled) */}
          {booking.status === 'cancelled' && (
            <div className="detail-card refund-card">
              <div className="card-header">
                <h2>🔄 Hoàn tiền</h2>
              </div>
              <div className="card-body">
                <div className="info-row">
                  <label>Trạng thái:</label>
                  <span className={`badge ${booking.paymentStatus}`}>
                    {booking.paymentStatus === 'refunded' ? '✓ Đã hoàn' : 'Chờ'}
                  </span>
                </div>
                <div className="info-row">
                  <label>Số tiền:</label>
                  <span className="refund-amount">{formatCurrency(booking.totalAmount)} VND</span>
                </div>
                {booking.cancelDate && (
                  <div className="info-row">
                    <label>Ngày hủy:</label>
                    <span>{formatDate(booking.cancelDate)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card Info (if cancelled) - for refund transfer */}
          {booking.status === 'cancelled' && (
            <div className="detail-card card-info-card">
              <div className="card-header refund">
                <h2>💳 Thông Tin Thẻ Hoàn Tiền</h2>
              </div>
              <div className="card-body">
                <p className="info-note">Chuyển tiền hoàn lại vào thẻ sau:</p>
                <div className="card-display">
                  <div className="card-holder-name">{booking.cardholderName || 'Không xác định'}</div>
                  <div className="card-icon">💳</div>
                </div>
                <div className="info-row">
                  <label>Chủ thẻ:</label>
                  <span className="card-holder">{booking.cardholderName || 'N/A'}</span>
                </div>
                <p className="transfer-note">
                  ⏱️ Tiền sẽ được hoàn vào tài khoản của chủ thẻ trong <strong>3-5 ngày làm việc</strong>
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="detail-card actions-card">
            <div className="card-header">
              <h2>⚙️ Hành động</h2>
            </div>
            <div className="card-body actions-body">
              {booking.status === 'confirmed' && (
                <button
                  className="action-button complete"
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={actionLoading}
                >
                  <Check size={18} /> Hoàn thành
                </button>
              )}
              {booking.status !== 'cancelled' && (
                <button
                  className="action-button cancel"
                  onClick={handleCancel}
                  disabled={actionLoading}
                >
                  <X size={18} /> Hủy
                </button>
              )}
              <button
                className="action-button delete"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                <Trash2 size={18} /> Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
