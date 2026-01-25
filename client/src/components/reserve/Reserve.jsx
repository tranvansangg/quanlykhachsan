import useFetch from "../../hooks/useFetch";
import { useContext, useState } from "react";
import { SearchContext } from "../../context/SearchContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBed, faUsers, faX, faChevronLeft, faChevronRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import "./reserve.css";

const Reserve = ({ hotelId, dates: propDates }) => {
  const [selectedRooms, setSelectedRooms] = useState({});
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { data, loading } = useFetch(`/hotels/room/${hotelId}`);
  const { dates: contextDates } = useContext(SearchContext);
  const dates = propDates || contextDates;
  const navigate = useNavigate();

  const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const date = new Date(start.getTime());
    const dateArray = [];

    while (date <= end) {
      dateArray.push(new Date(date).getTime());
      date.setDate(date.getDate() + 1);
    }

    return dateArray;
  };

  const alldates = dates ? getDatesInRange(dates[0].startDate, dates[0].endDate) : [];

  const isAvailable = (roomNumber) => {
    const isFound = roomNumber.unavailableDates.some((date) =>
      alldates.includes(new Date(date).getTime())
    );
    return !isFound;
  };

  const getAvailableCount = (roomNumbers) => {
    return roomNumbers.filter((room) => isAvailable(room)).length;
  };

  const handleSelectChange = (e, roomId) => {
    const value = parseInt(e.target.value);
    setSelectedRooms((prev) => {
      const updated = { ...prev };
      if (value === 0) {
        delete updated[roomId];
      } else {
        updated[roomId] = value;
      }
      return updated;
    });
  };

  const getTotalPrice = (item) => {
    const quantity = selectedRooms[item._id] || 0;
    return item.price * quantity * alldates.length;
  };

  const handleClick = async () => {
    try {
      const roomsToReserve = [];
      for (const [roomTypeId, quantity] of Object.entries(selectedRooms)) {
        const roomType = data.find((rt) => rt._id === roomTypeId);
        if (roomType && quantity > 0) {
          const availableRooms = roomType.roomNumbers
            .filter((room) => isAvailable(room))
            .slice(0, quantity);
          roomsToReserve.push(...availableRooms.map((room) => room._id));
        }
      }

      if (roomsToReserve.length === 0) {
        alert("Vui lòng chọn ít nhất một phòng");
        return;
      }

      await Promise.all(
        roomsToReserve.map((roomId) => {
          return axios.put(`/rooms/availability/${roomId}`, {
            dates: alldates,
          });
        })
      );
      navigate("/");
    } catch (err) {
      console.error("Error reserving rooms:", err);
    }
  };

  const getTotalSelected = () => {
    return Object.values(selectedRooms).reduce((sum, val) => sum + val, 0);
  };

  const handleRoomTitleClick = (room) => {
    setSelectedRoomDetail(room);
    setCurrentImageIndex(0);
  };

  const handleNextImage = () => {
    if (selectedRoomDetail && selectedRoomDetail.photos) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedRoomDetail.photos.length);
    }
  };

  const handlePrevImage = () => {
    if (selectedRoomDetail && selectedRoomDetail.photos) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedRoomDetail.photos.length) % selectedRoomDetail.photos.length);
    }
  };

  if (loading) {
    return <div className="reserveSection"><p>Đang tải phòng...</p></div>;
  }

  return (
    <div className="reserveSection">
      <div className="reserveHeader">
        <h2>Chọn phòng của bạn</h2>
        <p className="reserveSubtitle">Bảng giá cho {alldates.length} đêm</p>
      </div>

      <div className="reserveTableWrapper">
        <table className="roomTable">
          <thead>
            <tr>
              <th className="colRoomType">Loại phòng</th>
              <th className="colDesc">Mô tả</th>
              <th className="colGuests">Số khách</th>
              <th className="colAvailable">Phòng còn</th>
              <th className="colPrice">Giá / đêm</th>
              <th className="colSelect">Chọn phòng</th>
              <th className="colTotal">Tổng giá</th>
            </tr>
          </thead>
          <tbody>
            {data && data.map((item) => (
              <tr key={item._id} className="roomRow">
                <td className="colRoomType">
                  <div className="roomTypeInfo">
                    <strong
                      className="roomTitleLink"
                      onClick={() => handleRoomTitleClick(item)}
                    >
                      {item.title}
                    </strong>
                    <div className="bedInfo">
                      {item.numberOfBeds && (
                        <p>
                          <FontAwesomeIcon icon={faBed} className="bedIcon" />
                          {item.numberOfBeds} {item.bedType || 'Giường'}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="colDesc">{item.desc}</td>
                <td className="colGuests">
                  <div className="guestInfo">
                    <FontAwesomeIcon icon={faUsers} className="guestIcon" />
                    <span>{item.maxPeople} khách</span>
                  </div>
                </td>
                <td className="colAvailable">
                  <span className={`availableCount ${getAvailableCount(item.roomNumbers) > 0 ? 'available' : 'unavailable'}`}>
                    {getAvailableCount(item.roomNumbers)}
                  </span>
                </td>
                <td className="colPrice">
                  <span className="priceValue">{item.price.toLocaleString('vi-VN')} VND</span>
                </td>
                <td className="colSelect">
                  <select
                    className="roomSelect"
                    value={selectedRooms[item._id] || 0}
                    onChange={(e) => handleSelectChange(e, item._id)}
                    disabled={getAvailableCount(item.roomNumbers) === 0}
                  >
                    <option value="0">-</option>
                    {Array.from({ length: getAvailableCount(item.roomNumbers) }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="colTotal">
                  <span className="totalPrice">
                    {getTotalPrice(item) > 0
                      ? getTotalPrice(item).toLocaleString('vi-VN') + ' VND'
                      : '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="reserveFooter">
        <div className="selectedInfo">
          {getTotalSelected() > 0 && (
            <p>{getTotalSelected()} phòng đã chọn</p>
          )}
        </div>
        <button
          onClick={handleClick}
          className="reserveButton"
          disabled={getTotalSelected() === 0}
        >
          Đặt phòng ngay
        </button>
      </div>

      {selectedRoomDetail && (
        <div className="roomModalOverlay" onClick={() => setSelectedRoomDetail(null)}>
          <div className="roomModalContent" onClick={(e) => e.stopPropagation()}>
            <button
              className="roomModalClose"
              onClick={() => setSelectedRoomDetail(null)}
            >
              <FontAwesomeIcon icon={faX} />
            </button>

            <div className="roomModalContainer">
              {/* Left - Images */}
              <div className="roomImageSection">
                <div className="mainImageWrapper">
                  {selectedRoomDetail.photos && selectedRoomDetail.photos.length > 0 ? (
                    <img 
                      src={selectedRoomDetail.photos[currentImageIndex]} 
                      alt={selectedRoomDetail.title}
                      className="mainImage"
                    />
                  ) : (
                    <div className="noImage">Không có hình ảnh</div>
                  )}
                  
                  {selectedRoomDetail.photos && selectedRoomDetail.photos.length > 1 && (
                    <>
                      <button className="imageNavBtn prev" onClick={handlePrevImage}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                      </button>
                      <button className="imageNavBtn next" onClick={handleNextImage}>
                        <FontAwesomeIcon icon={faChevronRight} />
                      </button>
                      <div className="imageCounter">
                        {currentImageIndex + 1} / {selectedRoomDetail.photos.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {selectedRoomDetail.photos && selectedRoomDetail.photos.length > 1 && (
                  <div className="thumbnailsContainer">
                    {selectedRoomDetail.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`thumbnail-${idx}`}
                        className={`thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right - Info */}
              <div className="roomInfoSection">
                <h2 className="roomTitle">{selectedRoomDetail.title}</h2>
                
                <div className="roomBedInfo">
                  <FontAwesomeIcon icon={faBed} className="bedIconLarge" />
                  <span>{selectedRoomDetail.numberOfBeds} {selectedRoomDetail.bedType || 'Giường'}</span>
                </div>

                <div className="roomDetailsGrid">
                  <div className="roomDetailItem">
                    <span className="detailLabel">Loại phòng:</span>
                    <span className="detailValue">{selectedRoomDetail.title}</span>
                  </div>
                  <div className="roomDetailItem">
                    <span className="detailLabel">Tối đa:</span>
                    <span className="detailValue">{selectedRoomDetail.maxPeople} khách</span>
                  </div>
                </div>

                <div className="roomDescription">
                  <h3>Mô tả</h3>
                  <p>{selectedRoomDetail.desc}</p>
                </div>

                <div className="roomAmenities">
                  <h3>Tiện nghi</h3>
                  <ul className="amenitiesList">
                    <li><FontAwesomeIcon icon={faCheck} /> Phòng tắm riêng</li>
                    <li><FontAwesomeIcon icon={faCheck} /> Điều hòa không khí</li>
                    <li><FontAwesomeIcon icon={faCheck} /> TV màn hình phẳng</li>
                    <li><FontAwesomeIcon icon={faCheck} /> WiFi miễn phí</li>
                  </ul>
                </div>

                <div className="roomPriceSection">
                  <div className="priceBox">
                    <span className="priceLabel">Giá / đêm:</span>
                    <span className="priceValue">{selectedRoomDetail.price.toLocaleString('vi-VN')} VND</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>  );
};

export default Reserve;