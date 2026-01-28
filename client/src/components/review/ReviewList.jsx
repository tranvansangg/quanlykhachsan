import { useState, useEffect } from "react";
import axios from "axios";
import "./reviewList.css";

const ReviewList = ({ hotelId, refreshTrigger }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // recent, highestRating, lowestRating

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8800/api/reviews/hotel/${hotelId}`
        );

        if (response.data.success) {
          setReviews(response.data.reviews || []);
          setAvgRating(response.data.avgRating || 0);
          setTotalReviews(response.data.totalReviews || 0);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Lỗi khi tải đánh giá");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [hotelId, refreshTrigger]);

  // Sort reviews
  const getSortedReviews = () => {
    let sorted = [...reviews];

    switch (sortBy) {
      case "highestRating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "lowestRating":
        return sorted.sort((a, b) => a.rating - b.rating);
      case "recent":
      default:
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return "#27ae60"; // Green
    if (rating >= 6) return "#f39c12"; // Orange
    return "#e74c3c"; // Red
  };

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <span
            key={i}
            className={`star ${i < rating ? "filled" : ""}`}
            style={{ color: getRatingColor(rating) }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="reviewListContainer">
        <div className="loading">Đang tải đánh giá...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reviewListContainer">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (totalReviews === 0) {
    return (
      <div className="reviewListContainer">
        <div className="noReviews">
          Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ trải nghiệm của bạn!
        </div>
      </div>
    );
  }

  const sortedReviews = getSortedReviews();

  return (
    <div className="reviewListContainer">
      {/* Summary */}
      <div className="reviewSummary">
        <div className="ratingBox">
          <div className="ratingNumber" style={{ color: getRatingColor(avgRating) }}>
            {avgRating}
          </div>
          <div className="ratingMeta">
            <div className="ratingStars">{renderStars(Math.round(avgRating))}</div>
            <div className="reviewCount">{totalReviews} đánh giá</div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="sortControls">
          <label htmlFor="sortSelect">Sắp xếp theo:</label>
          <select
            id="sortSelect"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sortSelect"
          >
            <option value="recent">Mới nhất</option>
            <option value="highestRating">Điểm cao nhất</option>
            <option value="lowestRating">Điểm thấp nhất</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviewsList">
        {sortedReviews.map((review) => (
          <div key={review._id} className="reviewCard">
            <div className="reviewHeader">
              <div className="reviewerInfo">
                <div className="reviewerName">
                  {review.userName || review.userId || "Khách ẩn danh"}
                </div>
                <div className="reviewerCountry">
                  {review.userCountry && `🌍 ${review.userCountry}`}
                </div>
              </div>
              {review.verified && (
                <div className="verifiedBadge">✓ Đã xác minh</div>
              )}
            </div>

            <div className="reviewRating">
              {renderStars(review.rating)}
              <span className="ratingText">{review.rating}/10</span>
            </div>

            <div className="reviewComment">{review.comment}</div>

            {/* Positive/Negative Points */}
            {(review.positivePoints?.length > 0 ||
              review.negativePoints?.length > 0) && (
              <div className="reviewPoints">
                {review.positivePoints?.length > 0 && (
                  <div className="positivePoints">
                    <strong>👍 Điểm tích cực:</strong>
                    <ul>
                      {review.positivePoints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {review.negativePoints?.length > 0 && (
                  <div className="negativePoints">
                    <strong>👎 Điểm cần cải thiện:</strong>
                    <ul>
                      {review.negativePoints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="reviewFooter">
              <span className="reviewDate">
                {formatDate(review.createdAt)}
              </span>
              {review.updatedAt !== review.createdAt && (
                <span className="reviewUpdated">
                  (cập nhật {formatDate(review.updatedAt)})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
