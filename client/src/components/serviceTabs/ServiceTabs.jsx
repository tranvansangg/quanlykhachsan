import React, { useState } from "react";
import {
  faBed,
  faPlane,
  faCar,
  faMapMarkerAlt,
  faTaxi,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./serviceTabs.css";

const ServiceTabs = ({ sticky = false }) => {
  const [activeTab, setActiveTab] = useState("stays");

  const tabs = [
    {
      id: "stays",
      label: "Lưu trú",
      icon: faBed,
    },
    {
      id: "flights",
      label: "Chuyến bay",
      icon: faPlane,
    },
    {
      id: "rentals",
      label: "Cho thuê xe",
      icon: faCar,
    },
    {
      id: "locations",
      label: "Địa điểm",
      icon: faMapMarkerAlt,
    },
    {
      id: "taxi",
      label: "Taxi",
      icon: faTaxi,
    },
  ];

  return (
    <div className={`service-tabs ${sticky ? "sticky-mode" : ""}`}>
      <div className="service-tabs-wrapper">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`service-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <FontAwesomeIcon icon={tab.icon} className="tab-icon" />
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ServiceTabs;
