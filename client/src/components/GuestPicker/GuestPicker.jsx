import { useEffect, useRef } from "react";
import "./GuestPicker.css";

const GuestPicker = ({ initialOptions, onOptionsChange, onClose }) => {
  // Fallback to default values if initialOptions is invalid
  const defaultOptions = { adults: 1, children: 0, rooms: 1 };
  const validOptions = (initialOptions && typeof initialOptions === 'object' && initialOptions.adults !== undefined) 
    ? initialOptions 
    : defaultOptions;

  const containerRef = useRef(null);

  // Click-outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleOption = (type, operation, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const newOptions = { ...validOptions };

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

    onOptionsChange(newOptions);
  };

  const handleAddRoom = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newOptions = { ...validOptions };
    newOptions.rooms += 1;
    onOptionsChange(newOptions);
  };

  const handleRemoveRoom = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (validOptions && validOptions.rooms > 1) {
      const newOptions = { ...validOptions };
      newOptions.rooms -= 1;
      onOptionsChange(newOptions);
    }
  };

  return (
    <div className="gp-container" ref={containerRef}>
      {/* Header with Summary */}
      <div className="gp-header">
        <div className="gp-summary">
          <p className="gp-summary-text">
            {validOptions && validOptions.adults ? validOptions.adults : 0} adult{validOptions && validOptions.adults !== 1 ? 's' : ''} · {validOptions && validOptions.children ? validOptions.children : 0} child{validOptions && validOptions.children !== 1 ? 'ren' : ''} · {validOptions && validOptions.rooms ? validOptions.rooms : 0} room{validOptions && validOptions.rooms !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="gp-content">
        {/* Detail Selectors */}
        <div className="gp-selectors">
          {/* Adults */}
          <div className="gp-selector">
            <label className="gp-label">Adults</label>
            <div className="gp-control-wrapper">
              <button
                type="button"
                disabled={!validOptions || validOptions.adults <= 1}
                className="gp-btn-control"
                onClick={(e) => handleOption("adults", "d", e)}
              >
                −
              </button>
              <span className="gp-value-control">{validOptions && validOptions.adults ? validOptions.adults : 0}</span>
              <button
                type="button"
                className="gp-btn-control"
                onClick={(e) => handleOption("adults", "i", e)}
              >
                +
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="gp-selector">
            <label className="gp-label">Children</label>
            <div className="gp-control-wrapper">
              <button
                type="button"
                disabled={!validOptions || validOptions.children <= 0}
                className="gp-btn-control"
                onClick={(e) => handleOption("children", "d", e)}
              >
                −
              </button>
              <span className="gp-value-control">{validOptions && validOptions.children ? validOptions.children : 0}</span>
              <button
                type="button"
                className="gp-btn-control"
                onClick={(e) => handleOption("children", "i", e)}
              >
                +
              </button>
            </div>
          </div>

          {/* Rooms */}
          <div className="gp-selector">
            <label className="gp-label">Rooms</label>
            <div className="gp-control-wrapper">
              <button
                type="button"
                disabled={!validOptions || validOptions.rooms <= 1}
                className="gp-btn-control"
                onClick={(e) => handleRemoveRoom(e)}
              >
                −
              </button>
              <span className="gp-value-control">{validOptions && validOptions.rooms ? validOptions.rooms : 0}</span>
              <button
                type="button"
                className="gp-btn-control"
                onClick={(e) => handleAddRoom(e)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestPicker;
