import { useState, useContext, useRef, useEffect } from "react";
import { SearchContext } from "../../context/SearchContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import "./bookingSearchBar.css";

const BookingSearchBar = ({ onSearch, hotelId }) => {
  const { dates, dispatch } = useContext(SearchContext);

  // State cho expanded form
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchBarRef = useRef(null);
  const datePickerRef = useRef(null);

  // State cho date range
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Initialize từ context
  useEffect(() => {
    // Lấy dates từ context
    if (dates && dates.length > 0) {
      const firstDate = dates[0];
      if (firstDate.startDate && firstDate.endDate) {
        const startDateObj = typeof firstDate.startDate === 'string'
          ? new Date(firstDate.startDate)
          : firstDate.startDate;
        const endDateObj = typeof firstDate.endDate === 'string'
          ? new Date(firstDate.endDate)
          : firstDate.endDate;

        setStartDate(formatDateForInput(startDateObj));
        setEndDate(formatDateForInput(endDateObj));
      }
    }
  }, [dates]);

  // When context dates change, optionally trigger an external search callback
  const contextSyncRef = useRef({ triggered: false, timer: null });
  useEffect(() => {
    if (!dates || dates.length === 0) return;
    const fd = dates[0];
    if (!fd || !fd.startDate || !fd.endDate) return;

    // Normalize to input yyyy-mm-dd
    const sd = typeof fd.startDate === 'string' ? fd.startDate.split('T')[0] : formatDateForInput(new Date(fd.startDate));
    const ed = typeof fd.endDate === 'string' ? fd.endDate.split('T')[0] : formatDateForInput(new Date(fd.endDate));

    // If local state already matches, do nothing
    if (sd === startDate && ed === endDate) return;

    // Set local inputs
    setStartDate(sd);
    setEndDate(ed);

    // If this change was caused by our own previous onSearch, suppress calling onSearch again
    if (contextSyncRef.current.suppress) {
      contextSyncRef.current.suppress = false;
      return;
    }

    // Debounce calling onSearch to avoid rapid repeated calls
    if (contextSyncRef.current.timer) clearTimeout(contextSyncRef.current.timer);
    contextSyncRef.current.timer = setTimeout(() => {
      // Only call onSearch if provided (parent will handle fetching)
      if (onSearch && typeof onSearch === 'function') {
        try {
          // Mark that we are triggering a search so that the next incoming context update doesn't re-trigger it
          contextSyncRef.current.suppress = true;
          onSearch();
        } catch (err) {
          console.error("Error calling onSearch from BookingSearchBar:", err);
        }
      }
      contextSyncRef.current.timer = null;
    }, 300);

    return () => {
      if (contextSyncRef.current.timer) {
        clearTimeout(contextSyncRef.current.timer);
        contextSyncRef.current.timer = null;
      }
    };
  }, [dates, startDate, endDate]);

  // Format date cho input type="date"
  const formatDateForInput = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  };

  // Format date cho display (T2, 27 tháng 1)
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const months = [
      "tháng 1",
      "tháng 2",
      "tháng 3",
      "tháng 4",
      "tháng 5",
      "tháng 6",
      "tháng 7",
      "tháng 8",
      "tháng 9",
      "tháng 10",
      "tháng 11",
      "tháng 12",
    ];
    const month = months[date.getMonth()];
    return `${dayName}, ${day} ${month}`;
  };

  // Xử lý thay đổi ngày
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === "startDate") {
      setStartDate(value);
      // Auto set endDate nếu chưa có
      if (!endDate) {
        const nextDay = new Date(value);
        nextDay.setDate(nextDay.getDate() + 1);
        setEndDate(formatDateForInput(nextDay));
      }
    } else {
      setEndDate(value);
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = async () => {
    // Validate
    if (!startDate || !endDate) {
      alert("Vui lòng chọn ngày check-in và check-out");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      alert("Ngày check-out phải sau ngày check-in");
      return;
    }

    // Nếu có hotelId, kiểm tra phòng hợp lệ
    if (hotelId) {
      try {
        setLoading(true);
        // Gọi API để lấy danh sách phòng
        const response = await fetch(`http://localhost:8800/api/rooms/hotel/${hotelId}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const roomsData = await response.json();

        // Kiểm tra response có phải là array không
        if (!Array.isArray(roomsData)) {
          throw new Error("Invalid response format");
        }

        // Kiểm tra có ít nhất 1 phòng không
        if (roomsData.length === 0) {
          alert("Xin lỗi! Khách sạn hiện không có phòng nào.");
          setLoading(false);
          return;
        }

        // Nếu có phòng hợp lệ, tiếp tục
      } catch (err) {
        console.error("Lỗi khi kiểm tra phòng:", err);
        alert("Lỗi khi kiểm tra phòng. Vui lòng thử lại sau.");
        setLoading(false);
        return;
      }
    }

    // Cập nhật context với giá trị mặc định
    dispatch({
      type: "NEW_SEARCH",
      payload: {
        city: undefined,
        dates: [
          {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          },
        ],
        options: {
          adult: 1,
          children: 0,
          room: 1,
        },
      },
    });

    // Đóng dropdowns
    setShowDatePicker(false);
    setLoading(false);

    // Callback nếu có - gọi ngay để load phòng
    if (onSearch) {
      onSearch();
    }
  };

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bookingSearchBar" ref={searchBarRef}>
      <div className="searchBarCompact">
        <div className="compactContent">
          {/* Dates */}
          <div className="compactItem" onClick={() => {
            setShowDatePicker(!showDatePicker);
          }}>
            <FontAwesomeIcon icon={faCalendar} className="compactIcon" />
            <div className="compactText">
              <div className="compactLabel">Nhận phòng — Trả phòng</div>
              <div className="compactValue">
                {startDate && endDate
                  ? `${formatDateForDisplay(startDate)} — ${formatDateForDisplay(endDate)}`
                  : "Chọn ngày"}
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            className="compactButton"
            onClick={handleSearch}
            type="button"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : (
              "Tìm kiếm"
            )}
          </button>
        </div>

        {/* Date Picker Dropdown */}
        {showDatePicker && (
          <div className="datePickerDropdown" ref={datePickerRef}>
            <div className="datePickerItem">
              <label>Nhận phòng</label>
              <input
                type="date"
                value={startDate}
                onChange={handleDateChange}
                name="startDate"
                className="datePickerInput"
                min={new Date().toISOString().split("T")[0]}
              />
              {startDate && (
                <div className="datePickerDisplay">
                  {formatDateForDisplay(startDate)}
                </div>
              )}
            </div>

            <div className="datePickerItem">
              <label>Trả phòng</label>
              <input
                type="date"
                value={endDate}
                onChange={handleDateChange}
                name="endDate"
                className="datePickerInput"
                min={startDate || new Date().toISOString().split("T")[0]}
              />
              {endDate && (
                <div className="datePickerDisplay">
                  {formatDateForDisplay(endDate)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSearchBar;
