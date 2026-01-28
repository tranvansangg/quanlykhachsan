import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import Footer from "../../components/footer/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./hotel.css";
import {
  faCircleArrowLeft,
  faCircleArrowRight,
  faCircleXmark,
  faLocationDot,
  faStar,
  faWifi,
  faParking,
  faSwimmingPool,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useState, useRef } from "react";
import useFetch from "../../hooks/useFetch";
import { useLocation, useNavigate } from "react-router-dom";
import { SearchContext } from "../../context/SearchContext";
import { AuthContext } from "../../context/AuthContext";
import Reserve from "../../components/reserve/Reserve";
import FavoriteButton from "../../components/favoriteButton/FavoriteButton";

const Hotel = () => {
  const location = useLocation();
  const id = location.pathname.split("/")[2];
  const [slideNumber, setSlideNumber] = useState(0);
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const reserveRef = useRef(null);

  const { data, loading, error } = useFetch(`/hotels/${id}`);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { dates } = useContext(SearchContext);

  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
  function dayDifference(date1, date2) {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / MILLISECONDS_PER_DAY);
  }

  const days = dates ? dayDifference(dates[0].endDate, dates[0].startDate) : 0;

  const handleOpen = (i) => {
    setSlideNumber(i);
    setOpen(true);
  };

  const handleMove = (direction) => {
    const photoCount = data.photos?.length || 6;
    let newSlideNumber = slideNumber;
    if (direction === "l") newSlideNumber = slideNumber === 0 ? photoCount - 1 : slideNumber - 1;
    else newSlideNumber = slideNumber === photoCount - 1 ? 0 : slideNumber + 1;
    setSlideNumber(newSlideNumber);
  };

  const handleClick = () => {
    if (user) {
      setOpenModal(true);
      setTimeout(() => {
        if (reserveRef.current) {
          reserveRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
          setTimeout(() => {
            window.scrollBy({ top: -110, behavior: "smooth" });
          }, 300);
        }
      }, 100);
    } else navigate("/login");
  };

  const amenities = [
    { icon: faWifi, label: "Wi-Fi miễn phí" },
    { icon: faParking, label: "Bãi đỗ xe" },
    { icon: faSwimmingPool, label: "Bể bơi ngoài trời" },
    { icon: faWifi, label: "Nhà hàng" },
  ];

  return (
    <div>
      <Navbar />
      <Header type="list" />
      {loading ? (
        <div className="loadingHotel">
          <div className="spinner" />
          <p>Đang tải thông tin khách sạn...</p>
        </div>
      ) : (
        <div className="hotelContainer">
          {open && (
            <div className="slider">
              <FontAwesomeIcon icon={faCircleXmark} className="close" onClick={() => setOpen(false)} />
              <FontAwesomeIcon icon={faCircleArrowLeft} className="arrow" onClick={() => handleMove("l")} />
              <div className="sliderWrapper">
                <img src={data.photos?.[slideNumber] || "/placeholder.jpg"} alt="" className="sliderImg" />
              </div>
              <FontAwesomeIcon icon={faCircleArrowRight} className="arrow" onClick={() => handleMove("r")} />
            </div>
          )}

          <div className="hotelWrapper">
            <div className="hotelHeader">
              <div className="hotelHeaderInfo">
                <div style={{ flex: 1 }}>
                  <h1 className="hotelTitle">{data.name}</h1>
                  <div className="hotelAddress">
                    <FontAwesomeIcon icon={faLocationDot} />
                    <span>{data.address}</span>
                  </div>
                  <div className="hotelRating">
                    <div className="ratingBox">
                      <span className="ratingLabel">Sao</span>
                      <div className="ratingStars">
                        {Array(Math.floor(data.star || 4)).fill().map((_, i) => (
                          <FontAwesomeIcon key={i} icon={faStar} />
                        ))}
                      </div>
                      <span className="ratingScore">{data.star || 4}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hotelHeaderActions">
                <FavoriteButton hotelId={data._id} className="header-favorite-btn" />
                <button className="bookNowBtn" onClick={handleClick}>Giữ phòng ngay</button>
              </div>
            </div>

            <div className="hotelImages">
              {data.photos?.slice(0, 7).map((photo, i) => (
                <div className="hotelImgWrapper" key={i}>
                  <img onClick={() => handleOpen(i)} src={photo} alt="" className="hotelImg" />
                  {i === 6 && data.photos?.length > 7 && (
                    <div className="morePhotos">+{data.photos.length - 7}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="hotelContent">
              <div className="hotelMain">
                <div className="hotelSection">
                  <h2>Về chỗ ở này</h2>
                  <p className="hotelDesc">{data.desc}</p>
                </div>

                <div className="hotelSection">
                  <h2>Tiện nghi</h2>
                  <div className="amenitiesGrid">
                    {amenities.map((amenity, idx) => (
                      <div key={idx} className="amenityCard">
                        <FontAwesomeIcon icon={amenity.icon} className="amenityIcon" />
                        <span>{amenity.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hotelSidebar">
                <div className="sidebarContent">
                  <div className="priceBox">
                    <div className="stayInfo">
                      <div className="infoRow">
                        <span className="infoLabel">Loại khách sạn:</span>
                        <span className="infoValue">{data.type}</span>
                      </div>
                      <div className="infoRow">
                        <span className="infoLabel">Thành phố:</span>
                        <span className="infoValue">{data.city}</span>
                      </div>
                      <div className="infoRow">
                        <span className="infoLabel">Địa chỉ:</span>
                        <span className="infoValue">{data.address}</span>
                      </div>
                      <div className="infoRow">
                        <span className="infoLabel">Khoảng cách:</span>
                        <span className="infoValue">{data.distance}</span>
                      </div>
                    </div>
                    <button className="reserveBtn" onClick={handleClick}>Giữ Phòng Ngay</button>
                  </div>

                  <div className="highlights">
                    <h4>Điểm nổi bật</h4>
                    <div className="highlightList">
                      <p><FontAwesomeIcon icon={faCheck} /> Vị trí tuyệt vời</p>
                      <p><FontAwesomeIcon icon={faCheck} /> Sao cao</p>
                      <p><FontAwesomeIcon icon={faCheck} /> Hủy miễn phí</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="reserveTableContainer" ref={reserveRef}>
                <Reserve hotelId={id} dates={dates} />
              </div>
            </div>
          </div>
        </div>
      )}
      <MailList />
      <Footer />
    </div>
  );
};

export default Hotel;
