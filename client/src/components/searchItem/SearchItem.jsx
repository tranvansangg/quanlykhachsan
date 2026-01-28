import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faMapPin,
  faWifi,
  faParking,
  faSwimmingPool,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import FavoriteButton from "../favoriteButton/FavoriteButton";
import "./searchItem.css";

const SearchItem = ({ item }) => {

  const renderStars = (star) => {
    return Array(Math.floor(star))
      .fill()
      .map((_, i) => (
        <FontAwesomeIcon key={i} icon={faStar} className="starIcon" />
      ));
  };

  const amenities = [
    { icon: faWifi, label: "Wi-Fi miễn phí" },
    { icon: faParking, label: "Bãi đỗ xe" },
    { icon: faSwimmingPool, label: "Bể bơi" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-slate-200 relative">
      {/* Image */}
      <div className="relative w-full sm:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
        <img 
          src={item.photos?.[0] || "/placeholder.jpg"} 
          alt={item.name} 
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
          <FavoriteButton hotelId={item._id} />
        </div>
      </div>

      {/* Description */}
      <div className="flex-1 flex flex-col gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">{item.name}</h1>
          <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
            <FontAwesomeIcon icon={faMapPin} className="text-primary-700" />
            <span>{item.distance} km từ trung tâm</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.type && (
            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {item.type}
            </span>
          )}
          <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
            <FontAwesomeIcon icon={faCheck} /> Hủy miễn phí
          </span>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2">{item.desc}</p>

        <div className="flex flex-wrap gap-3">
          {amenities.map((amenity, idx) => (
            <div key={idx} className="flex items-center gap-1 text-xs text-slate-600">
              <FontAwesomeIcon icon={amenity.icon} className="text-primary-700" />
              <span>{amenity.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price & Rating */}
      <div className="flex flex-col justify-between items-end min-w-max">
        <div className="text-right">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-slate-600">Đánh giá</span>
            <span className="px-2 py-1 bg-primary-700 text-white text-sm font-bold rounded">
              {item.star || 4.5}
            </span>
          </div>
          <div className="flex gap-1">
            {renderStars(item.star || 4.5).map((star, i) => (
              <span key={i} className="text-yellow-400 text-sm">{star}</span>
            ))}
          </div>
        </div>

        <div className="text-right mt-3">
          <p className="text-xs text-slate-600">Mỗi đêm từ:</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold text-slate-900">
              ₫{(item.cheapestPrice || 1000000).toLocaleString("vi-VN")}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Bao gồm thuế và phí</p>
          <Link to={`/hotels/${item._id}`}>
            <button className="mt-3 w-full px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold rounded-lg transition-colors duration-200 whitespace-nowrap">
              Xem phòng trống
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchItem;
