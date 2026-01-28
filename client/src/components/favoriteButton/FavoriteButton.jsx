import { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import "./favoriteButton.css";

const FavoriteButton = ({ hotelId, className = "" }) => {
  const { user } = useContext(AuthContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if hotel is favorite when user or hotelId changes
  useEffect(() => {
    if (user?._id && hotelId) {
      checkFavorite();
    }
  }, [user?._id, hotelId]);

  const checkFavorite = async () => {
    if (!user?._id) return;
    
    try {
      const response = await axiosInstance.get(
        `/favorites/${user._id}/check?hotelId=${hotelId}`
      );
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      alert("Vui lòng đăng nhập để thêm vào yêu thích");
      return;
    }

    if (!hotelId) {
      console.error("Hotel ID is required");
      return;
    }

    setLoading(true);
    try {
      // Use toggle endpoint for simplicity
      const response = await axiosInstance.post(
        `/favorites/${user._id}/toggle`,
        { hotelId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data) {
        setIsFavorite(response.data.isFavorite);
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
      // Fallback to manual toggle on error
      setIsFavorite(!isFavorite);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`favorite-btn ${isFavorite ? "active" : ""} ${className}`}
      onClick={toggleFavorite}
      disabled={loading || !user}
      title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
      aria-label="Toggle favorite"
    >
      <FontAwesomeIcon
        icon={isFavorite ? faHeartSolid : faHeartRegular}
        className="heart-icon"
        style={{
          color: isFavorite ? "#ff0000" : "currentColor",
          transition: "color 0.3s ease",
        }}
      />
      <span className="tooltip">{isFavorite ? "Đã thích" : "Thêm yêu thích"}</span>
    </button>
  );
};

export default FavoriteButton;
