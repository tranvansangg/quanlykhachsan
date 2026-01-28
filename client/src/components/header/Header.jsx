import {
  faBed,
  faCalendarDays,
  faCar,
  faPerson,
  faPlane,
  faTaxi,
  faMapMarkerAlt,
  faMagnifyingGlass,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SearchContext } from "../../context/SearchContext";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import DateRangePicker from "../DateRangePicker/DateRangePicker";
import GuestPicker from "../GuestPicker/GuestPicker";
import ServiceTabs from "../serviceTabs/ServiceTabs";
import "./header.css";

const Header = ({ type }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();

  // Helper function to load search data from query params or localStorage
  const loadSearchData = () => {
    try {
      // Try to get from query params first
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

      // Fallback to localStorage
      const stored = localStorage.getItem("searchData");
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Get parsed dates
        let loadedDates = null;
        if (parsed.dates && parsed.dates.length > 0) {
          loadedDates = parsed.dates.map(d => ({
            startDate: new Date(d.startDate),
            endDate: new Date(d.endDate),
            key: d.key || "selection",
          }));
        }

        // VALIDATION: Check if check-in date is in the past
        // If yes, clear the dates (user must select new dates)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (loadedDates && loadedDates[0]) {
          const checkInDate = new Date(loadedDates[0].startDate);
          checkInDate.setHours(0, 0, 0, 0);
          
          if (checkInDate < today) {
            console.log("[SearchData] Check-in date is in the past, clearing dates");
            console.log(`[SearchData] Old dates: ${loadedDates[0].startDate} - ${loadedDates[0].endDate}`);
            
            // Clear dates and localStorage - user must select new dates
            loadedDates = null;
            localStorage.removeItem("searchData");
          }
        }
        
        return {
          destination: parsed.destination || "",
          dates: loadedDates,
          options: parsed.options || null,
        };
      }
    } catch (error) {
      console.error("Error loading search data:", error);
    }
    return null;
  };

  const [destination, setDestination] = useState("");
  const [showDestinationError, setShowDestinationError] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [openSuggestions, setOpenSuggestions] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  const [dates, setDates] = useState([]);  // Empty by default - user must select dates
  const [openOptions, setOpenOptions] = useState(false);
  const [options, setOptions] = useState({
    adults: 1,
    children: 0,
    rooms: 1,
  });
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  const optionsContainerRef = useRef(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentSearches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading recent searches:", error);
    }
  }, []);

  // Load search data on mount for all pages
  useEffect(() => {
    const loaded = loadSearchData();
    if (loaded) {
      if (loaded.destination) {
        setDestination(loaded.destination);
      }
      if (loaded.dates) {
        setDates(loaded.dates);
      }
      if (loaded.options) {
        setOptions(loaded.options);
      }
    }
  }, []);

  // Monitor date changes and update cache to force API refetch
  useEffect(() => {
    if (dates && dates[0] && dates[0].startDate && dates[0].endDate) {
      // When dates change, update localStorage
      // This ensures any component watching for date changes will detect it
      const searchData = {
        destination,
        dates: dates.map(d => ({
          startDate: d.startDate instanceof Date ? d.startDate.toISOString() : d.startDate,
          endDate: d.endDate instanceof Date ? d.endDate.toISOString() : d.endDate,
          key: d.key,
        })),
        options,
        timestamp: new Date().toISOString(), // Update timestamp to indicate fresh search
      };
      localStorage.setItem("searchData", JSON.stringify(searchData));
      console.log("[Header] Dates updated, cache refreshed", dates[0].startDate, dates[0].endDate);
    }
  }, [dates, destination, options]);

  // Click-outside detection for options picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsContainerRef.current && !optionsContainerRef.current.contains(event.target)) {
        setOpenOptions(false);
      }
    };

    if (openOptions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openOptions]);

  const handleQuickDateSelect = (days) => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    setDates([
      {
        startDate: startDate,
        endDate: endDate,
        key: "selection",
      },
    ]);
    setOpenDate(false);
  };

  const handleOption = (type, operation) => {
    setOptions((prev) => {
      const newOptions = { ...prev };
      if (operation === "i") {
        newOptions[type] += 1;
      } else {
        if (type === "adults" && newOptions[type] > 1) {
          newOptions[type] -= 1;
        } else if (type === "children" && newOptions[type] > 0) {
          newOptions[type] -= 1;
        } else if (type === "rooms" && newOptions[type] > 1) {
          newOptions[type] -= 1;
        }
      }
      return newOptions;
    });
  };

  const handleAddRoom = () => {
    setOptions((prev) => ({
      ...prev,
      rooms: prev.rooms + 1,
    }));
  };

  const handleRemoveRoom = () => {
    setOptions((prev) => ({
      ...prev,
      rooms: Math.max(1, prev.rooms - 1),
    }));
  };

  useEffect(() => {
    // Debounce để tránh gọi API quá nhiều lần
    const timer = setTimeout(() => {
      if (destination.trim().length > 0) {
        fetchHotelSuggestions(destination);
      } else {
        setSuggestions([]);
        setOpenSuggestions(false);
      }
    }, 300); // Chờ 300ms sau khi user ngừng gõ

    return () => clearTimeout(timer);
  }, [destination]);

  // Search data is now saved only on explicit search button click (in handleSearch function)
  // Removed auto-save useEffect to prevent continuous updates on every input change

  const fetchHotelSuggestions = async (query) => {
    try {
      // Sử dụng endpoint search-cities riêng để hiệu quả hơn
      const { data } = await axiosInstance.get(`/hotels/search-cities/${encodeURIComponent(query)}`);
      
      // data là mảng cities đã sắp xếp
      const citySuggestions = data.slice(0, 8);

      setSuggestions(citySuggestions);
      setOpenSuggestions(citySuggestions.length > 0);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (city) => {
    setDestination(city);
    setOpenSuggestions(false);
  };

  const { dispatch } = useContext(SearchContext);

  const saveSearchData = (searchPayload) => {
    // Save to localStorage with dates converted to ISO strings
    const searchData = {
      destination: searchPayload.destination,
      dates: searchPayload.dates.map(d => ({
        startDate: d.startDate instanceof Date ? d.startDate.toISOString() : d.startDate,
        endDate: d.endDate instanceof Date ? d.endDate.toISOString() : d.endDate,
        key: d.key,
      })),
      options: searchPayload.options,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("searchData", JSON.stringify(searchData));
  };

  const saveRecentSearch = (searchPayload) => {
    try {
      // Create a recent search object
      const recentSearch = {
        destination: searchPayload.destination,
        startDate: searchPayload.dates[0].startDate.toISOString(),
        endDate: searchPayload.dates[0].endDate.toISOString(),
        totalGuests: ((searchPayload.options && searchPayload.options.adults) || 0) + ((searchPayload.options && searchPayload.options.children) || 0),
        numRooms: (searchPayload.options && searchPayload.options.rooms) || 1,
        timestamp: new Date().toISOString(),
      };

      // Get existing recent searches
      let searches = [];
      try {
        const stored = localStorage.getItem("recentSearches");
        if (stored) {
          searches = JSON.parse(stored);
        }
      } catch (e) {
        searches = [];
      }

      // Remove duplicate (same destination) and add new search to front
      searches = searches.filter(s => s.destination.toLowerCase() !== searchPayload.destination.toLowerCase());
      searches.unshift(recentSearch);

      // Keep only last 5 searches
      searches = searches.slice(0, 5);

      localStorage.setItem("recentSearches", JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (error) {
      console.error("Error saving recent search:", error);
    }
  };

  const handleRecentSearchClick = (search) => {
    setDestination(search.destination);
    setDates([
      {
        startDate: new Date(search.startDate),
        endDate: new Date(search.endDate),
        key: "selection",
      },
    ]);
    setShowRecentSearches(false);
  };

  const handleSearch = () => {
    if (!destination || destination.trim() === "") {
      setShowDestinationError(true);
      return;
    }

    // Check if dates are selected
    if (!dates || !dates[0] || !dates[0].startDate || !dates[0].endDate) {
      alert("Vui lòng chọn ngày nhận và trả phòng!");
      return;
    }

    if (new Date(dates[0].startDate).getTime() >= new Date(dates[0].endDate).getTime()) {
      alert("Ngày nhận phòng phải trước ngày trả phòng!");
      return;
    }

    if (!options || options.adults < 1) {
      alert("Phải có ít nhất 1 người lớn!");
      return;
    }

    const searchPayload = {
      destination,
      dates,
      options: options || { adults: 1, children: 0, rooms: 1 },
    };

    // Save search data and recent search
    saveSearchData(searchPayload);
    saveRecentSearch(searchPayload);

    dispatch({
      type: "NEW_SEARCH",
      payload: searchPayload,
    });

    // Build query params
    const queryParams = new URLSearchParams();
    queryParams.set("destination", destination);
    queryParams.set("startDate", dates[0].startDate.toISOString());
    queryParams.set("endDate", dates[0].endDate.toISOString());
    queryParams.set("options", JSON.stringify(options));

    // Preserve city and type filters if they exist in current URL
    const cityParam = searchParams.get("city");
    const typeParam = searchParams.get("type");
    if (cityParam) {
      queryParams.set("city", cityParam);
      console.log("✓ Preserving city filter:", cityParam);
    }
    if (typeParam) {
      queryParams.set("type", typeParam);
      console.log("✓ Preserving type filter:", typeParam);
    }

    navigate("/hotels?" + queryParams.toString(), {
      state: searchPayload,
    });
  };

  if (type === "list" || type === "hotel") {
    return (
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Service Tabs */}
          <div className="flex gap-4 overflow-x-auto pb-4 mb-4">
            {[
              { icon: faBed, label: "Lưu trú", active: true },
              { icon: faPlane, label: "Chuyến bay", active: false },
              { icon: faCar, label: "Cho thuê xe", active: false },
              { icon: faBed, label: "Địa điểm", active: false },
              { icon: faTaxi, label: "Taxi", active: false },
            ].map((item, idx) => (
              <button
                key={idx}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${item.active ? "bg-primary-700 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                <FontAwesomeIcon icon={item.icon} className="text-sm" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Compact Search Box */}
          <div className="bg-amber-400 rounded-lg shadow-lg p-4 border border-amber-500 overflow-visible">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-3 overflow-visible items-end">
              {/* Destination */}
              <div className="relative z-40">
                <label className="block text-xs font-semibold text-slate-900 mb-1">Nơi đến</label>
                <div className="relative overflow-visible">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-700">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </div>
                  <input
                    type="text"
                    placeholder="Bạn muốn đến đâu?"
                    className="input-base pl-10 text-sm"
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setShowDestinationError(false);
                      setShowRecentSearches(false);
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        setOpenSuggestions(false);
                        setShowRecentSearches(false);
                      }, 200);
                    }}
                    onFocus={() => {
                      if (!destination && recentSearches.length > 0) {
                        setShowRecentSearches(true);
                      } else if (suggestions.length > 0) {
                        setOpenSuggestions(true);
                      }
                    }}
                    value={destination}
                    autoComplete="off"
                  />
                  {destination && (
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => {
                        setDestination("");
                        setSuggestions([]);
                        setShowRecentSearches(false);
                      }}
                      type="button"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                  {showRecentSearches && !destination && recentSearches.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                      <div className="px-4 py-2 border-b border-slate-100 text-xs font-semibold text-slate-600 bg-slate-50">
                        Tìm kiếm gần đây
                      </div>
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3 border-b border-slate-100 last:border-b-0"
                          onClick={() => handleRecentSearchClick(search)}
                          type="button"
                        >
                          <div className="text-primary-700 mt-0.5">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-slate-900">{search.destination}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {format(new Date(search.startDate), "dd/MM")} - {format(new Date(search.endDate), "dd/MM")} • {search.totalGuests} khách, {search.numRooms} phòng
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {openSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-50">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-4 py-3 flex items-center gap-3 border-b border-slate-100 last:border-b-0 text-sm cursor-pointer"
                          onClick={() => handleSuggestionClick(suggestion)}
                          type="button"
                        >
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="text-primary-700 text-xs flex-shrink-0"
                          />
                          <span className="text-slate-900 font-medium">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Date Range */}
              <div className="relative z-20">
                <label className="block text-xs font-semibold text-slate-900 mb-1">Ngày</label>
                <div className="relative overflow-visible">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-700">
                    <FontAwesomeIcon icon={faCalendarDays} />
                  </div>
                  <input
                    type="text"
                    placeholder="Chọn ngày"
                    value={dates && dates[0] ? `${format(dates[0].startDate, "dd/MM")} - ${format(dates[0].endDate, "dd/MM")}` : ""}
                    className="input-base pl-10 text-sm cursor-pointer"
                    onClick={() => setOpenDate(!openDate)}
                    readOnly
                  />
                  {openDate && (
                    <DateRangePicker
                      dates={dates}
                      onDateChange={(dateRange) => {
                        setDates([
                          {
                            startDate: dateRange.startDate,
                            endDate: dateRange.endDate,
                            key: "selection",
                          },
                        ]);
                      }}
                      onClose={() => setOpenDate(false)}
                    />
                  )}
                </div>
              </div>

              {/* Guests & Rooms */}
              <div className="relative z-10" ref={optionsContainerRef}>
                <label className="block text-xs font-semibold text-slate-900 mb-1">Guests</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-700">
                    <FontAwesomeIcon icon={faPerson} />
                  </div>
                  <input
                    type="text"
                    placeholder="Khách, phòng"
                    className="input-base pl-10 text-sm cursor-pointer"
                    onClick={() => setOpenOptions(!openOptions)}
                    readOnly
                    value={
                      options && options.rooms > 0
                        ? `${(options.adults || 0) + (options.children || 0)} khách, ${options.rooms} phòng`
                        : ""
                    }
                  />
                  {openOptions && (
                    <GuestPicker
                      initialOptions={options}
                      onOptionsChange={setOptions}
                      onClose={() => setOpenOptions(false)}
                    />
                  )}
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-center">
                <button
                  onClick={handleSearch}
                  className="w-full bg-primary-700 text-white px-2 h-11 rounded-lg hover:bg-primary-800 transition-colors font-semibold flex items-center justify-center gap-1.5"
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
                  <span className="text-sm">Tìm kiếm</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="headerHero" id="headerHero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Service Tabs */}
        <ServiceTabs sticky={false} />

        {/* Hero Content */}
        <div className="text-white mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-4 leading-tight">
            Khám phá thế giới của những chỗ ở độc đáo
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-6">
            Hưởng ưu đãi lên đến 30% khi thành viên đặt với chúng tôi
          </p>
          {!user && (
            <button
              onClick={() => navigate("/login")}
              className="bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow inline-block"
            >
              Đăng nhập / Đăng ký
            </button>
          )}
        </div>

        {/* Search Box */}
        <div className="bg-amber-400 rounded-xl shadow-2xl p-6 -mb-8 relative z-10 border-2 border-amber-500 overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-3 mb-4">
            {/* Destination */}
            <div className="relative z-40">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Destination
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-700">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <input
                  type="text"
                  placeholder="Where are you going?"
                  className="input-base pl-10"
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setShowDestinationError(false);
                    setShowRecentSearches(false);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setOpenSuggestions(false);
                      setShowRecentSearches(false);
                    }, 200);
                  }}
                  onFocus={() => {
                    if (!destination && recentSearches.length > 0) {
                      setShowRecentSearches(true);
                    } else if (suggestions.length > 0) {
                      setOpenSuggestions(true);
                    }
                  }}
                  value={destination}
                  autoComplete="off"
                />
                {destination && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => {
                      setDestination("");
                      setSuggestions([]);
                      setShowRecentSearches(false);
                    }}
                    type="button"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
                {showRecentSearches && !destination && recentSearches.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                    <div className="px-4 py-2 border-b border-slate-100 text-xs font-semibold text-slate-600 bg-slate-50">
                      Tìm kiếm gần đây
                    </div>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3 border-b border-slate-100 last:border-b-0"
                        onClick={() => handleRecentSearchClick(search)}
                        type="button"
                      >
                        <div className="text-primary-700 mt-0.5">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-slate-900">{search.destination}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {format(new Date(search.startDate), "dd/MM")} - {format(new Date(search.endDate), "dd/MM")} • {search.totalGuests} khách, {search.numRooms} phòng
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {openSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-3 hover:bg-slate-100 transition-colors flex items-center gap-3 border-b border-slate-100 last:border-b-0"
                        onClick={() => handleSuggestionClick(suggestion)}
                        type="button"
                      >
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="text-primary-700 text-sm"
                        />
                        <span className="text-slate-900">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Check-in — Check-out
              </label>
              <button
                onClick={() => setOpenDate(!openDate)}
                className="flex-1 input-base px-3 py-2 flex items-center justify-center gap-2 text-left relative w-full"
                type="button"
              >
                <FontAwesomeIcon
                  icon={faCalendarDays}
                  className="text-primary-700"
                />
                <div className="flex gap-1 text-sm">
                  {dates && dates[0] ? (
                    <>
                      <span className="font-medium">{format(dates[0].startDate, "dd MMM")}</span>
                      <span className="text-slate-400">—</span>
                      <span className="font-medium">{format(dates[0].endDate, "dd MMM")}</span>
                    </>
                  ) : (
                    <span className="text-slate-400">Chọn ngày nhận - trả phòng</span>
                  )}
                </div>
              </button>

              {openDate && (
                <div className="absolute top-full left-0 mt-2 z-50">
                  <DateRangePicker
                    dates={dates}
                    onDateChange={(dateRange) => {
                      setDates([
                        {
                          startDate: dateRange.startDate,
                          endDate: dateRange.endDate,
                          key: "selection",
                        },
                      ]);
                    }}
                    onClose={() => setOpenDate(false)}
                  />
                </div>
              )}
            </div>

            {/* Guests & Rooms */}
            <div className="relative z-10" ref={optionsContainerRef}>
              <label className="block text-base font-semibold text-slate-900 mb-1">Guests</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-700">
                  <FontAwesomeIcon icon={faPerson} />
                </div>
                <input
                  type="text"
                  placeholder="Khách, phòng"
                  className="input-base pl-10 py-2 text-sm cursor-pointer"
                  onClick={() => setOpenOptions(!openOptions)}
                  readOnly
                  value={
                    options && options.rooms > 0
                      ? `${(options.adults || 0) + (options.children || 0)} khách, ${options.rooms} phòng`
                      : ""
                  }
                />
                {openOptions && (
                  <GuestPicker
                    initialOptions={options}
                    onOptionsChange={setOptions}
                    onClose={() => setOpenOptions(false)}
                  />
                )}
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                className="btn-primary w-full rounded-lg flex items-center justify-center gap-2 h-10"
                onClick={handleSearch}
                type="submit"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
                <span className="hidden md:inline text-sm font-semibold">Tìm kiếm</span>
              </button>
            </div>
          </div>
        </div>
        {!destination.trim() && showDestinationError && (
          <div className="absolute -mt-4 ml-12 z-50">
            <div className="destination-helper-tooltip">
              <p>Enter a destination to start searching.</p>
            </div>
            <div
              style={{
                position: 'absolute',
                top: '-8px',
                left: '8px',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '8px solid #dc2626'
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
