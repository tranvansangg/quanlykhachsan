import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faPlane,
  faCar,
  faTaxi,
} from "@fortawesome/free-solid-svg-icons";
import "./serviceTabs.css";

const SERVICES = [
  { icon: faBed, label: "Lưu trú", active: true },
  { icon: faPlane, label: "Chuyến bay", active: false },
  { icon: faCar, label: "Cho thuê xe", active: false },
  { icon: faBed, label: "Địa điểm", active: false },
  { icon: faTaxi, label: "Taxi", active: false },
];

const ServiceTabs = ({ sticky = false }) => {
  return (
    <div className={`serviceTabsContainer ${sticky ? "sticky" : ""}`}>
      <div className={`serviceTabsWrapper ${sticky ? "sticky-wrapper" : ""}`}>
        {SERVICES.map((item, idx) => (
          <button
            key={idx}
            className={`serviceTabButton ${item.active ? "active" : ""} ${
              sticky ? "sticky-variant" : ""
            }`}
            type="button"
          >
            <FontAwesomeIcon icon={item.icon} className="serviceTabIcon" />
            <span className="serviceTabLabel">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ServiceTabs;
