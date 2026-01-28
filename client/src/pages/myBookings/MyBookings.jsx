import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faBed, faDollarSign, faClock, faCheckCircle, faTimes, faHotel } from '@fortawesome/free-solid-svg-icons';
import './myBookings.css';

const MyBookings = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setError('Vui lòng đăng nhập để xem booking');
      setLoading(false);
      return;
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8800/api/bookings/user/${user._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi lấy booking:', err);
      setError('Không thể lấy danh sách booking của bạn');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'confirmed': return 'Đã Thanh Toán';
      case 'completed': return 'Đã Hoàn Thành';
      case 'cancelled': return 'Đã Hủy';
      default: return 'Chờ Xử Lý';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed': return faCheckCircle;
      case 'completed': return faCheckCircle;
      case 'cancelled': return faTimes;
      default: return faClock;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const calculateNights = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const isBookingExpired24h = (booking) => {
    if (!booking.paymentDate && !booking.createdAt) return false;
    
    const createdTime = new Date(booking.paymentDate || booking.createdAt).getTime();
    const now = new Date().getTime();
    const hoursPassed = (now - createdTime) / (1000 * 60 * 60);
    
    return hoursPassed > 24;
  };

  const getHoursRemaining = (booking) => {
    if (!booking.paymentDate && !booking.createdAt) return 0;
    
    const createdTime = new Date(booking.paymentDate || booking.createdAt).getTime();
    const now = new Date().getTime();
    const hoursPassed = (now - createdTime) / (1000 * 60 * 60);
    const remaining = Math.max(0, Math.ceil(24 - hoursPassed));
    
    return remaining;
  };

  const cancelBooking = async () => {
    try {
      setCancelLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `http://localhost:8800/api/bookings/${selectedBooking._id}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        alert(`Hủy phòng thành công!\nSố tiền hoàn lại: ${response.data.data.refundAmount.toLocaleString('vi-VN')} VND\nTiền sẽ được hoàn lại trong 3-5 ngày làm việc`);
        setShowCancelModal(false);
        setSelectedBooking(null);
        fetchBookings();
      } else {
        alert('Không thể hủy booking');
      }
    } catch (err) {
      console.error('Lỗi khi hủy booking:', err);
      alert(err.response?.data?.message || 'Lỗi khi hủy booking');
    } finally {
      setCancelLoading(false);
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="myBookingsContainer">
          <div className="loginPrompt">
            <h2>Vui lòng đăng nhập</h2>
            <p>Bạn cần đăng nhập để xem lịch sử booking của mình</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        
        <div className="myBookingsContainer">
          <div className="bookingsHeader">
            <h1>Lịch Sử Đặt Phòng</h1>
            <p className="subtitle">Quản lý và theo dõi các booking của bạn</p>
          </div>

          <div className="bookingsControls">
            <div className="filterButtons">
              <button className="filterBtn" style={{ opacity: 0.5 }}>
                Tất Cả (0)
              </button>
              <button className="filterBtn" style={{ opacity: 0.5 }}>
                Đã Thanh Toán (0)
              </button>
              <button className="filterBtn" style={{ opacity: 0.5 }}>
                Hoàn Thành (0)
              </button>
              <button className="filterBtn" style={{ opacity: 0.5 }}>
                Đã Hủy (0)
              </button>
            </div>
          </div>

          <div className="bookingsList">
            <div className="bookingsGrid">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="bookingCard skeletonCard">
                  <div className="cardHeader skeletonCardHeader">
                    <div className="hotelInfo">
                      <div className="skeletonLine" style={{ width: '60%', height: '20px' }}></div>
                    </div>
                    <div className="skeletonLine" style={{ width: '80px', height: '24px', borderRadius: '20px' }}></div>
                  </div>

                  <div className="cardBody skeletonCardBody">
                    <div className="bookingGrid">
                      <div className="bookingItem">
                        <div className="skeletonLine" style={{ width: '100%', height: '14px', marginBottom: '8px' }}></div>
                        <div className="skeletonLine" style={{ width: '80%', height: '16px' }}></div>
                      </div>

                      <div className="bookingItem">
                        <div className="skeletonLine" style={{ width: '100%', height: '14px', marginBottom: '8px' }}></div>
                        <div className="skeletonLine" style={{ width: '70%', height: '16px' }}></div>
                      </div>

                      <div className="bookingItem">
                        <div className="skeletonLine" style={{ width: '100%', height: '14px', marginBottom: '8px' }}></div>
                        <div className="skeletonLine" style={{ width: '70%', height: '16px' }}></div>
                      </div>

                      <div className="bookingItem">
                        <div className="skeletonLine" style={{ width: '100%', height: '14px', marginBottom: '8px' }}></div>
                        <div className="skeletonLine" style={{ width: '50%', height: '16px' }}></div>
                      </div>

                      <div className="bookingItem full-width">
                        <div className="skeletonLine" style={{ width: '100%', height: '14px', marginBottom: '8px' }}></div>
                        <div className="skeletonLine" style={{ width: '60%', height: '20px' }}></div>
                      </div>
                    </div>

                    <div className="bookingCode">
                      <div className="skeletonLine" style={{ width: '100%', height: '16px' }}></div>
                    </div>
                  </div>

                  <div className="cardFooter skeletonCardFooter">
                    <div className="skeletonLine" style={{ width: '100px', height: '32px', borderRadius: '6px' }}></div>
                    <div className="skeletonLine" style={{ width: '120px', height: '14px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <div className="myBookingsContainer">
        <div className="bookingsHeader">
          <h1>Lịch Sử Đặt Phòng</h1>
          <p className="subtitle">Quản lý và theo dõi các booking của bạn</p>
        </div>

        <div className="bookingsControls">
          <div className="filterButtons">
            <button
              className={`filterBtn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              Tất Cả ({bookings.length})
            </button>
            <button
              className={`filterBtn ${filterStatus === 'confirmed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('confirmed')}
            >
              Đã Thanh Toán ({bookings.filter(b => b.status === 'confirmed').length})
            </button>
            <button
              className={`filterBtn ${filterStatus === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('completed')}
            >
              Hoàn Thành ({bookings.filter(b => b.status === 'completed').length})
            </button>
            <button
              className={`filterBtn ${filterStatus === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilterStatus('cancelled')}
            >
              Đã Hủy ({bookings.filter(b => b.status === 'cancelled').length})
            </button>
          </div>
        </div>

        {error && <div className="errorMessage">{error}</div>}

        <div className="bookingsList">
          {filteredBookings.length === 0 ? (
            <div className="noBookings">
              <FontAwesomeIcon icon={faHotel} className="noBookingsIcon" />
              <h3>Chưa có booking nào</h3>
              <p>Bạn chưa có booking {filterStatus !== 'all' ? 'với trạng thái này' : 'nào'}. Hãy đặt phòng ngay!</p>
            </div>
          ) : (
            <div className="bookingsGrid">
              {filteredBookings.map((booking) => {
                const nights = calculateNights(booking.dates?.startDate, booking.dates?.endDate);
                const hotelName = booking.hotelId?.name || 'Hotel Unknown';

                return (
                  <div key={booking._id} className="bookingCard">
                    <div className="cardHeader">
                      <div className="hotelInfo">
                        <FontAwesomeIcon icon={faHotel} className="hotelIcon" />
                        <h3 className="hotelName">{hotelName}</h3>
                      </div>
                      <span className={`statusBadge ${getStatusColor(booking.status)}`}>
                        <FontAwesomeIcon icon={getStatusIcon(booking.status)} />
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>

                    <div className="cardBody">
                      <div className="bookingGrid">
                        {/* Room Type */}
                        <div className="bookingItem">
                          <div className="itemLabel">
                            <FontAwesomeIcon icon={faBed} />
                            Loại Phòng
                          </div>
                          <div className="itemValue">
                            {booking.roomTypes && booking.roomTypes.length > 0 ? (
                              <div className="roomsList">
                                {booking.roomTypes.map((room, idx) => {
                                  const qty = booking.selectedRooms?.[room._id] || 1;
                                  return (
                                    <div key={idx} className="roomItem">
                                      <span className="roomName">{room.title}</span>
                                      <span className="roomQty">x{qty}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <span>N/A</span>
                            )}
                          </div>
                        </div>

                        {/* Check-in */}
                        <div className="bookingItem">
                          <div className="itemLabel">
                            <FontAwesomeIcon icon={faCalendar} />
                            Nhận Phòng
                          </div>
                          <div className="itemValue">
                            {booking.dates?.startDate 
                              ? formatDate(booking.dates.startDate)
                              : 'N/A'
                            }
                          </div>
                        </div>

                        {/* Check-out */}
                        <div className="bookingItem">
                          <div className="itemLabel">
                            <FontAwesomeIcon icon={faCalendar} />
                            Trả Phòng
                          </div>
                          <div className="itemValue">
                            {booking.dates?.endDate 
                              ? formatDate(booking.dates.endDate)
                              : 'N/A'
                            }
                          </div>
                        </div>

                        {/* Nights */}
                        <div className="bookingItem">
                          <div className="itemLabel">
                            <FontAwesomeIcon icon={faClock} />
                            Số Đêm
                          </div>
                          <div className="itemValue">{nights} đêm</div>
                        </div>

                        {/* Total Price */}
                        <div className="bookingItem full-width highlight">
                          <div className="itemLabel">
                            <FontAwesomeIcon icon={faDollarSign} />
                            Tổng Tiền
                          </div>
                          <div className="itemValue totalPrice">
                            {booking.totalAmount.toLocaleString('vi-VN')} VND
                          </div>
                        </div>
                      </div>

                      {/* Booking Code */}
                      <div className="bookingCode">
                        <span>Mã Đơn: <code>{booking._id.slice(-8).toUpperCase()}</code></span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="cardFooter">
                      <button 
                        className="detailBtn"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        Xem Chi Tiết
                      </button>
                      <span className="bookDate">
                        Đặt ngày {formatDate(booking.paymentDate)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="detailModal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="detailModal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h2>Chi Tiết Booking</h2>
              <button className="closeBtn" onClick={() => setSelectedBooking(null)}>✕</button>
            </div>

            <div className="modalBody">
              {/* Hotel Info */}
              <div className="modalSection">
                <h3>Thông Tin Khách Sạn</h3>
                <div className="infoGrid">
                  <div className="infoItem">
                    <label>Tên Khách Sạn:</label>
                    <span>
                      {typeof selectedBooking.hotelId === 'object' 
                        ? (selectedBooking.hotelId?.name || 'N/A')
                        : (selectedBooking.hotelId || 'N/A')
                      }
                    </span>
                  </div>
                  <div className="infoItem">
                    <label>Địa Chỉ:</label>
                    <span>
                      {typeof selectedBooking.hotelId === 'object'
                        ? (selectedBooking.hotelId?.address || 'N/A')
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Info */}
              <div className="modalSection">
                <h3>Thông Tin Đặt Phòng</h3>
                <div className="infoGrid">
                  <div className="infoItem">
                    <label>Mã Đơn:</label>
                    <code>{selectedBooking._id}</code>
                  </div>
                  <div className="infoItem">
                    <label>Trạng Thái:</label>
                    <span className={`status-text ${getStatusColor(selectedBooking.status)}`}>
                      {getStatusLabel(selectedBooking.status)}
                    </span>
                  </div>
                  <div className="infoItem">
                    <label>Ngày Đặt:</label>
                    <span>{formatDate(selectedBooking.paymentDate)}</span>
                  </div>
                </div>
              </div>

              {/* Room Details */}
              <div className="modalSection">
                <h3>Phòng Đã Đặt</h3>
                <div className="roomsGrid">
                  {selectedBooking.roomTypes && selectedBooking.roomTypes.length > 0 ? (
                    selectedBooking.roomTypes.map((room, idx) => {
                      const qty = selectedBooking.selectedRooms?.[room._id] || 1;
                      const nights = calculateNights(
                        selectedBooking.dates?.startDate,
                        selectedBooking.dates?.endDate
                      );
                      const subtotal = room.price * qty * nights;

                      return (
                        <div key={idx} className="roomDetail">
                          <div className="roomHeader">
                            <strong>{room.title}</strong>
                            <span className="roomQtyBadge">x{qty}</span>
                          </div>
                          <div className="roomInfo">
                            <p>Giá: {room.price.toLocaleString('vi-VN')} VND/đêm</p>
                            <p>Số đêm: {nights}</p>
                            <p className="subtotal">
                              Thành tiền: {subtotal.toLocaleString('vi-VN')} VND
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>Không có thông tin phòng</p>
                  )}
                </div>
              </div>

              {/* Stay Info */}
              <div className="modalSection">
                <h3>Thời Gian Ở</h3>
                <div className="infoGrid">
                  <div className="infoItem">
                    <label>Nhận Phòng:</label>
                    <span>
                      {selectedBooking.dates?.startDate 
                        ? formatDate(selectedBooking.dates.startDate)
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="infoItem">
                    <label>Trả Phòng:</label>
                    <span>
                      {selectedBooking.dates?.endDate 
                        ? formatDate(selectedBooking.dates.endDate)
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="infoItem">
                    <label>Số Đêm:</label>
                    <span>
                      {calculateNights(
                        selectedBooking.dates?.startDate,
                        selectedBooking.dates?.endDate
                      )} đêm
                    </span>
                  </div>
                </div>
              </div>

              {/* Guest Info */}
              <div className="modalSection">
                <h3>Thông Tin Khách Hàng</h3>
                <div className="infoGrid">
                  <div className="infoItem">
                    <label>Tên Đăng Nhập:</label>
                    <span>
                      {typeof selectedBooking.userName === 'string' 
                        ? selectedBooking.userName 
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="infoItem">
                    <label>Tên Chủ Thẻ:</label>
                    <span>
                      {typeof selectedBooking.cardholderName === 'string'
                        ? selectedBooking.cardholderName
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Refund Info - Show only if cancelled */}
              {selectedBooking.status === 'cancelled' && (
                <div className="modalSection refundSection">
                  <h3>🔄 Thông Tin Hoàn Tiền</h3>
                  <div className="infoGrid">
                    <div className="infoItem">
                      <label>Trạng Thái Hoàn Tiền:</label>
                      <span className="refundStatus">
                        {selectedBooking.paymentStatus === 'refunded' ? '✓ Đã Hoàn' : 'Chờ xử lý'}
                      </span>
                    </div>
                    <div className="infoItem">
                      <label>Số Tiền Hoàn:</label>
                      <strong className="refundAmount">
                        {selectedBooking.totalAmount.toLocaleString('vi-VN')} VND
                      </strong>
                    </div>
                    {selectedBooking.cancelDate && (
                      <div className="infoItem">
                        <label>Ngày Hủy:</label>
                        <span>{formatDate(selectedBooking.cancelDate)}</span>
                      </div>
                    )}
                  </div>
                  <p className="refundNote">
                    💡 Tiền hoàn sẽ được xử lý trong 3-5 ngày làm việc từ ngày hủy.
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="modalSection totalSection">
                <h3>Tổng Cộng</h3>
                <div className="totalAmount">
                  <span className="label">Tổng Tiền:</span>
                  <span className="amount">
                    {selectedBooking.totalAmount.toLocaleString('vi-VN')} VND
                  </span>
                </div>
              </div>
            </div>

            <div className="modalFooter">
              {selectedBooking.status === 'confirmed' && (
                <>
                  {isBookingExpired24h(selectedBooking) ? (
                    <div className="expired-notice">
                      ⏰ Thời gian hủy đơn đã hết (quá 24 giờ từ lúc đặt)
                    </div>
                  ) : (
                    <button 
                      className="cancelBookingBtn"
                      onClick={() => setShowCancelModal(true)}
                      title={`Bạn còn ${getHoursRemaining(selectedBooking)} giờ để hủy đơn`}
                    >
                      Hủy Đặt Phòng ({getHoursRemaining(selectedBooking)}h còn)
                    </button>
                  )}
                </>
              )}
              <button 
                className="closeModalBtn"
                onClick={() => setSelectedBooking(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="cancelModal-overlay" onClick={() => !cancelLoading && setShowCancelModal(false)}>
          <div className="cancelModal" onClick={(e) => e.stopPropagation()}>
            <div className="cancelModalHeader">
              <h2>Xác Nhận Hủy Đặt Phòng</h2>
              <button 
                className="closeBtn" 
                onClick={() => !cancelLoading && setShowCancelModal(false)}
                disabled={cancelLoading}
              >
                ✕
              </button>
            </div>

            <div className="cancelModalBody">
              <div className="warningBox">
                <p className="warningTitle">⚠️ Lưu Ý Quan Trọng</p>
                <p>Bạn đang yêu cầu hủy đặt phòng này. Sau khi hủy:</p>
                <ul>
                  <li>Trạng thái booking sẽ chuyển thành "Đã Hủy"</li>
                  <li>Tiền sẽ được hoàn lại trong 3-5 ngày làm việc</li>
                  <li>Hành động này không thể hoàn tác</li>
                </ul>
              </div>

              <div className="refundInfo">
                <h3>Thông Tin Hoàn Tiền</h3>
                <div className="refundDetails">
                  <div className="refundItem">
                    <span className="refundLabel">Mã Đơn:</span>
                    <code>{selectedBooking._id}</code>
                  </div>
                  <div className="refundItem">
                    <span className="refundLabel">Khách Sạn:</span>
                    <span>
                      {typeof selectedBooking.hotelId === 'object'
                        ? (selectedBooking.hotelId?.name || 'N/A')
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="refundItem">
                    <span className="refundLabel">Số Tiền Hoàn:</span>
                    <span className="refundAmount">
                      {selectedBooking.totalAmount.toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="cancelModalFooter">
              <button 
                className="confirmCancelBtn"
                onClick={cancelBooking}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Đang xử lý...' : 'Xác Nhận Hủy'}
              </button>
              <button 
                className="cancelCancelBtn"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelLoading}
              >
                Giữ Lại Booking
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyBookings;
