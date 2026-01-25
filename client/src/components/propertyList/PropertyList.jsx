import useFetch from "../../hooks/useFetch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faBuilding,
  faTreeCity,
  faCab,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";
import "./propertyList.css";

const PropertyList = () => {
  const { data, loading, error } = useFetch("/hotels/countByType");

  const images = [
    "https://cf.bstatic.com/xdata/images/xphoto/square300/57584488.webp?k=bf724e4e9b9b75480bbe7fc675460a089ba6414fe4693b83ea3fdd8e938832a6&o=",
    "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-apartments_300/9f60235dc09a3ac3f0a93adbc901c61ecd1ce72e.jpg",
    "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/bg_resorts/6f87c6143fbd51a0bb5d15ca3b9cf84211ab0884.jpg",
    "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-villas_300/dd0d7f8202676306a661aa4f0cf1ffab31286211.jpg",
    "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-chalet_300/8ee014fcc493cb3334e25893a1dee8c6d36ed0ba.jpg",
  ];

  const icons = [faBed, faBuilding, faTreeCity, faCab, faHouse];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 max-w-7xl mx-auto">
      {loading ? (
        <div className="col-span-full flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-700 rounded-full animate-spin"></div>
        </div>
      ) : (
        data &&
        images.map((img, i) => (
          <div 
            key={i} 
            className="group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-36 sm:h-40"
          >
            <div className="relative w-full h-full overflow-hidden">
              <img 
                src={img} 
                alt={data[i]?.type} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-3">
                <FontAwesomeIcon
                  icon={icons[i] || faBed}
                  className="text-3xl mb-2"
                />
                <h3 className="font-bold text-sm">{data[i]?.type}</h3>
                <p className="text-xs opacity-90 mt-1">{data[i]?.count} nơi ở</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PropertyList;
