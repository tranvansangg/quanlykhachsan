import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { SearchContext } from "../../context/SearchContext";
import "./featured.css";

const Featured = () => {
  const navigate = useNavigate();
  const { state: searchState, dispatch } = useContext(SearchContext);
  const { data, loading, error } = useFetch(
    "/hotels/countByCity?cities=hà nội,sài gòn,đà nẵng"
  );

  // Get current search state or use defaults
  const getCurrentSearchData = () => {
    // Priority 1: Check localStorage for recent search
    try {
      const savedSearch = localStorage.getItem("searchData");
      if (savedSearch) {
        const parsed = JSON.parse(savedSearch);
        console.log("✓ Using saved search data from localStorage:", parsed);
        return {
          destination: parsed.destination || "",
          dates: parsed.dates ? parsed.dates.map(d => ({
            startDate: new Date(d.startDate),
            endDate: new Date(d.endDate),
            key: d.key || "selection",
          })) : null,
          options: parsed.options || { adults: 1, children: 0, rooms: 1 },
        };
      }
    } catch (error) {
      console.warn("Error loading saved search:", error);
    }

    // Priority 2: Check SearchContext state
    if (searchState?.destination || searchState?.dates || searchState?.options) {
      console.log("✓ Using SearchContext state:", searchState);
      return {
        destination: searchState?.destination || "",
        dates: searchState?.dates || null,
        options: searchState?.options || { adults: 1, children: 0, rooms: 1 },
      };
    }

    // Priority 3: Use defaults
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    console.log("Using default search data");
    return {
      destination: "",
      dates: [
        {
          startDate,
          endDate,
          key: "selection",
        },
      ],
      options: {
        adults: 1,
        children: 0,
        rooms: 1,
      },
    };
  };

  useEffect(() => {
    console.log("Featured - Data:", data);
    console.log("Featured - SearchContext state:", searchState);
  }, [data, loading, error, searchState]);

  const cities = [
    {
      name: "hà nội",
      slug: "hanoi",
      image:
        "https://dntt.mediacdn.vn/197608888129458176/2022/9/21/ho-guom-du-lich-ha-noi-ivivu-16637590508811726461079.jpg",
      icon: "🏙️",
    },
    {
      name: "sài gòn",
      slug: "saigon",
      image:
        "https://cf.bstatic.com/xdata/images/city/max500/690334.webp?k=b99df435f06a15a1568ddd5f55d239507c0156985577681ab91274f917af6dbb&o=",
      icon: "🌆",
    },
    {
      name: "đà nẵng",
      slug: "danang",
      image:
        "https://cf.bstatic.com/xdata/images/city/max500/689422.webp?k=2595c93e7e067b9ba95f90713f80ba6e5fa88a66e6e55600bd27a5128808fdf2&o=",
      icon: "🏖️",
    },
  ];

  const handleExplore = (city) => {
    // Get current search data
    const searchData = getCurrentSearchData();

    // Save all data to localStorage
    const fullData = {
      city: {
        name: city.name,
        slug: city.slug,
      },
      destination: city.name,
      dates: searchData.dates,
      options: searchData.options,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("selectedCity", JSON.stringify(fullData));
    localStorage.setItem("searchData", JSON.stringify(searchData));

    // Dispatch to SearchContext
    dispatch({
      type: "SET_DESTINATION",
      payload: city.name,
    });

    console.log("✓ Saved to localStorage:", {
      selectedCity: fullData,
      searchData: searchData,
    });

    // Build URL with all params
    const params = new URLSearchParams({
      city: city.slug,
      destination: city.name,
      startDate: searchData.dates[0].startDate.toISOString(),
      endDate: searchData.dates[0].endDate.toISOString(),
      options: JSON.stringify(searchData.options),
    });

    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
      {loading ? (
        <div className="col-span-full flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-700 rounded-full animate-spin"></div>
        </div>
      ) : (
        cities.map((city, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl group cursor-pointer h-64 sm:h-72 shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <img
              src={city.image}
              alt={city.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

            <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl">{city.icon}</div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{city.name}</h1>
                <p className="text-sm sm:text-base text-slate-200">
                  {data?.[index] || "250+"} khách sạn
                </p>
                <button
                  onClick={() => handleExplore(city)}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Khám phá
                  <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Featured;
