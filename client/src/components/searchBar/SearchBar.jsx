import { useContext, useState } from "react";
import { SearchContext } from "../../context/SearchContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faUsers, faSearch } from "@fortawesome/free-solid-svg-icons";
import "./searchBar.css";

const SearchBar = ({ hideLocation = false }) => {
  const { dates, options, dispatch } = useContext(SearchContext);
  
  // State cho form tìm kiếm
  const [localDates, setLocalDates] = useState(
    dates && dates.length > 0 
      ? {
          startDate: dates[0].startDate || "",
          endDate: dates[0].endDate || "",
        }
      : {
          startDate: "",
          endDate: "",
        }
  );

  const [localOptions, setLocalOptions] = useState(
    options || {
      adult: 1,
      children: 0,
      room: 1,
    }
  );

  const navigate = useNavigate();

  // Format ngày để hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Xử lý thay đổi ngày
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setLocalDates((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý thay đổi số lượng khách
  const handleGuestChange = (e) => {
    const { name, value } = e.target;
    setLocalOptions((prev) => ({
      ...prev,
      [name]: parseInt(value, 10),
    }));
  };

  // Xử lý tìm kiếm
  const handleSearch = () => {
    // Validate ngày
    if (!localDates.startDate || !localDates.endDate) {
      alert("Vui lòng chọn ngày check-in và check-out");
      return;
    }

    // Validate ngày check-out > check-in
    if (new Date(localDates.endDate) <= new Date(localDates.startDate)) {
      alert("Ngày check-out phải sau ngày check-in");
      return;
    }

    // Validate số khách
    const totalGuests = localOptions.adult + localOptions.children;
    if (totalGuests === 0) {
      alert("Vui lòng chọn ít nhất 1 khách");
      return;
    }

    // Cập nhật context
    dispatch({
      type: "NEW_SEARCH",
      payload: {
        city: undefined,
        dates: [
          {
            startDate: new Date(localDates.startDate),
            endDate: new Date(localDates.endDate),
          },
        ],
        options: localOptions,
      },
    });

    // Chuyển hướng đến trang danh sách khách sạn
    navigate("/hotels");
  };

  // Tính tổng số khách
  const totalGuests = localOptions.adult + localOptions.children;

  return (
    <div className="searchBar">
      <div className="searchBarContainer">
        {/* Check-in */}
        <div className="searchBarItem">
          <label htmlFor="checkIn" className="searchBarLabel">
            <FontAwesomeIcon icon={faCalendar} className="searchIcon" />
            <span>Check-in</span>
          </label>
          <input
            id="checkIn"
            type="date"
            name="startDate"
            value={localDates.startDate}
            onChange={handleDateChange}
            className="searchBarInput"
            min={new Date().toISOString().split("T")[0]}
          />
          {localDates.startDate && (
            <span className="dateDisplay">{formatDate(localDates.startDate)}</span>
          )}
        </div>

        {/* Separator */}
        <div className="searchBarSeparator">→</div>

        {/* Check-out */}
        <div className="searchBarItem">
          <label htmlFor="checkOut" className="searchBarLabel">
            <FontAwesomeIcon icon={faCalendar} className="searchIcon" />
            <span>Check-out</span>
          </label>
          <input
            id="checkOut"
            type="date"
            name="endDate"
            value={localDates.endDate}
            onChange={handleDateChange}
            className="searchBarInput"
            min={localDates.startDate || new Date().toISOString().split("T")[0]}
          />
          {localDates.endDate && (
            <span className="dateDisplay">{formatDate(localDates.endDate)}</span>
          )}
        </div>

        {/* Số khách */}
        <div className="searchBarItem">
          <label htmlFor="guests" className="searchBarLabel">
            <FontAwesomeIcon icon={faUsers} className="searchIcon" />
            <span>Khách</span>
          </label>
          <div className="guestSelector">
            <div className="guestGroup">
              <label htmlFor="adult">Người lớn:</label>
              <input
                id="adult"
                type="number"
                name="adult"
                min="0"
                max="10"
                value={localOptions.adult}
                onChange={handleGuestChange}
                className="numberInput"
              />
            </div>
            <div className="guestGroup">
              <label htmlFor="children">Trẻ em:</label>
              <input
                id="children"
                type="number"
                name="children"
                min="0"
                max="10"
                value={localOptions.children}
                onChange={handleGuestChange}
                className="numberInput"
              />
            </div>
            <div className="guestTotal">
              Tổng: <strong>{totalGuests}</strong> khách
            </div>
          </div>
        </div>

        {/* Nút tìm kiếm */}
        <button className="searchBarButton" onClick={handleSearch}>
          <FontAwesomeIcon icon={faSearch} />
          <span>Tìm kiếm</span>
        </button>
      </div>

      {/* Thông tin tìm kiếm hiện tại */}
      {dates && dates.length > 0 && (
        <div className="searchBarInfo">
          <p>
            {formatDate(dates[0].startDate)} - {formatDate(dates[0].endDate)} •{" "}
            {options.adult || 0} người lớn • {options.children || 0} trẻ em
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
