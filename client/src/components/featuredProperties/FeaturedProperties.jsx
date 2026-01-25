import useFetch from "../../hooks/useFetch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faHeart } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import "./featuredProperties.css";

const FeaturedProperties = () => {
  const { data, loading, error } = useFetch("/hotels?featured=true&limit=4");
  const [likes, setLikes] = useState({});

  const toggleLike = (id) => {
    setLikes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto">
      {loading ? (
        <div className="col-span-full flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-700 rounded-full animate-spin"></div>
        </div>
      ) : (
        data.map((item) => (
          <div 
            key={item._id} 
            className="group rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={item.photos?.[0] || "/placeholder.jpg"}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <button
                className={`absolute top-3 right-3 p-2 rounded-full transition-colors duration-200 ${
                  likes[item._id] 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/90 text-slate-600 hover:bg-white hover:text-red-500'
                }`}
                onClick={() => toggleLike(item._id)}
              >
                <FontAwesomeIcon icon={faHeart} />
              </button>
              {item.star && (
                <div className="absolute top-3 left-3 bg-primary-700 text-white px-3 py-1 rounded-full flex flex-col items-center">
                  <span className="font-bold text-lg">{item.star}</span>
                  <span className="text-xs">Xuất sắc</span>
                </div>
              )}
            </div>
            <div className="p-4 space-y-3">
              <h3 className="font-bold text-slate-900 line-clamp-1 text-lg">{item.name}</h3>
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <span>📍</span>{item.city}
              </p>
              <div className="flex items-baseline gap-1 pt-2 border-t border-slate-200">
                <span className="text-2xl font-bold text-primary-700">₫{(item.cheapestPrice || 1000000).toLocaleString("vi-VN")}</span>
                <span className="text-sm text-slate-600">/đêm</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FeaturedProperties;
