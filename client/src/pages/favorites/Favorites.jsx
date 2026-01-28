import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import SearchItem from "../../components/searchItem/SearchItem";
import FavoriteButton from "../../components/favoriteButton/FavoriteButton";
import "./favorites.css";

const Favorites = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [favoriteHotels, setFavoriteHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchFavorites();
  }, [user, navigate]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new endpoint that returns hotel details
      const response = await axiosInstance.get(
        `/favorites/${user._id}/hotels`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.hotels) {
        setFavoriteHotels(response.data.hotels);
      } else {
        setFavoriteHotels([]);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setError("Có lỗi khi tải danh sách yêu thích");
      setFavoriteHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (hotelId) => {
    try {
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
        setFavoriteHotels(
          favoriteHotels.filter((hotel) => hotel._id !== hotelId)
        );
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Có lỗi xảy ra khi xóa yêu thích");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loadingFavorites">
          <div className="spinner" />
          <p>Đang tải danh sách yêu thích...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Header type="list" />
      <div className="favorites-container">
        <div className="favorites-header">
          <h1>Danh sách khách sạn yêu thích</h1>
          <p className="subtitle">Các khách sạn bạn đã lưu</p>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {favoriteHotels.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="far fa-heart"></i>
            </div>
            <h2>Chưa có khách sạn yêu thích</h2>
            <p>Thêm những khách sạn bạn thích vào danh sách để xem sau</p>
            <button
              className="btn-explore"
              onClick={() => navigate("/")}
            >
              Khám phá khách sạn
            </button>
          </div>
        ) : (
          <div className="favorites-list">
            <div className="favorites-stats">
              <p>Bạn có <strong>{favoriteHotels.length}</strong> khách sạn yêu thích</p>
            </div>
            <div className="hotels-grid">
              {favoriteHotels.map((hotel) => (
                <SearchItem key={hotel._id} item={hotel} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Favorites;
