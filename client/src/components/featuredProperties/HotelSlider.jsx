import useFetch from "../../hooks/useFetch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FavoriteButton from "../favoriteButton/FavoriteButton";
import "./hotelSlider.css";

const HotelSlider = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useFetch("/hotels?featured=true&limit=20");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const sliderRef = useRef(null);

  const updateScrollPosition = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    // Check scroll position after data loads
    const timer = setTimeout(() => {
      updateScrollPosition();
    }, 300);
    return () => clearTimeout(timer);
  }, [data]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("scroll", updateScrollPosition);
      window.addEventListener("resize", updateScrollPosition);
      return () => {
        slider.removeEventListener("scroll", updateScrollPosition);
        window.removeEventListener("resize", updateScrollPosition);
      };
    }
  }, []);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 340; // Card width (300px) + gap (16px) + padding
      const newScrollPosition =
        direction === "left"
          ? sliderRef.current.scrollLeft - scrollAmount
          : sliderRef.current.scrollLeft + scrollAmount;

      sliderRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth"
      });

      setTimeout(updateScrollPosition, 600);
    }
  };

  const handleCardClick = (hotelId) => {
    navigate(`/hotels/${hotelId}`);
  };

  if (error) {
    return (
      <div className="hotel-slider-error">
        <p>Có lỗi khi tải dữ liệu khách sạn</p>
      </div>
    );
  }

  return (
    <div className="hotel-slider-container">
      {/* Loading State */}
      {loading && (
        <div className="hotel-slider-loading">
          <div className="spinner"></div>
          <p>Đang tải khách sạn...</p>
        </div>
      )}

      {/* Slider with Absolute Positioned Arrows */}
      {!loading && data && data.length > 0 && (
        <div className="hotel-slider-box">
          {/* Slider Content */}
          <div className="hotel-slider-wrapper">
            <div
              className="hotel-slider"
              ref={sliderRef}
              onScroll={updateScrollPosition}
            >
              {data.map((item) => (
                <div 
                  key={item._id} 
                  className="hotel-card"
                  onClick={() => handleCardClick(item._id)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleCardClick(item._id)}
                >
                  {/* Image Container */}
                  <div className="hotel-card-image-container">
                    <img
                      src={item.photos?.[0] || "/placeholder.jpg"}
                      alt={item.name}
                      className="hotel-card-image"
                      loading="lazy"
                    />

                    {/* Like Button */}
                    <FavoriteButton hotelId={item._id} className="hotel-card-favorite-btn" />

                    {/* Rating Badge */}
                    {item.star && (
                      <div className="hotel-card-rating">
                        <span className="rating-value">{item.star}</span>
                        <span className="rating-label">Xuất sắc</span>
                      </div>
                    )}
                  </div>

                  {/* Hotel Info */}
                  <div className="hotel-card-info">
                    <h3 className="hotel-card-name">{item.name}</h3>
                    <p className="hotel-card-location">
                      <span>📍</span>
                      {item.city}
                    </p>
                    <div className="hotel-card-price">
                      <span className="price-value">
                        ₫{(item.cheapestPrice || 1000000).toLocaleString("vi-VN")}
                      </span>
                      <span className="price-unit">/đêm</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Left Arrow - Absolute Positioned */}
          <button
            className={`slider-arrow slider-arrow-left ${!canScrollLeft ? "disabled" : ""}`}
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Khách sạn trước"
            title="Khách sạn trước"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          {/* Right Arrow - Absolute Positioned */}
          <button
            className={`slider-arrow slider-arrow-right ${!canScrollRight ? "disabled" : ""}`}
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Khách sạn tiếp theo"
            title="Khách sạn tiếp theo"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && (!data || data.length === 0) && (
        <div className="hotel-slider-empty">
          <p>Không có khách sạn nổi bật</p>
        </div>
      )}
    </div>
  );
};

export default HotelSlider;
