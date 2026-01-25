import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCalendarDays,
  faUsers,
  faDoorOpen,
} from "@fortawesome/free-solid-svg-icons";
import "./emptyState.css";

const EmptyState = ({ type = "noResults", totalGuests, numRooms, onAdjustFilters }) => {
  const configs = {
    noResults: {
      icon: faSearch,
      title: "Không tìm thấy khách sạn phù hợp",
      description:
        "Chúng tôi không tìm thấy khách sạn nào phù hợp với tiêu chí tìm kiếm của bạn.",
      suggestions: [
        { icon: faCalendarDays, text: "Thử thay đổi ngày nhận/trả phòng" },
        { icon: faUsers, text: "Thử giảm số lượng khách" },
        { icon: faDoorOpen, text: "Thử giảm số phòng cần đặt" },
      ],
      buttonText: "Điều chỉnh bộ lọc",
      iconBgClass: "emptyState-icon-blue",
      iconColorClass: "emptyState-color-blue",
      titleClass: "emptyState-title-dark",
      descClass: "emptyState-text-gray",
    },
    error: {
      icon: faSearch,
      title: "Có lỗi khi tải dữ liệu",
      description: "Vui lòng thử lại hoặc liên hệ với bộ phận hỗ trợ.",
      suggestions: [],
      buttonText: "Thử lại",
      iconBgClass: "emptyState-icon-red",
      iconColorClass: "emptyState-color-red",
      titleClass: "emptyState-title-dark",
      descClass: "emptyState-text-gray",
    },
  };

  const config = configs[type] || configs.noResults;

  return (
    <div className="emptyStateContainer">
      <div className="emptyStateContent">
        {/* Icon */}
        <div className={`emptyStateIconWrapper ${config.iconBgClass}`}>
          <FontAwesomeIcon icon={config.icon} className={`emptyStateIcon ${config.iconColorClass}`} />
        </div>

        {/* Title */}
        <h2 className={`emptyStateTitle ${config.titleClass}`}>{config.title}</h2>

        {/* Description */}
        <p className={`emptyStateDesc ${config.descClass}`}>{config.description}</p>

        {/* Suggestions */}
        {config.suggestions.length > 0 && (
          <div className="emptyStateSuggestions">
            <p className="suggestionLabel">Gợi ý:</p>
            <ul className="suggestionsList">
              {config.suggestions.map((suggestion, idx) => (
                <li key={idx} className="suggestionItem">
                  <FontAwesomeIcon icon={suggestion.icon} className="suggestionIcon" />
                  <span>{suggestion.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        {onAdjustFilters && (
          <button onClick={onAdjustFilters} className="emptyStateButton">
            {config.buttonText}
          </button>
        )}

        {/* Guest Info (optional) */}
        {totalGuests > 0 && numRooms > 0 && (
          <div className="emptyStateInfo">
            <p className="infoText">
              Bạn đã tìm kiếm cho <strong>{totalGuests} khách</strong> trong{" "}
              <strong>{numRooms} phòng</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
