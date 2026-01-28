import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import Footer from "../../components/footer/Footer";
import ImageSlider from "../../components/imageSlider/ImageSlider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./hotel.css";
import {
  faLocationDot,
  faStar,
  faWifi,
  faParking,
  faSwimmingPool,
  faCheck,
  faBed,
  faUser,
  faClock,
  faMapPin,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useState, useRef, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import { useLocation, useNavigate } from "react-router-dom";
import { SearchContext } from "../../context/SearchContext";
import { AuthContext } from "../../context/AuthContext";
import Reserve from "../../components/reserve/Reserve";
import FavoriteButton from "../../components/favoriteButton/FavoriteButton";

const Hotel = () => {
  const location = useLocation();
  const id = location.pathname.split("/")[2];
  const [openModal, setOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const reserveRef = useRef(null);

  const { data, loading, error } = useFetch(`/hotels/${id}`);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { dates } = useContext(SearchContext);

  // Smooth scroll vào Reserve section
  useEffect(() => {
    if (openModal && reserveRef.current) {
      setTimeout(() => {
        reserveRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => {
          window.scrollBy({ top: -110, behavior: "smooth" });
        }, 300);
      }, 100);
    }
  }, [openModal]);

  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
  function dayDifference(date1, date2) {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / MILLISECONDS_PER_DAY);
  }

  const days = dates && dates.length > 0 && dates[0]?.startDate && dates[0]?.endDate 
    ? dayDifference(dates[0].endDate, dates[0].startDate) 
    : 0;

  const handleReserveClick = () => {
    if (user) {
      setOpenModal(true);
    } else {
      navigate("/login");
    }
  };

  // Amenities list
  const amenities = [
    { icon: faWifi, label: "Wi-Fi miễn phí", description: "Kết nối internet nhanh" },
    { icon: faParking, label: "Bãi đỗ xe", description: "Bãi đỗ xe miễn phí" },
    { icon: faSwimmingPool, label: "Bể bơi", description: "Bể bơi ngoài trời" },
    { icon: faBed, label: "Phòng gia đình", description: "Các phòng rộng rãi" },
  ];

  // Room features
  const roomFeatures = [
    "Máy điều hòa không khí",
    "Phòng tắm riêng",
    "TV màn hình phẳng",
    "Minibar",
    "Wi-Fi miễn phí",
    "Bàn làm việc",
  ];

  if (error) {
    return (
      <div>
        <Navbar />
        <Header type="list" />
        <div className="hotelErrorContainer">
          <p>Lỗi tải thông tin khách sạn. Vui lòng thử lại.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="hotel-page-wrapper">
      <Navbar />
      <Header type="list" />

      {loading ? (
        <div className="loadingHotel">
          <div className="spinner" />
          <p>Đang tải thông tin khách sạn...</p>
        </div>
      ) : data ? (
        <div className="hotelContainer">
          <div className="hotelWrapper">
            {/* Hero Section với Image Slider */}
            <div className="hotelHeroSection">
              <ImageSlider photos={data.photos || []} />
            </div>

            {/* Hotel Header Info */}
            <div className="hotelHeader">
              <div className="hotelHeaderInfo">
                <div className="headerTitleBlock">
                  <h1 className="hotelTitle">{data.name}</h1>
                  <div className="hotelAddress">
                    <FontAwesomeIcon icon={faMapPin} />
                    <span>{data.address}</span>
                  </div>
                  
                  {/* Rating */}
                  <div className="hotelRatingBlock">
                    <div className="ratingBox">
                      <div className="ratingStars">
                        {Array(Math.floor(data.star || 4)).fill().map((_, i) => (
                          <FontAwesomeIcon key={i} icon={faStar} />
                        ))}
                      </div>
                      <span className="ratingScore">{data.star || 4.0}</span>
                      <span className="ratingLabel">Xuất sắc</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hotelHeaderActions">
                <FavoriteButton hotelId={data._id} className="header-favorite-btn" />
                <button className="bookNowBtn" onClick={handleReserveClick}>
                  Giữ phòng ngay
                </button>
              </div>
            </div>

            {/* Quick Info Bar */}
            <div className="hotelQuickInfo">
              <div className="quickInfoItem">
                <FontAwesomeIcon icon={faClock} />
                <div>
                  <p className="label">Check-in</p>
                  <p className="value">Từ 14:00</p>
                </div>
              </div>
              <div className="quickInfoItem">
                <FontAwesomeIcon icon={faClock} />
                <div>
                  <p className="label">Check-out</p>
                  <p className="value">Trước 12:00</p>
                </div>
              </div>
              <div className="quickInfoItem">
                <FontAwesomeIcon icon={faUser} />
                <div>
                  <p className="label">Giá từ</p>
                  <p className="value">₫{(data.cheapestPrice || 1000000).toLocaleString("vi-VN")}</p>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="hotelTabs">
              <button 
                className={`tabButton ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                Tổng quan
              </button>
              <button 
                className={`tabButton ${activeTab === "rooms" ? "active" : ""}`}
                onClick={() => setActiveTab("rooms")}
              >
                Phòng
              </button>
              <button 
                className={`tabButton ${activeTab === "amenities" ? "active" : ""}`}
                onClick={() => setActiveTab("amenities")}
              >
                Tiện nghi
              </button>
            </div>

            {/* Content Area */}
            <div className="hotelContent">
              <div className="hotelMain">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="tabContent">
                    <div className="hotelSection">
                      <h2>Về chỗ ở này</h2>
                      <p className="hotelDesc">{data.desc}</p>
                    </div>

                    <div className="hotelSection">
                      <h2>Lý do bạn sẽ yêu nơi này</h2>
                      <div className="highlights">
                        <div className="highlightItem">
                          <FontAwesomeIcon icon={faCheck} />
                          <span>Vị trí tuyệt vời</span>
                        </div>
                        <div className="highlightItem">
                          <FontAwesomeIcon icon={faCheck} />
                          <span>Rating cao trên booking.com</span>
                        </div>
                        <div className="highlightItem">
                          <FontAwesomeIcon icon={faCheck} />
                          <span>Hủy đặt phòng miễn phí</span>
                        </div>
                        <div className="highlightItem">
                          <FontAwesomeIcon icon={faCheck} />
                          <span>Thanh toán tại chỗ</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rooms Tab */}
                {activeTab === "rooms" && (
                  <div className="tabContent">
                    <div className="hotelSection">
                      <h2>Phòng có sẵn</h2>
                      <div className="roomsGrid">
                        <div className="roomCard">
                          <div className="roomCardHeader">
                            <h3>Phòng đơn</h3>
                            <span className="roomPrice">₫{(data.cheapestPrice || 1000000).toLocaleString("vi-VN")}</span>
                          </div>
                          <div className="roomFeatures">
                            {roomFeatures.slice(0, 3).map((feature, idx) => (
                              <p key={idx}><FontAwesomeIcon icon={faCheck} /> {feature}</p>
                            ))}
                          </div>
                        </div>

                        <div className="roomCard">
                          <div className="roomCardHeader">
                            <h3>Phòng đôi</h3>
                            <span className="roomPrice">₫{((data.cheapestPrice || 1000000) * 1.2).toLocaleString("vi-VN")}</span>
                          </div>
                          <div className="roomFeatures">
                            {roomFeatures.slice(3, 6).map((feature, idx) => (
                              <p key={idx}><FontAwesomeIcon icon={faCheck} /> {feature}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Amenities Tab */}
                {activeTab === "amenities" && (
                  <div className="tabContent">
                    <div className="hotelSection">
                      <h2>Tiện nghi chính</h2>
                      <div className="amenitiesGrid">
                        {amenities.map((amenity, idx) => (
                          <div key={idx} className="amenityCard" style={{ animationDelay: `${idx * 0.1}s` }}>
                            <div className="amenityIcon">
                              <FontAwesomeIcon icon={amenity.icon} />
                            </div>
                            <h3>{amenity.label}</h3>
                            <p>{amenity.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="hotelSidebar">
                <div className="sidebarContent">
                  <div className="priceBox">
                    <div className="priceBoxTitle">
                      <p className="label">Giá mỗi đêm</p>
                      <p className="price">₫{(data.cheapestPrice || 1000000).toLocaleString("vi-VN")}</p>
                    </div>

                    <div className="stayInfo">
                      <div className="infoRow">
                        <span className="infoLabel">Loại khách sạn:</span>
                        <span className="infoValue">{data.type || "Khách sạn"}</span>
                      </div>
                      <div className="infoRow">
                        <span className="infoLabel">Thành phố:</span>
                        <span className="infoValue">{data.city}</span>
                      </div>
                      <div className="infoRow">
                        <span className="infoLabel">Số phòng:</span>
                        <span className="infoValue">{data.rooms?.length || "20"}</span>
                      </div>
                      {days > 0 && (
                        <div className="infoRow highlight">
                          <span className="infoLabel">Tổng giá ({days} đêm):</span>
                          <span className="infoValue">₫{((data.cheapestPrice || 1000000) * days).toLocaleString("vi-VN")}</span>
                        </div>
                      )}
                    </div>

                    <button className="reserveBtn" onClick={handleReserveClick}>
                      Giữ Phòng Ngay
                    </button>

                    <div className="sidebarNote">
                      <p>✓ Hủy miễn phí trước 48 giờ</p>
                      <p>✓ Không phí ẩn</p>
                      <p>✓ Thanh toán an toàn</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reserve Section */}
              <div className="reserveTableContainer" ref={reserveRef} style={{ display: openModal ? "block" : "none" }}>
                <Reserve hotelId={id} dates={dates} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="hotelErrorContainer">
          <p>Không tìm thấy thông tin khách sạn</p>
        </div>
      )}

      <MailList />
      <Footer />
    </div>
  );
};

export default Hotel;
