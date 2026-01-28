import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard, faCalendarDays, faLock } from "@fortawesome/free-solid-svg-icons";
import "./payment.css";

const PaymentForm = ({ totalAmount, roomsInfo, onSubmit, loading }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState({});

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
  };

  const formatExpiryDate = (value) => {
    value = value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }
    return value;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!cardNumber.replace(/\s/g, "")) {
      newErrors.cardNumber = "Vui lòng nhập số thẻ";
    } else if (cardNumber.replace(/\s/g, "").length !== 16) {
      newErrors.cardNumber = "Số thẻ phải có 16 chữ số";
    }

    if (!cardholderName.trim()) {
      newErrors.cardholderName = "Vui lòng nhập tên chủ thẻ";
    }

    if (!expiryDate) {
      newErrors.expiryDate = "Vui lòng nhập ngày hết hạn";
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = "Định dạng: MM/YY";
    }

    if (!cvv) {
      newErrors.cvv = "Vui lòng nhập CVV";
    } else if (cvv.length !== 3) {
      newErrors.cvv = "CVV phải có 3 chữ số";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        cardNumber: cardNumber.replace(/\s/g, ""),
        cardholderName,
        expiryDate,
        cvv,
      });
    }
  };

  return (
    <div className="paymentFormContainer">
      <div className="paymentCard">
        <h3 className="paymentTitle">Thông tin thẻ tín dụng</h3>

        <form onSubmit={handleSubmit} className="paymentForm">
          {/* Card Preview */}
          <div className="cardPreview">
            <div className="cardFront">
              <div className="cardChip"></div>
              <div className="cardNumber">
                {cardNumber || "•••• •••• •••• ••••"}
              </div>
              <div className="cardInfo">
                <div className="cardField">
                  <span className="cardLabel">Chủ thẻ</span>
                  <span className="cardValue">{cardholderName.toUpperCase() || "Tên chủ thẻ"}</span>
                </div>
                <div className="cardField">
                  <span className="cardLabel">HSD</span>
                  <span className="cardValue">{expiryDate || "MM/YY"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="formGroup">
            <label htmlFor="cardNumber" className="formLabel">
              <FontAwesomeIcon icon={faCreditCard} /> Số thẻ
            </label>
            <input
              type="text"
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength="19"
              className={`formInput ${errors.cardNumber ? "error" : ""}`}
            />
            {errors.cardNumber && (
              <span className="errorText">{errors.cardNumber}</span>
            )}
          </div>

          <div className="formGroup">
            <label htmlFor="cardholderName" className="formLabel">
              Tên chủ thẻ
            </label>
            <input
              type="text"
              id="cardholderName"
              placeholder="VD: Nguyễn Văn A"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className={`formInput ${errors.cardholderName ? "error" : ""}`}
            />
            {errors.cardholderName && (
              <span className="errorText">{errors.cardholderName}</span>
            )}
          </div>

          <div className="formRow">
            <div className="formGroup flex1">
              <label htmlFor="expiryDate" className="formLabel">
                <FontAwesomeIcon icon={faCalendarDays} /> Ngày hết hạn
              </label>
              <input
                type="text"
                id="expiryDate"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={handleExpiryChange}
                maxLength="5"
                className={`formInput ${errors.expiryDate ? "error" : ""}`}
              />
              {errors.expiryDate && (
                <span className="errorText">{errors.expiryDate}</span>
              )}
            </div>

            <div className="formGroup flex1">
              <label htmlFor="cvv" className="formLabel">
                <FontAwesomeIcon icon={faLock} /> CVV
              </label>
              <input
                type="password"
                id="cvv"
                placeholder="•••"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                maxLength="3"
                className={`formInput ${errors.cvv ? "error" : ""}`}
              />
              {errors.cvv && (
                <span className="errorText">{errors.cvv}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="paymentSubmitBtn"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : `Thanh toán ${totalAmount.toLocaleString('vi-VN')} VND`}
          </button>
        </form>

        <div className="securityInfo">
          <FontAwesomeIcon icon={faLock} /> Thanh toán an toàn với mã hóa SSL
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
