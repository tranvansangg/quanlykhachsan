import useFetch from "../../hooks/useFetch";
import { useContext, useState, useEffect, useRef } from "react";
import { SearchContext } from "../../context/SearchContext";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBed, faUsers, faX, faChevronLeft, faChevronRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import BookingSearchBar from "../bookingSearchBar/BookingSearchBar";
import ReviewForm from "../review/ReviewForm";
import ReviewList from "../review/ReviewList";
import "./reserve.css";

const Reserve = ({ hotelId, dates: propDates }) => {
  const [selectedRooms, setSelectedRooms] = useState({});
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookedRoomIds, setBookedRoomIds] = useState(new Set());
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [lastSearchTime, setLastSearchTime] = useState(0); // Track last successful search time
  const [lastDateChangeTime, setLastDateChangeTime] = useState(0); // Track last date change time
  const [validationMessage, setValidationMessage] = useState(""); // Show validation message instead of alert
  const searchBarRef = useRef(null); // Scroll to search bar
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0); // Trigger refresh of review list
  const { data, loading } = useFetch(`/hotels/room/${hotelId}`);
  const { dates: contextDates, dispatch } = useContext(SearchContext);
  const { user } = useContext(AuthContext);
  
  // Use propDates first, then contextDates
  const dates = propDates || contextDates || [];

  const navigate = useNavigate();

  // Refetch room data when dates change (via BookingSearchBar)
  const handleBookingSearchRefresh = async () => {
    console.log("[Reserve] Refreshing room data from BookingSearchBar");
    setValidationMessage(""); // Clear validation message on search
    if (dates && dates[0]?.startDate && dates[0]?.endDate && hotelId) {
      await checkAvailability();
      // Mark that user successfully searched with current dates
      setLastSearchTime(Date.now());
    }
  };

  // Check room availability when dates change
  // Also validate dates to ensure they're not in the past
  useEffect(() => {
    if (dates && dates[0]?.startDate && dates[0]?.endDate && hotelId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const checkInDate = new Date(dates[0].startDate);
      checkInDate.setHours(0, 0, 0, 0);
      
      // If check-in is in the past, don't fetch (component should be reset by Header)
      if (checkInDate < today) {
        console.warn("[Reserve] Check-in date is in the past, skipping availability check");
        setBookedRoomIds(new Set());
        return;
      }
      
      console.log("[Reserve] Checking availability with dates:", dates[0].startDate, dates[0].endDate);
      // Mark that dates changed - user must search again before booking
      setLastDateChangeTime(Date.now());
      checkAvailability();
    }
  }, [dates, hotelId]);

  // If context has no dates, try to load from localStorage and populate context
  useEffect(() => {
    try {
      if ((!contextDates || contextDates.length === 0) && (!propDates || propDates.length === 0)) {
        const stored = localStorage.getItem("searchData");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.dates && parsed.dates.length > 0) {
            let loaded = parsed.dates.map(d => ({ startDate: new Date(d.startDate), endDate: new Date(d.endDate), key: d.key || "selection" }));

            // Validate stale dates
            const today = new Date();
            today.setHours(0,0,0,0);
            const checkIn = new Date(loaded[0].startDate);
            checkIn.setHours(0,0,0,0);
            if (checkIn < today) {
              const newStart = new Date(); newStart.setHours(0,0,0,0);
              const newEnd = new Date(newStart); newEnd.setDate(newEnd.getDate() + 1);
              loaded = [{ startDate: newStart, endDate: newEnd, key: "selection" }];

              // Update storage with ISO strings
              const payloadForStorage = {
                destination: parsed.destination || "",
                dates: loaded.map(d => ({ startDate: d.startDate.toISOString(), endDate: d.endDate.toISOString(), key: d.key })),
                options: parsed.options || { adults: 1, children: 0, rooms: 1 },
              };
              localStorage.setItem("searchData", JSON.stringify(payloadForStorage));
            }

            // Dispatch to global context so other components can use
            dispatch({ type: "NEW_SEARCH", payload: { destination: parsed.destination || "", dates: loaded, options: parsed.options || { adults: 1, children: 0, rooms: 1 } } });
          }
        }
      }
    } catch (err) {
      console.error("Error loading dates into context in Reserve:", err);
    }
  }, [contextDates, propDates, dispatch]);

  const checkAvailability = async () => {
    try {
      setAvailabilityLoading(true);
      console.log(`[Reserve] Checking availability for hotel: ${hotelId}`);
      console.log(`[Reserve] CheckIn: ${dates[0]?.startDate}, CheckOut: ${dates[0]?.endDate}`);
      
      const response = await axios.get(
        `http://localhost:8800/api/bookings/availability/check`,
        {
          params: {
            hotelId: hotelId,
            checkInDate: dates[0]?.startDate,
            checkOutDate: dates[0]?.endDate,
          },
        }
      );

      if (response.data.success) {
        const bookedIds = response.data.bookedRoomIds || [];
        console.log(`[Reserve] Booked Room IDs:`, bookedIds);
        console.log(`[Reserve] Total conflicting bookings: ${response.data.conflictingBookingsCount}`);
        setBookedRoomIds(new Set(bookedIds));
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra tính khả dụng:", err);
      setBookedRoomIds(new Set());
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const date = new Date(start.getTime());
    const dateArray = [];

    // Only include dates up to (but not including) the end date
    // because checkout date shouldn't be counted as a night stayed
    while (date < end) {
      dateArray.push(new Date(date).getTime());
      date.setDate(date.getDate() + 1);
    }

    return dateArray;
  };

  const alldates = dates && dates.length > 0 && dates[0]?.startDate && dates[0]?.endDate 
    ? getDatesInRange(dates[0].startDate, dates[0].endDate) 
    : [];

  const isAvailable = (roomNumber) => {
    if (!roomNumber || !roomNumber.unavailableDates) return true;
    const isFound = roomNumber.unavailableDates.some((date) =>
      alldates.includes(new Date(date).getTime())
    );
    return !isFound;
  };

  const getAvailableCount = (roomNumbers) => {
    return roomNumbers.filter((room) => isAvailable(room)).length;
  };

  const isRoomBooked = (roomId) => {
    return bookedRoomIds.has(roomId);
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
    // Check if user is logged in
    if (!user) {
      alert("Vui lòng đăng nhập để đặt phòng");
      navigate("/login");
      return;
    }

    if (getTotalSelected() === 0) {
      alert("Vui lòng chọn ít nhất một phòng");
      return;
    }

    // Validate dates - check if check-in is still valid
    if (!dates || dates.length === 0 || !dates[0]?.startDate || !dates[0]?.endDate) {
      alert("Vui lòng chọn ngày nhận và trả phòng");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(dates[0].startDate);
    checkInDate.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      alert("Ngày nhận phòng không hợp lệ. Vui lòng chọn ngày nhận trong tương lai");
      return;
    }

    // Check if user has searched with current dates
    if (lastDateChangeTime > lastSearchTime) {
      setValidationMessage("⚠️ Vui lòng click 'Tìm kiếm' trên thanh tìm kiếm ngày để confirm ngày và kiểm tra phòng khả dụng");
      // Scroll to search bar
      if (searchBarRef.current) {
        searchBarRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    // Check if selected rooms conflict with bookings
    // Also validate that quantity doesn't exceed available count
    const conflictingRooms = [];
    for (const roomTypeId of Object.keys(selectedRooms)) {
      if (selectedRooms[roomTypeId] > 0) {
        const roomType = data.find((rt) => rt && rt._id === roomTypeId);
        if (!roomType) continue;

        // Check 1: If room is fully booked
        if (bookedRoomIds.has(roomTypeId)) {
          conflictingRooms.push(`${roomType.title} (phòng này đã hết cho những ngày được chọn)`);
          continue;
        }

        // Check 2: Validate quantity against available count
        const availableCount = getAvailableCount(roomType.roomNumbers);
        const selectedQty = selectedRooms[roomTypeId];
        if (selectedQty > availableCount) {
          conflictingRooms.push(
            `${roomType.title} (chỉ còn ${availableCount} phòng, bạn chọn ${selectedQty})`
          );
        }
      }
    }

    if (conflictingRooms.length > 0) {
      alert(
        `Lỗi: Các phòng sau không khả dụng:\n\n${conflictingRooms.join("\n")}\n\nVui lòng chọn ngày khác hoặc chọn số lượng phòng ít hơn.`
      );
      return;
    }

    // Check if data is available
    if (!data || !Array.isArray(data)) {
      alert("Dữ liệu phòng không tìm thấy. Vui lòng tải lại trang");
      return;
    }

    // Prepare booking data
    const selectedRoomData = {};
    const roomsDetails = [];
    let total = 0;

    for (const [roomTypeId, quantity] of Object.entries(selectedRooms)) {
      const roomType = data.find((rt) => rt && rt._id === roomTypeId);
      if (roomType && quantity > 0) {
        selectedRoomData[roomTypeId] = quantity;
        roomsDetails.push(roomType);
        total += roomType.price * quantity * alldates.length;
      }
    }

    // Navigate to payment page with booking data
    navigate("/payment", {
      state: {
        bookingData: roomsDetails,
        selectedRooms: selectedRoomData,
        totalAmount: total,
        hotelId,
        dates,
      },
    });
  };

  const getTotalSelected = () => {
    return Object.values(selectedRooms).reduce((sum, val) => sum + val, 0);
  };

  const handleRoomTitleClick = (room) => {
    setSelectedRoomDetail(room);
    setCurrentImageIndex(0);
  };

  const handleReviewSubmitted = () => {
    // Trigger refresh of review list
    setReviewRefreshTrigger(prev => prev + 1);
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

  if (loading || availabilityLoading) {
    return (
      <div className="reserveSection">
        <div ref={searchBarRef}>
          <BookingSearchBar hotelId={hotelId} onSearch={handleBookingSearchRefresh} />
          {validationMessage && (
            <div style={{
              padding: "12px 16px",
              marginTop: "8px",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "4px",
              color: "#856404",
              fontSize: "14px",
              textAlign: "center"
            }}>
              {validationMessage}
            </div>
          )}
        </div>
        
        <div className="reserveHeader">
          <h2>Chọn phòng của bạn</h2>
          <p className="reserveSubtitle">Đang tải phòng khả dụng...</p>
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
              {[1, 2, 3].map((idx) => (
                <tr key={idx} className="roomRow">
                  <td className="colRoomType">
                    <div className="skeletonLine large"></div>
                  </td>
                  <td className="colDesc">
                    <div className="skeletonLine medium"></div>
                  </td>
                  <td className="colGuests">
                    <div className="skeletonLine small" style={{ margin: '0 auto' }}></div>
                  </td>
                  <td className="colAvailable">
                    <div className="skeletonLine small" style={{ margin: '0 auto' }}></div>
                  </td>
                  <td className="colPrice">
                    <div className="skeletonLine medium"></div>
                  </td>
                  <td className="colSelect">
                    <div className="skeletonLine small" style={{ margin: '0 auto' }}></div>
                  </td>
                  <td className="colTotal">
                    <div className="skeletonLine medium"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="reserveSection">
      <div ref={searchBarRef}>
        <BookingSearchBar hotelId={hotelId} onSearch={handleBookingSearchRefresh} />
        {validationMessage && (
          <div style={{
            padding: "12px 16px",
            marginTop: "8px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "4px",
            color: "#856404",
            fontSize: "14px",
            textAlign: "center"
          }}>
            {validationMessage}
          </div>
        )}
      </div>
      
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
            {data && Array.isArray(data) && data.length > 0 ? data.map((item) => {
              if (!item || !item.title) return null;
              
              // Check if room is booked for the selected dates
              const isBooked = isRoomBooked(item._id);
              console.log(`[Room Render] ${item.title} - isBooked: ${isBooked}`);
              
              // If room is booked, hide it completely
              if (isBooked) {
                return null;
              }
              
              const availableCount = getAvailableCount(item.roomNumbers);
              const isUnavailable = availableCount === 0;
              
              return (
              <tr key={item._id} className={`roomRow ${isUnavailable ? 'unavailable-row' : ''}`}>
                <td className="colRoomType">
                  <div className="roomTypeInfo">
                    <strong
                      className={`roomTitleLink ${isUnavailable ? 'disabled-link' : ''}`}
                      onClick={() => !isUnavailable && handleRoomTitleClick(item)}
                    >
                      {item.title}
                      {isUnavailable && <span className="outOfStockBadge">Đã Hết Phòng</span>}
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
                  <span className={`availableCount ${availableCount > 0 ? 'available' : 'unavailable'}`}>
                    {availableCount}
                  </span>
                </td>
                <td className="colPrice">
                  <span className="priceValue">{item.price.toLocaleString('vi-VN')} VND</span>
                </td>
                <td className="colSelect">
                  {isUnavailable ? (
                    <span className="fullBookedText">Đã Hết Phòng</span>
                  ) : (
                    <select
                      className="roomSelect"
                      value={selectedRooms[item._id] || 0}
                      onChange={(e) => handleSelectChange(e, item._id)}
                    >
                      <option value="0">-</option>
                      {Array.from({ length: availableCount }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="colTotal">
                  <span className="totalPrice">
                    {getTotalPrice(item) > 0
                      ? getTotalPrice(item).toLocaleString('vi-VN') + ' VND'
                      : '-'}
                  </span>
                </td>
              </tr>
            );
            }) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  Không có phòng trống
                </td>
              </tr>
            )}
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

      {/* Review Section */}
      <div className="reviewSection">
        <div className="reviewSectionTitle">Đánh giá khách sạn</div>
        <ReviewForm 
          hotelId={hotelId} 
          onReviewSubmitted={() => setReviewRefreshTrigger(prev => prev + 1)} 
        />
        <ReviewList 
          hotelId={hotelId} 
          refreshTrigger={reviewRefreshTrigger} 
        />
      </div>
    </div>
  );
};

export default Reserve;