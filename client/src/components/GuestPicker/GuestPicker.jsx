import { useEffect, useRef } from "react";
import "./GuestPicker.css";

const GuestPicker = ({ initialOptions, onOptionsChange, onClose }) => {
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

  const handleOption = (roomIndex, type, operation) => {
    const newOptions = JSON.parse(JSON.stringify(initialOptions));

    if (operation === "i") {
      newOptions.rooms[roomIndex][type] += 1;
    } else {
      if (type === "adults" && newOptions.rooms[roomIndex][type] > 1) {
        newOptions.rooms[roomIndex][type] -= 1;
      } else if (type === "children" && newOptions.rooms[roomIndex][type] > 0) {
        newOptions.rooms[roomIndex][type] -= 1;
      }
    }

    onOptionsChange(newOptions);
  };

  const handleAddRoom = () => {
    const newOptions = JSON.parse(JSON.stringify(initialOptions));
    newOptions.rooms.push({ adults: 1, children: 0 });
    onOptionsChange(newOptions);
  };

  const handleRemoveRoom = (roomIndex) => {
    if (initialOptions.rooms.length > 1) {
      const newOptions = JSON.parse(JSON.stringify(initialOptions));
      newOptions.rooms = newOptions.rooms.filter((_, idx) => idx !== roomIndex);
      onOptionsChange(newOptions);
    }
  };

  return (
    <div className="gp-container" ref={containerRef}>
      <div className="gp-content">
        {/* Overview Tab */}
        <div className="gp-overview">
          <div className="gp-summary">
            <p className="gp-summary-text">
              {initialOptions.rooms[0].adults} adults · {initialOptions.rooms[0].children} children · {initialOptions.rooms.length} room{initialOptions.rooms.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Detail Selectors */}
        <div className="gp-selectors">
          {/* Adults */}
          <div className="gp-selector">
            <label className="gp-label">Adults</label>
            <div className="gp-control">
              <button
                type="button"
                disabled={initialOptions.rooms[0].adults <= 1}
                className="gp-btn"
                onClick={() => handleOption(0, "adults", "d")}
              >
                −
              </button>
              <span className="gp-value">{initialOptions.rooms[0].adults}</span>
              <button
                type="button"
                className="gp-btn"
                onClick={() => handleOption(0, "adults", "i")}
              >
                +
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="gp-selector">
            <label className="gp-label">Children</label>
            <div className="gp-control">
              <button
                type="button"
                disabled={initialOptions.rooms[0].children <= 0}
                className="gp-btn"
                onClick={() => handleOption(0, "children", "d")}
              >
                −
              </button>
              <span className="gp-value">{initialOptions.rooms[0].children}</span>
              <button
                type="button"
                className="gp-btn"
                onClick={() => handleOption(0, "children", "i")}
              >
                +
              </button>
            </div>
          </div>

          {/* Rooms */}
          <div className="gp-selector">
            <label className="gp-label">Rooms</label>
            <div className="gp-control">
              <button
                type="button"
                disabled={initialOptions.rooms.length <= 1}
                className="gp-btn"
                onClick={() => handleRemoveRoom(initialOptions.rooms.length - 1)}
              >
                −
              </button>
              <span className="gp-value">{initialOptions.rooms.length}</span>
              <button
                type="button"
                className="gp-btn"
                onClick={handleAddRoom}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Additional Rooms */}
        {initialOptions.rooms.length > 1 && (
          <div className="gp-additional">
            <p className="gp-additional-title">Additional rooms</p>
            {initialOptions.rooms.map((room, roomIndex) => (
              roomIndex > 0 && (
                <div key={roomIndex} className="gp-room-item">
                  <span className="gp-room-label">Room {roomIndex + 1}</span>
                  <div className="gp-room-controls">
                    <div className="gp-control-group">
                      <button
                        type="button"
                        disabled={room.adults <= 1}
                        className="gp-btn-sm"
                        onClick={() => handleOption(roomIndex, "adults", "d")}
                      >
                        −
                      </button>
                      <span className="gp-value-sm">{room.adults} adults</span>
                      <button
                        type="button"
                        className="gp-btn-sm"
                        onClick={() => handleOption(roomIndex, "adults", "i")}
                      >
                        +
                      </button>
                    </div>

                    <div className="gp-control-group">
                      <button
                        type="button"
                        disabled={room.children <= 0}
                        className="gp-btn-sm"
                        onClick={() => handleOption(roomIndex, "children", "d")}
                      >
                        −
                      </button>
                      <span className="gp-value-sm">{room.children} children</span>
                      <button
                        type="button"
                        className="gp-btn-sm"
                        onClick={() => handleOption(roomIndex, "children", "i")}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="gp-remove-btn"
                      onClick={() => handleRemoveRoom(roomIndex)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestPicker;
