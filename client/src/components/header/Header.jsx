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
import { useNavigate } from "react-router-dom";
import { SearchContext } from "../../context/SearchContext";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import DateRangePicker from "../DateRangePicker/DateRangePicker";
import ServiceTabs from "../serviceTabs/ServiceTabs";
import "./header.css";

const Header = ({ type }) => {
  const [destination, setDestination] = useState("");
  const [showDestinationError, setShowDestinationError] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [openSuggestions, setOpenSuggestions] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  const [dates, setDates] = useState(() => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    return [
      {
        startDate: startDate,
        endDate: endDate,
        key: "selection",
      },
    ];
  });
  const [openOptions, setOpenOptions] = useState(false);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const [options, setOptions] = useState({
    rooms: [
      {
        adults: 1,
        children: 0,
      },
    ],
  });

  const optionsContainerRef = useRef(null);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

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

  const handleOption = (roomIndex, type, operation) => {
    setOptions((prev) => {
      const newOptions = { ...prev };
      if (operation === "i") {
        newOptions.rooms[roomIndex][type] += 1;
      } else {
        if (type === "adults" && newOptions.rooms[roomIndex][type] > 1) {
          newOptions.rooms[roomIndex][type] -= 1;
        } else if (type === "children" && newOptions.rooms[roomIndex][type] > 0) {
          newOptions.rooms[roomIndex][type] -= 1;
        }
      }
      return newOptions;
    });
  };

  const handleAddRoom = () => {
    setOptions((prev) => ({
      ...prev,
      rooms: [...prev.rooms, { adults: 1, children: 0 }],
    }));
  };

  const handleRemoveRoom = (roomIndex) => {
    if (options.rooms.length > 1) {
      setOptions((prev) => ({
        ...prev,
        rooms: prev.rooms.filter((_, idx) => idx !== roomIndex),
      }));
      if (selectedRoomIndex >= options.rooms.length - 1) {
        setSelectedRoomIndex(options.rooms.length - 2);
      }
    }
  };

  useEffect(() => {
    if (destination.trim().length > 0) {
      fetchHotelSuggestions(destination);
    } else {
      setSuggestions([]);
      setOpenSuggestions(false);
    }
  }, [destination]);

  const fetchHotelSuggestions = async (query) => {
    try {
      const { data } = await axiosInstance.get(`/hotels?city=${query}`);
      const uniqueCities = [...new Set(data.map((hotel) => hotel.city))];
      const citySuggestions = uniqueCities
        .filter((city) => city.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8);

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

  const handleSearch = () => {
    if (!destination || destination.trim() === "") {
      setShowDestinationError(true);
      return;
    }

    if (!dates[0].startDate || !dates[0].endDate) {
      alert("Vui lòng chọn ngày nhận và trả phòng!");
      return;
    }

    if (new Date(dates[0].startDate).getTime() >= new Date(dates[0].endDate).getTime()) {
      alert("Ngày nhận phòng phải trước ngày trả phòng!");
      return;
    }

    for (let room of options.rooms) {
      if (room.adults < 1) {
        alert("Mỗi phòng phải có ít nhất 1 người lớn!");
        return;
      }
    }

    dispatch({
      type: "NEW_SEARCH",
      payload: {
        destination,
        dates,
        options,
      },
    });
    navigate("/hotels", {
      state: {
        destination,
        dates,
        options,
      },
    });
  };

  if (type === "list") {
    return (
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[
              { icon: faBed, label: "Lưu trú", active: true },
              { icon: faPlane, label: "Chuyến bay", active: false },
              { icon: faCar, label: "Cho thuê xe", active: false },
              { icon: faBed, label: "Địa điểm", active: false },
              { icon: faTaxi, label: "Taxi", active: false },
            ].map((item, idx) => (
              <button
                key={idx}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${item.active
                  ? "bg-primary-700 text-white"
                  : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                <FontAwesomeIcon icon={item.icon} className="text-sm" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
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
                  }}
                  onBlur={() => {
                    setTimeout(() => setOpenSuggestions(false), 200);
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) {
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
                    }}
                    type="button"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
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
                  <span className="font-medium">{format(dates[0].startDate, "dd MMM")}</span>
                  <span className="text-slate-400">—</span>
                  <span className="font-medium">{format(dates[0].endDate, "dd MMM")}</span>
                </div>
              </button>

              {openDate && (
                <div className="absolute top-full left-0 mt-2 z-50">
                  <DateRangePicker
                    initialStartDate={dates[0].startDate}
                    initialEndDate={dates[0].endDate}
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
            <div className="relative" ref={optionsContainerRef}>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Guests — Rooms
              </label>
              <button
                onClick={() => setOpenOptions(!openOptions)}
                className="w-full input-base flex items-center gap-3 text-left border-2 border-blue-500 hover:bg-blue-50 transition-all"
                type="button"
              >
                <FontAwesomeIcon icon={faPerson} className="text-blue-600 text-base" />
                <span className="text-sm font-semibold text-slate-900">
                  {options.rooms[0].adults} adults · {options.rooms[0].children} children · {options.rooms.length} room
                </span>
              </button>

              {openOptions && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-4">
                  <div className="flex flex-col gap-4">
                    {/* Adults */}
                    <div className="flex flex-col items-center gap-2">
                      <label className="text-xs font-semibold text-slate-900">Adults</label>
                      <div className="flex items-center gap-3 border-2 border-slate-300 rounded-full px-5 py-2 bg-white w-full justify-center">
                        <button
                          type="button"
                          disabled={options.rooms[0].adults <= 1}
                          className="text-slate-400 hover:text-primary-700 disabled:opacity-30 disabled:cursor-not-allowed text-base font-bold transition-colors"
                          onClick={() => handleOption(0, "adults", "d")}
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-slate-900">{options.rooms[0].adults}</span>
                        <button
                          type="button"
                          className="text-slate-400 hover:text-primary-700 text-base font-bold transition-colors"
                          onClick={() => handleOption(0, "adults", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex flex-col items-center gap-2">
                      <label className="text-xs font-semibold text-slate-900">Children</label>
                      <div className="flex items-center gap-3 border-2 border-slate-300 rounded-full px-5 py-2 bg-white w-full justify-center">
                        <button
                          type="button"
                          disabled={options.rooms[0].children <= 0}
                          className="text-slate-400 hover:text-primary-700 disabled:opacity-30 disabled:cursor-not-allowed text-base font-bold transition-colors"
                          onClick={() => handleOption(0, "children", "d")}
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-slate-900">{options.rooms[0].children}</span>
                        <button
                          type="button"
                          className="text-slate-400 hover:text-primary-700 text-base font-bold transition-colors"
                          onClick={() => handleOption(0, "children", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Rooms */}
                    <div className="flex flex-col items-center gap-2">
                      <label className="text-xs font-semibold text-slate-900">Rooms</label>
                      <div className="flex items-center gap-3 border-2 border-slate-300 rounded-full px-5 py-2 bg-white w-full justify-center">
                        <button
                          type="button"
                          disabled={options.rooms.length <= 1}
                          className="text-slate-400 hover:text-primary-700 disabled:opacity-30 disabled:cursor-not-allowed text-base font-bold transition-colors"
                          onClick={() => handleRemoveRoom(options.rooms.length - 1)}
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-slate-900">{options.rooms.length}</span>
                        <button
                          type="button"
                          className="text-slate-400 hover:text-primary-700 text-base font-bold transition-colors"
                          onClick={handleAddRoom}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
