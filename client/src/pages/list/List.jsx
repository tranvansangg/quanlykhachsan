import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./list.css";
import { format } from "date-fns";
import CustomCalendar from "../../components/customCalendar/CustomCalendar";
import SearchItem from "../../components/searchItem/SearchItem";
import EmptyState from "../../components/emptyState/EmptyState";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axiosInstance from "../../utils/axiosInstance";
import {
  faSliders,
  faCheck,
  faStar,
  faMapPin,
} from "@fortawesome/free-solid-svg-icons";

const List = () => {
  const location = useLocation();
  const [destination, setDestination] = useState(location.state?.destination || "");
  const [dates, setDates] = useState(location.state?.dates || [
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [openDate, setOpenDate] = useState(false);
  const [options, setOptions] = useState(location.state?.options || { rooms: [{ adults: 1, children: 0 }] });
  const [min, setMin] = useState(undefined);
  const [max, setMax] = useState(undefined);
  const [sortBy, setSortBy] = useState("recommended");
  const [filterOpen, setFilterOpen] = useState(false);

  // Calculate total guests
  const totalGuests = options.rooms?.reduce((total, room) => total + room.adults + room.children, 0) || 0;
  const numRooms = options.rooms?.length || 1;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch hotels with available rooms
  useEffect(() => {
    if (!destination) {
      setData([]);
      return;
    }

    const fetchAvailableHotels = async () => {
      setLoading(true);
      setError(null);
      try {
        // Ensure roomRequests is always an array with proper structure
        const roomRequests = Array.isArray(options.rooms) && options.rooms.length > 0
          ? options.rooms
          : [{ adults: 1, children: 0 }];

        const payload = {
          city: destination,
          roomRequests: roomRequests,
          startDate: dates && dates[0] && dates[0].startDate ? dates[0].startDate : null,
          endDate: dates && dates[0] && dates[0].endDate ? dates[0].endDate : null,
          roomsRequested: numRooms,
        };

        console.log("Fetching hotels with payload:", payload);

        const response = await axiosInstance.post("/hotels/search-available", payload);
        const hotelData = response.data;

        console.log("API Response:", hotelData);

        // Apply price filter
        let filteredData = hotelData;
        if (min || max) {
          filteredData = hotelData.filter((hotel) => {
            const price = hotel.cheapestPrice || 0;
            if (min && price < Number(min)) return false;
            if (max && price > Number(max)) return false;
            return true;
          });
        }

        console.log("Filtered data:", filteredData.length, "hotels");
        setData(filteredData);
        if (filteredData.length === 0) {
          setError("Không tìm thấy khách sạn phù hợp với điều kiện của bạn");
        }
      } catch (err) {
        console.error("Error fetching hotels:", err);

        // More detailed error message
        let errorMsg = "Không thể tải dữ liệu khách sạn";
        if (err.code === 'ECONNABORTED') {
          errorMsg = "Request timeout - API server có thể đang down";
        } else if (err.code === 'ERR_NETWORK') {
          errorMsg = "Lỗi kết nối - Không thể kết nối tới API server";
        } else if (err.response?.status === 404) {
          errorMsg = "Endpoint không tìm thấy";
        } else if (err.response?.status === 400) {
          errorMsg = "Dữ liệu không hợp lệ: " + (err.response?.data?.error || "Bad request");
        } else if (err.response?.status === 500) {
          errorMsg = "Lỗi server: " + (err.response?.data?.message || "Internal server error");
        } else if (err.message) {
          errorMsg = err.message;
        }

        setError(errorMsg);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableHotels();
  }, [destination, options.rooms, min, max, dates]);

  const handleClick = () => {
    // Refetch triggered by useEffect dependency changes
  };

  const sortedData = [...(data || [])].sort((a, b) => {
    switch (sortBy) {
      case "priceLow":
        return a.cheapestPrice - b.cheapestPrice;
      case "priceHigh":
        return b.cheapestPrice - a.cheapestPrice;
      case "star":
        return (b.star || 0) - (a.star || 0);
      default:
        return 0;
    }
  });

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="listContainer">
        <div className="listWrapper">
          {/* Sidebar Filter */}
          <div className={`listSearch ${filterOpen ? "open" : ""}`}>
            <div className="filterHeader">
              <FontAwesomeIcon icon={faSliders} />
              <h2 className="lsTitle">Tìm kiếm nâng cao</h2>

            </div>

            <div className="lsItem">
              <label>Điểm đến</label>
              <input
                placeholder={destination}
                type="text"
                className="filterInput"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <div className="lsItem">
              <label>Ngày nhận/trả phòng</label>
              <span
                className="dateRangeText"
                onClick={() => setOpenDate(!openDate)}
              >
                {`${format(dates[0].startDate, "dd/MM")} - ${format(
                  dates[0].endDate,
                  "dd/MM"
                )}`}
              </span>
              {openDate && (
                <CustomCalendar
                  startDate={dates[0].startDate}
                  endDate={dates[0].endDate}
                  onDateChange={(day) => {
                    // Simple logic: first click is check-in, second click is check-out
                    const newDates = [{ ...dates[0], startDate: day, key: "selection" }];
                    setDates(newDates);
                  }}
                />
              )}
            </div>

            <div className="lsItem">
              <label className="sectionTitle">Khoảng giá (VNĐ)</label>
              <div className="priceRange">
                <div className="priceInput">
                  <span className="label">Từ</span>
                  <input
                    type="number"
                    onChange={(e) => setMin(e.target.value)}
                    className="filterInput"
                    placeholder="0"
                  />
                </div>
                <span className="separator">-</span>
                <div className="priceInput">
                  <span className="label">Đến</span>
                  <input
                    type="number"
                    onChange={(e) => setMax(e.target.value)}
                    className="filterInput"
                    placeholder="9999"
                  />
                </div>
              </div>
            </div>

            <div className="lsItem">
              <label className="sectionTitle">Loại phòng</label>
              <div className="checkboxGroup">
                <label className="checkboxItem">
                  <input type="checkbox" defaultChecked />
                  <span>Phòng đơn</span>
                </label>
                <label className="checkboxItem">
                  <input type="checkbox" defaultChecked />
                  <span>Phòng đôi</span>
                </label>
                <label className="checkboxItem">
                  <input type="checkbox" defaultChecked />
                  <span>Phòng suite</span>
                </label>
              </div>
            </div>

            <div className="lsItem">
              <label className="sectionTitle">Tiện nghi</label>
              <div className="checkboxGroup">
                <label className="checkboxItem">
                  <input type="checkbox" />
                  <span>Wi-Fi miễn phí</span>
                </label>
                <label className="checkboxItem">
                  <input type="checkbox" />
                  <span>Bể bơi</span>
                </label>
                <label className="checkboxItem">
                  <input type="checkbox" />
                  <span>Quầy bar</span>
                </label>
                <label className="checkboxItem">
                  <input type="checkbox" />
                  <span>Phòng tập</span>
                </label>
              </div>
            </div>

            <div className="lsItem">
              <label className="sectionTitle">Xếp hạng</label>
              <div className="ratingGroup">
                {[5, 4, 3, 2].map((rating) => (
                  <label key={rating} className="ratingItem">
                    <input type="radio" name="rating" />
                    <div className="ratingStars">
                      {Array(rating)
                        .fill()
                        .map((_, i) => (
                          <FontAwesomeIcon key={i} icon={faStar} />
                        ))}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button className="searchBtn" onClick={handleClick}>
              Tìm kiếm
            </button>
          </div>

          {/* Main Results */}
          <div className="listResult">
            <div className="resultHeader">
              <div className="resultInfo">
                <h3>{sortedData.length} khách sạn tìm được</h3>
                <p>
                  <FontAwesomeIcon icon={faMapPin} className="resultIcon" />
                  {destination}
                </p>
              </div>

              <div className="sortContainer">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sortSelect"
                >
                  <option value="recommended">Được đề xuất</option>
                  <option value="priceLow">Giá: thấp đến cao</option>
                  <option value="priceHigh">Giá: cao đến thấp</option>
                  <option value="star">Sao cao nhất</option>
                </select>
              </div>

              <button
                className="mobileFilterBtn"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <FontAwesomeIcon icon={faSliders} />
                Bộ lọc
              </button>
            </div>

            {loading ? (
              <div className="loadingContainer">
                <div className="spinner"></div>
                <p>Đang tải khách sạn...</p>
              </div>
            ) : error ? (
              <EmptyState
                type="error"
                onAdjustFilters={() => setFilterOpen(true)}
              />
            ) : sortedData.length === 0 ? (
              <EmptyState
                type="noResults"
                totalGuests={totalGuests}
                numRooms={numRooms}
                onAdjustFilters={() => setFilterOpen(true)}
              />
            ) : (
              <div className="searchItemList">
                {sortedData.map((item) => (
                  <SearchItem item={item} key={item._id} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default List;
