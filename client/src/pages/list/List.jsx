import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { useLocation, useSearchParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import "./list.css";
import { format } from "date-fns";
import CustomCalendar from "../../components/customCalendar/CustomCalendar";
import SearchItem from "../../components/searchItem/SearchItem";
import EmptyState from "../../components/emptyState/EmptyState";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axiosInstance from "../../utils/axiosInstance";
import { SearchContext } from "../../context/SearchContext";
import { AuthContext } from "../../context/AuthContext";
import {
  faSliders,
  faCheck,
  faStar,
  faMapPin,
} from "@fortawesome/free-solid-svg-icons";

const List = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { dates: contextDates, dispatch } = useContext(SearchContext);
  const { user } = useContext(AuthContext);

  // Get city and type from URL params
  const cityParam = searchParams.get("city");
  const destinationParam = searchParams.get("destination");
  const typeParam = searchParams.get("type"); // Filter by hotel type (from URL)

  // Get saved city and search data from localStorage
  const [selectedCity, setSelectedCity] = useState(null);
  const [savedSearchData, setSavedSearchData] = useState(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState(null); // From URL param
  
  // Load city and search data from localStorage on mount
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        // Load selected city
        const savedCity = localStorage.getItem("selectedCity");
        console.log("📍 Raw city data:", savedCity);
        
        if (savedCity) {
          const cityData = JSON.parse(savedCity);
          setSelectedCity(cityData);
          console.log("✓ Loaded city from localStorage:", cityData);
        }

        // Load search data (dates, guests, rooms)
        const savedSearch = localStorage.getItem("searchData");
        console.log("🔍 Raw search data:", savedSearch);
        
        if (savedSearch) {
          const searchData = JSON.parse(savedSearch);
          setSavedSearchData(searchData);
          console.log("✓ Loaded search data from localStorage:", searchData);
          console.log("  - Dates:", searchData.dates);
          console.log("  - Options:", searchData.options);
        }

        // Load selected property type
        const savedPropertyType = localStorage.getItem("selectedPropertyType");
        console.log("🏠 Raw property type data:", savedPropertyType);
        
        if (savedPropertyType) {
          const propertyTypeData = JSON.parse(savedPropertyType);
          setSelectedPropertyType(propertyTypeData.type);
          console.log("✓ Loaded property type from localStorage:", propertyTypeData.type);
        }
      } catch (error) {
        console.error("Error loading stored data:", error);
      }
    };

    loadStoredData();
  }, []); // Run once on mount

  // Populate dates state from priority: URL params (handled elsewhere) > context > localStorage > location.state
  useEffect(() => {
    try {
      const urlStart = searchParams.get("startDate");
      const urlEnd = searchParams.get("endDate");
      if (urlStart && urlEnd) return; // URL params take precedence (handled by other effect)

      // 1) Use context dates if present
      if (contextDates && contextDates.length > 0) {
        const normalized = contextDates.map(d => ({
          startDate: new Date(d.startDate),
          endDate: new Date(d.endDate),
          key: d.key || "selection",
        }));
        setDates(normalized);
        return;
      }

      // 2) Use saved search data from localStorage (loaded into savedSearchData)
      if (savedSearchData && savedSearchData.dates && savedSearchData.dates.length > 0) {
        let loaded = savedSearchData.dates.map(d => ({
          startDate: new Date(d.startDate),
          endDate: new Date(d.endDate),
          key: d.key || "selection",
        }));

        // Validate stale dates: if check-in < today, reset to today/tomorrow
        const today = new Date();
        today.setHours(0,0,0,0);
        const checkIn = new Date(loaded[0].startDate);
        checkIn.setHours(0,0,0,0);
        if (checkIn < today) {
          const newStart = new Date();
          newStart.setHours(0,0,0,0);
          const newEnd = new Date(newStart);
          newEnd.setDate(newEnd.getDate() + 1);
          loaded = [{ startDate: newStart, endDate: newEnd, key: "selection" }];

          // Update localStorage with ISO strings
          const payloadForStorage = {
            destination: savedSearchData.destination || destination || "",
            dates: loaded.map(d => ({ startDate: d.startDate.toISOString(), endDate: d.endDate.toISOString(), key: d.key })),
            options: savedSearchData.options || { adults: 1, children: 0, rooms: 1 },
          };
          localStorage.setItem("searchData", JSON.stringify(payloadForStorage));

          // Update global context
          dispatch({
            type: "NEW_SEARCH",
            payload: {
              destination: payloadForStorage.destination,
              dates: loaded,
              options: payloadForStorage.options,
            },
          });
        } else {
          // Use loaded saved dates and update context
          dispatch({
            type: "NEW_SEARCH",
            payload: {
              destination: savedSearchData.destination || destination || "",
              dates: loaded,
              options: savedSearchData.options || { adults: 1, children: 0, rooms: 1 },
            },
          });
        }

        setDates(loaded);
        return;
      }

      // 3) Fallback to location.state if present
      if (location.state && location.state.dates) {
        const ls = location.state.dates.map(d => ({ startDate: new Date(d.startDate), endDate: new Date(d.endDate), key: d.key || "selection" }));
        setDates(ls);
        dispatch({ type: "NEW_SEARCH", payload: { destination: location.state.destination || destination || "", dates: ls, options: location.state.options || { adults: 1, children: 0, rooms: 1 } } });
        return;
      }
    } catch (err) {
      console.error("Error populating dates in List.jsx:", err);
    }
  }, [savedSearchData, contextDates, searchParams, location.state]);

  // Helper function to load search data from query params or location state
  const loadSearchData = () => {
    // Try query params first
    const paramDestination = searchParams.get("destination");
    const paramStartDate = searchParams.get("startDate");
    const paramEndDate = searchParams.get("endDate");
    const paramOptionsJson = searchParams.get("options");

    if (paramDestination || paramStartDate) {
      return {
        destination: paramDestination || "",
        dates: paramStartDate && paramEndDate ? [
          {
            startDate: new Date(paramStartDate),
            endDate: new Date(paramEndDate),
            key: "selection",
          },
        ] : null,
        options: paramOptionsJson ? JSON.parse(paramOptionsJson) : null,
      };
    }

    // Fallback to location state
    return {
      destination: location.state?.destination || "",
      dates: location.state?.dates || null,
      options: location.state?.options || null,
    };
  };

  const loaded = loadSearchData();
  
  // Initialize state with priority: URL params > localStorage > loaded data > defaults
  const [destination, setDestination] = useState(() => {
    return (
      destinationParam ||
      savedSearchData?.destination ||
      loaded.destination ||
      ""
    );
  });

  // Initialize dates empty; will populate via effects (URL > context > localStorage > location.state)
  const [dates, setDates] = useState([]);

  const [openDate, setOpenDate] = useState(false);
  
  const [options, setOptions] = useState(() => {
    const urlOptions = searchParams.get("options");
    if (urlOptions) {
      try {
        return JSON.parse(urlOptions);
      } catch (e) {
        console.error("Error parsing URL options:", e);
      }
    }

    return savedSearchData?.options || loaded.options || { adults: 1, children: 0, rooms: 1 };
  });
  const [min, setMin] = useState(undefined);
  const [max, setMax] = useState(undefined);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("recommended");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectingDateType, setSelectingDateType] = useState(null); // 'start' or 'end'

  // Verify city from Featured component
  useEffect(() => {
    if (selectedCity && cityParam) {
      const isValid = selectedCity.slug === cityParam;
      console.log(`\n📍 City Validation Report:`);
      console.log(`  Saved city slug: ${selectedCity.slug}`);
      console.log(`  URL city param: ${cityParam}`);
      console.log(`  Result: ${isValid ? "✓ VALID" : "✗ INVALID"}`);
      console.log(`  Destination: ${selectedCity.name}`);
      
      if (isValid) {
        console.log(`✓ User navigated from Featured component\n`);
      } else {
        console.warn("⚠️ City mismatch detected - user may have accessed directly\n");
      }
    } else {
      if (!selectedCity) {
        console.warn("⚠️ No city data in localStorage");
      }
      if (!cityParam) {
        console.warn("⚠️ No city param in URL");
      }
    }
  }, [selectedCity, cityParam]);

  // Sync URL params with component state when user performs new search
  useEffect(() => {
    console.log("\n🔄 URL Parameters Changed - Syncing state...");
    
    // Update destination from URL
    const urlDestination = searchParams.get("destination");
    if (urlDestination && urlDestination !== destination) {
      setDestination(urlDestination);
      console.log("✓ Updated destination from URL:", urlDestination);
    }

    // Update dates from URL
    const urlStartDate = searchParams.get("startDate");
    const urlEndDate = searchParams.get("endDate");
    if (urlStartDate && urlEndDate) {
      setDates([{
        startDate: new Date(urlStartDate),
        endDate: new Date(urlEndDate),
        key: "selection",
      }]);
      console.log("✓ Updated dates from URL");
    }

    // Update options from URL
    const urlOptions = searchParams.get("options");
    if (urlOptions) {
      try {
        const parsedOptions = JSON.parse(urlOptions);
        if (JSON.stringify(parsedOptions) !== JSON.stringify(options)) {
          setOptions(parsedOptions);
          console.log("✓ Updated options from URL:", parsedOptions);
        }
      } catch (e) {
        console.error("Error parsing options from URL:", e);
      }
    }
  }, [searchParams]); // This effect runs when URL params change

  // Calculate total guests
  const totalGuests = (options && options.adults || 0) + (options && options.children || 0);
  const numRooms = (options && options.rooms) || 1;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debouncedDestination, setDebouncedDestination] = useState(destination);

  // Debounce destination input - wait 500ms before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDestination(destination);
      console.log("🔍 Searching for destination:", destination);
    }, 500);

    return () => clearTimeout(timer);
  }, [destination]);

  // Fetch hotels with available rooms
  useEffect(() => {
    // Use debounced destination to avoid too many API calls
    const searchDestination = debouncedDestination || destinationParam;
    
    // Allow search if destination exists OR type filter is set
    if (!searchDestination && !typeParam) {
      setData([]);
      return;
    }

    const fetchAvailableHotels = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build room requests based on total guests and number of rooms
        // Distribute guests across rooms as evenly as possible
        const numRoomsToBook = numRooms || 1;
        const totalGuestsCount = totalGuests || 1;
        const adultsCount = (options && options.adults) || 1;
        const childrenCount = (options && options.children) || 0;
        const adultsPerRoom = Math.ceil(adultsCount / numRoomsToBook);
        
        const roomRequests = [];
        for (let i = 0; i < numRoomsToBook; i++) {
          const isLastRoom = i === numRoomsToBook - 1;
          roomRequests.push({
            adults: isLastRoom ? adultsCount - (adultsPerRoom * (numRoomsToBook - 1)) : adultsPerRoom,
            children: isLastRoom ? childrenCount : 0,
          });
        }

        const payload = {
          city: searchDestination || "", // Empty string allowed when type is specified
          roomRequests: roomRequests,
          startDate: dates && dates[0] && dates[0].startDate ? dates[0].startDate : null,
          endDate: dates && dates[0] && dates[0].endDate ? dates[0].endDate : null,
          roomsRequested: numRooms,
        };

        // Add type filter if typeParam exists (from URL query)
        if (typeParam) {
          payload.type = typeParam;
          console.log("🏠 Filtering by type from URL:", payload.type);
        }

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

        // Apply rating filter
        if (minRating > 0) {
          filteredData = filteredData.filter((hotel) => {
            const hotelRating = hotel.star || 0;
            return hotelRating >= minRating;
          });
        }

        console.log("Filtered data:", filteredData.length, "hotels");
        setData(filteredData);
        if (filteredData.length === 0) {
          setError("Không tìm thấy khách sạn phù hợp với điều kiện của bạn");
        }

        // Save search history
        if (user && user._id && searchDestination) {
          try {
            const searchData = {
              destination: searchDestination,
              checkInDate: dates[0]?.startDate,
              checkOutDate: dates[0]?.endDate,
              guests: totalGuests,
              rooms: numRooms,
              priceMin: min,
              priceMax: max,
              searchQuery: `${searchDestination}, ${totalGuests} khách, ${numRooms} phòng`,
            };
            
            await axiosInstance.post(`/searchHistory/${user._id}/save`, searchData);
            
            // Add to context
            dispatch({
              type: "ADD_TO_HISTORY",
              payload: searchData,
            });
          } catch (historyErr) {
            console.log("Failed to save search history:", historyErr);
          }
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
  }, [debouncedDestination, options.rooms, min, max, minRating, dates, typeParam]);

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
                {dates && dates[0] && dates[0].startDate && dates[0].endDate ? (
                  `${format(dates[0].startDate, "dd/MM")} - ${format(dates[0].endDate, "dd/MM")}`
                ) : (
                  "Chọn ngày"
                )}
              </span>
              {openDate && (
                <div>
                  <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
                    {selectingDateType === "start" && "Chọn ngày nhận phòng"}
                    {selectingDateType === "end" && "Chọn ngày trả phòng"}
                    {!selectingDateType && "Chọn ngày nhận phòng"}
                  </p>
                  <CustomCalendar
                    startDate={dates && dates[0] && dates[0].startDate ? dates[0].startDate : null}
                    endDate={dates && dates[0] && dates[0].endDate ? dates[0].endDate : null}
                    onDateChange={(day) => {
                      // If no dates present, initialize with day as start
                      if (!dates || !dates[0]) {
                        const newDates = [{ startDate: day, endDate: null, key: "selection" }];
                        setDates(newDates);
                        setSelectingDateType("end");
                        console.log("✓ Set check-in date:", format(day, "dd/MM"));
                        return;
                      }

                      if (!selectingDateType || selectingDateType === "start") {
                        // First click or clicking to set start date
                        const newDates = [{ ...dates[0], startDate: day, key: "selection" }];
                        setDates(newDates);
                        setSelectingDateType("end"); // Next click should be for end date
                        console.log("✓ Set check-in date:", format(day, "dd/MM"));
                      } else {
                        // Second click for end date
                        const currentStart = dates && dates[0] && dates[0].startDate;
                        if (!currentStart || day > currentStart) {
                          const newDates = [{ ...dates[0], endDate: day, key: "selection" }];
                          setDates(newDates);
                          setSelectingDateType(null); // Reset
                          setOpenDate(false); // Close calendar
                          console.log("✓ Set check-out date:", format(day, "dd/MM"));
                        } else {
                          alert("Ngày trả phòng phải sau ngày nhận phòng!");
                        }
                      }
                    }}
                  />
                </div>
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
                    <input 
                      type="radio" 
                      name="rating"
                      value={rating}
                      checked={minRating === rating}
                      onChange={(e) => setMinRating(Number(e.target.value))}
                    />
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
