import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import PaymentForm from "../../components/payment/PaymentForm";
import axiosInstance from "../../utils/axiosInstance";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimes, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import "./payment.css";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const bookingData = location.state?.bookingData;
  const selectedRooms = location.state?.selectedRooms;
  const totalAmount = location.state?.totalAmount;
  const hotelId = location.state?.hotelId;
  const dates = location.state?.dates;
  const roomsInfo = location.state?.roomsInfo;

  if (!user) {
    navigate("/login");
    return null;
  }

  if (!bookingData || !selectedRooms || !totalAmount) {
    return (
      <div>
        <Navbar />
        <div className="paymentErrorContainer">
          <h2>Có lỗi xảy ra</h2>
          <p>Không tìm thấy thông tin đặt phòng</p>
          <button onClick={() => navigate(-1)} className="backBtn">
            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const handlePaymentSubmit = async (cardData) => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Save booking to database
      const booking = {
        hotelId,
        userId: user._id,
        userName: user.username,
        roomTypes: bookingData,
        selectedRooms: Object.fromEntries(Object.entries(selectedRooms)),
        totalAmount,
        dates: {
          startDate: dates[0]?.startDate,
          endDate: dates[0]?.endDate,
        },
        cardholderName: cardData.cardholderName,
        paymentDate: new Date(),
        status: "confirmed",
      };

      console.log("Sending booking:", booking);
      
      const response = await axiosInstance.post("/bookings", booking);

      console.log("Booking response:", response);

      if (response.status === 201 || response.data.success) {
        setPaymentStatus("success");
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 3000);
      } else {
        throw new Error("Lỗi từ server");
      }
    } catch (error) {
      console.error("Payment error:", error);
      console.error("Error response:", error.response?.data);
      const errMsg = error.response?.data?.message || error.message || "Thanh toán thất bại";
      setErrorMessage(errMsg);
      setPaymentStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    if (!dates || !dates[0]) return 0;
    const start = new Date(dates[0].startDate);
    const end = new Date(dates[0].endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  return (
    <div>
      <Navbar />

      <div className="paymentContainer">
        <div className="paymentContent">
          {paymentStatus === "success" ? (
            <div className="paymentSuccess">
              <div className="successIcon">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <h2>Thanh toán thành công!</h2>
              <p>Đơn đặt phòng của bạn đã được xác nhận</p>
              <div className="bookingDetails">
                <div className="detailRow">
                  <span>Mã đơn:</span>
                  <strong>{`ORD-${Date.now()}`}</strong>
                </div>
                <div className="detailRow">
                  <span>Tổng tiền:</span>
                  <strong className="amount">{totalAmount.toLocaleString('vi-VN')} VND</strong>
                </div>
                <div className="detailRow">
                  <span>Số đêm:</span>
                  <strong>{nights} đêm</strong>
                </div>
              </div>
              <p className="redirectMsg">Đang chuyển hướng về trang chủ...</p>
            </div>
          ) : paymentStatus === "failed" ? (
            <div className="paymentFailed">
              <div className="failedIcon">
                <FontAwesomeIcon icon={faTimes} />
              </div>
              <h2>Thanh toán thất bại</h2>
              <p>{errorMessage || "Vui lòng thử lại"}</p>
              <button
                onClick={() => {
                  setPaymentStatus(null);
                  setErrorMessage("");
                }}
                className="retryBtn"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <PaymentForm
                totalAmount={totalAmount}
                roomsInfo={roomsInfo}
                onSubmit={handlePaymentSubmit}
                loading={loading}
              />

              <div className="paymentSummary">
                <h3>Tóm tắt đơn hàng</h3>

                <div className="summarySection">
                  <h4>Thông tin khách sạn</h4>
                  <div className="summaryRow">
                    <span>Khách hàng:</span>
                    <strong>{user.username}</strong>
                  </div>
                  <div className="summaryRow">
                    <span>Số đêm:</span>
                    <strong>{nights} đêm</strong>
                  </div>
                </div>

                <div className="summarySection">
                  <h4>Phòng đã chọn</h4>
                  <div className="roomsList">
                    {bookingData.map((room) => (
                      <div key={room._id} className="roomSummaryItem">
                        <div className="roomSummaryInfo">
                          <span className="roomName">{room.title}</span>
                          <span className="roomPrice">
                            {room.price.toLocaleString('vi-VN')} VND / đêm
                          </span>
                        </div>
                        <div className="roomQuantity">
                          <span className="quantity">
                            {selectedRooms[room._id]} phòng
                          </span>
                          <span className="subtotal">
                            {(room.price * selectedRooms[room._id] * nights).toLocaleString('vi-VN')} VND
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="summaryTotal">
                  <span>Tổng tiền:</span>
                  <span className="totalAmount">
                    {totalAmount.toLocaleString('vi-VN')} VND
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Payment;
