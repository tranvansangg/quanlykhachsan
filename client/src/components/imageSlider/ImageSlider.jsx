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

  // Nếu không có ảnh, return placeholder
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
            {/* Close Button */}
            <button
              className="image-modal-close"
              onClick={handleClose}
              aria-label="Close gallery"
              title="Đóng"
            >
              <FontAwesomeIcon icon={faCircleXmark} />
            </button>

            {/* Main Image */}
            <img
              src={photos[slideNumber]}
              alt="Hotel fullscreen view"
              className="image-slider-modal-img"
            />

            {/* Left Arrow */}
            <button
              className="image-slider-modal-arrow image-slider-modal-arrow-left"
              onClick={() => handleMove("left")}
              aria-label="Previous image"
              title="Ảnh trước"
            >
              <FontAwesomeIcon icon={faCircleArrowLeft} />
            </button>

            {/* Right Arrow */}
            <button
              className="image-slider-modal-arrow image-slider-modal-arrow-right"
              onClick={() => handleMove("right")}
              aria-label="Next image"
              title="Ảnh tiếp theo"
            >
              <FontAwesomeIcon icon={faCircleArrowRight} />
            </button>

            {/* Image Counter */}
            <div className="image-slider-modal-counter">
              {slideNumber + 1} / {photos.length}
            </div>

            {/* Thumbnail Navigation */}
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
