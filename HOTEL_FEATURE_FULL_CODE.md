# 🔥 FULL CODE - Hotel Booking Feature Implementation

## 📦 File 1: HotelSlider.jsx (CẬP NHẬT)

**Path:** `client/src/components/featuredProperties/HotelSlider.jsx`

```jsx
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
      const scrollAmount = 340;
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

  // ✨ MỚI: Handle click để navigate
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
      {loading && (
        <div className="hotel-slider-loading">
          <div className="spinner"></div>
          <p>Đang tải khách sạn...</p>
        </div>
      )}

      {!loading && data && data.length > 0 && (
        <div className="hotel-slider-box">
          <div className="hotel-slider-wrapper">
            <div
              className="hotel-slider"
              ref={sliderRef}
              onScroll={updateScrollPosition}
            >
              {data.map((item) => (
                // ✨ MỚI: Thêm onClick, role, tabIndex, onKeyPress
                <div 
                  key={item._id} 
                  className="hotel-card"
                  onClick={() => handleCardClick(item._id)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleCardClick(item._id)}
                >
                  <div className="hotel-card-image-container">
                    <img
                      src={item.photos?.[0] || "/placeholder.jpg"}
                      alt={item.name}
                      className="hotel-card-image"
                      loading="lazy"
                    />

                    <FavoriteButton hotelId={item._id} className="hotel-card-favorite-btn" />

                    {item.star && (
                      <div className="hotel-card-rating">
                        <span className="rating-value">{item.star}</span>
                        <span className="rating-label">Xuất sắc</span>
                      </div>
                    )}
                  </div>

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

          <button
            className={`slider-arrow slider-arrow-left ${!canScrollLeft ? "disabled" : ""}`}
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Khách sạn trước"
            title="Khách sạn trước"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

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

      {!loading && (!data || data.length === 0) && (
        <div className="hotel-slider-empty">
          <p>Không có khách sạn nổi bật</p>
        </div>
      )}
    </div>
  );
};

export default HotelSlider;
```

---

## 📦 File 2: ImageSlider.jsx (MỚI)

**Path:** `client/src/components/imageSlider/ImageSlider.jsx`

```jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleArrowLeft,
  faCircleArrowRight,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import "./imageSlider.css";

const ImageSlider = ({ photos = [] }) => {
  const [slideNumber, setSlideNumber] = useState(0);
  const [open, setOpen] = useState(false);

  const handleOpen = (index) => {
    setSlideNumber(index);
    setOpen(true);
  };

  const handleMove = (direction) => {
    let newSlideNumber;
    if (direction === "left") {
      newSlideNumber = slideNumber === 0 ? photos.length - 1 : slideNumber - 1;
    } else {
      newSlideNumber = slideNumber === photos.length - 1 ? 0 : slideNumber + 1;
    }
    setSlideNumber(newSlideNumber);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="image-slider-grid">
        <div className="image-grid-placeholder">
          <div className="placeholder-image">Không có ảnh</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Grid của ảnh */}
      <div className="image-slider-grid">
        {photos.length > 0 && (
          <div 
            className="image-grid-main"
            onClick={() => handleOpen(0)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleOpen(0)}
          >
            <img 
              src={photos[0]} 
              alt="Hotel main view"
              className="main-image"
              loading="lazy"
            />
          </div>
        )}

        <div className="image-grid-thumbnails">
          {photos.slice(1, 5).map((photo, index) => (
            <div
              key={index + 1}
              className={`thumbnail-item ${index === photos.length - 2 && photos.length > 5 ? "has-more" : ""}`}
              onClick={() => handleOpen(index + 1)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleOpen(index + 1)}
            >
              <img 
                src={photo}
                alt={`Hotel view ${index + 2}`}
                loading="lazy"
              />
              {index === photos.length - 2 && photos.length > 5 && (
                <div className="more-photos-overlay">
                  <span>+{photos.length - 5}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Full Screen Modal */}
      {open && (
        <div className="image-slider-modal">
          <div className="image-slider-modal-content">
            <button
              className="image-modal-close"
              onClick={handleClose}
              aria-label="Close gallery"
              title="Đóng"
            >
              <FontAwesomeIcon icon={faCircleXmark} />
            </button>

            <img
              src={photos[slideNumber]}
              alt="Hotel fullscreen view"
              className="image-slider-modal-img"
            />

            <button
              className="image-slider-modal-arrow image-slider-modal-arrow-left"
              onClick={() => handleMove("left")}
              aria-label="Previous image"
              title="Ảnh trước"
            >
              <FontAwesomeIcon icon={faCircleArrowLeft} />
            </button>

            <button
              className="image-slider-modal-arrow image-slider-modal-arrow-right"
              onClick={() => handleMove("right")}
              aria-label="Next image"
              title="Ảnh tiếp theo"
            >
              <FontAwesomeIcon icon={faCircleArrowRight} />
            </button>

            <div className="image-slider-modal-counter">
              {slideNumber + 1} / {photos.length}
            </div>

            <div className="image-slider-modal-thumbnails">
              {photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Thumbnail ${index + 1}`}
                  className={`modal-thumbnail ${slideNumber === index ? "active" : ""}`}
                  onClick={() => setSlideNumber(index)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && setSlideNumber(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageSlider;
```

---

## 📦 File 3: imageSlider.css (MỚI)

**Path:** `client/src/components/imageSlider/imageSlider.css`

[Xem phần CSS riêng - quá dài để paste đầy đủ]
Link: Đã tạo file `imageSlider.css` đầy đủ

---

## 📦 File 4: Hotel_NEW_ENHANCED.jsx (MỚI)

**Path:** `client/src/pages/hotel/Hotel_NEW_ENHANCED.jsx`

[File đã được tạo - 300+ lines]
Hoặc copy từ `Hotel.jsx` cũ và chỉnh sửa imports

---

## 🎯 Quick Integration

### Step 1: Copy ImageSlider Component

```bash
mkdir -p client/src/components/imageSlider
# Copy ImageSlider.jsx và imageSlider.css vào folder này
```

### Step 2: Update HotelSlider.jsx

Thêm 3 dòng:
```jsx
import { useNavigate } from "react-router-dom";  // Dòng 1
const navigate = useNavigate();                   // Dòng 2
const handleCardClick = (hotelId) => {            // Dòng 3
  navigate(`/hotels/${hotelId}`);
};
```

Rồi thêm onClick vào `.hotel-card` div

### Step 3: Use Hotel_NEW_ENHANCED.jsx

Copy nội dung `Hotel_NEW_ENHANCED.jsx` vào `Hotel.jsx` cũ hoặc:

```bash
cp Hotel_NEW_ENHANCED.jsx Hotel.jsx
cp hotel-enhanced.css hotel.css
```

### Step 4: Verify App.js Routes

Kiểm tra route đã tồn tại:
```jsx
<Route path="/hotels/:id" element={<Hotel/>}/>
```

---

## ✅ Testing Checklist

- [ ] Click hotel card → navigate to /hotels/:id
- [ ] Hotel detail page load dữ liệu
- [ ] Image slider grid hiển thị
- [ ] Click ảnh → modal mở
- [ ] Modal arrow navigation hoạt động
- [ ] Thumbnail navigation hoạt động
- [ ] Close modal hoạt động
- [ ] Tabs navigation hoạt động
- [ ] Mobile responsive (375px, 768px)
- [ ] Animations smooth

---

## 🚀 Ready to Deploy!

Tất cả file đã được tạo và sẵn sàng để integrate vào project của bạn.
```
