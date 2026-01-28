import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "./reviewForm.css";

const ReviewForm = ({ hotelId, onReviewSubmitted }) => {
  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Check if user can review
  useEffect(() => {
    if (!user) return;

    const checkEligibility = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8800/api/reviews/check/${user._id}/${hotelId}`
        );

        if (response.data.success) {
          setCanReview(response.data.canReview);
          setHasReviewed(response.data.hasReviewed);
          setMessage(response.data.message);

          if (response.data.review) {
            setExistingReview(response.data.review);
            setRating(response.data.review.rating);
            setComment(response.data.review.comment);
          }
        }
      } catch (err) {
        console.error("Error checking review eligibility:", err);
        setError("Lỗi khi kiểm tra quyền đánh giá");
      }
    };

    checkEligibility();
  }, [user, hotelId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Vui lòng đăng nhập để đánh giá");
      return;
    }

    if (comment.length < 10) {
      setError("Bình luận phải có ít nhất 10 ký tự");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`http://localhost:8800/api/reviews`, {
        userId: user._id,
        hotelId,
        rating: parseInt(rating),
        comment,
      });

      if (response.data.success) {
        setRating(5);
        setComment("");
        setHasReviewed(true);
        setExistingReview(response.data.review);
        setMessage(response.data.message);

        // Notify parent component to refresh reviews list
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Lỗi khi lưu đánh giá. Vui lòng thử lại.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // If user not logged in
  if (!user) {
    return (
      <div className="reviewFormContainer">
        <div className="reviewMessage">
          Vui lòng <a href="/login">đăng nhập</a> để đánh giá khách sạn này
        </div>
      </div>
    );
  }

  // If user cannot review (hasn't completed booking)
  if (!canReview && hasReviewed) {
    // Allow form to show even without completed booking for testing
    // In production, uncomment the block below
    // return (
    //   <div className="reviewFormContainer">
    //     <div className="reviewWarning">
    //       ⚠️ {message}
    //     </div>
    //   </div>
    // );
  }

  return (
    <div className="reviewFormContainer">
      <h3 className="reviewFormTitle">
        {hasReviewed ? "Cập nhật đánh giá của bạn" : "Chia sẻ trải nghiệm của bạn"}
      </h3>

      {error && <div className="reviewError">{error}</div>}
      {message && !error && <div className="reviewSuccess">{message}</div>}

      <form onSubmit={handleSubmit} className="reviewForm">
        {/* Rating Slider */}
        <div className="formGroup">
          <label htmlFor="rating">Điểm đánh giá (0-10)</label>
          <div className="ratingControl">
            <input
              type="range"
              id="rating"
              min="0"
              max="10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="ratingSlider"
            />
            <div className="ratingDisplay">
              <span className="ratingValue">{rating}</span>
              <span className="ratingLabel">/10</span>
            </div>
          </div>
        </div>

        {/* Comment Textarea */}
        <div className="formGroup">
          <label htmlFor="comment">
            Bình luận chi tiết ({comment.length}/1000)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 1000))}
            placeholder="Chia sẻ trải nghiệm của bạn tại khách sạn này... (tối thiểu 10 ký tự)"
            className="commentTextarea"
            rows="5"
            required
          />
          {comment.length < 10 && comment.length > 0 && (
            <div className="charWarning">
              Cần thêm {10 - comment.length} ký tự
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || comment.length < 10}
          className="reviewSubmitBtn"
        >
          {loading ? "Đang lưu..." : hasReviewed ? "Cập nhật đánh giá" : "Gửi đánh giá"}
        </button>
      </form>

      <div className="reviewHint">
        ℹ️ Đánh giá của bạn giúp các khách hàng khác có quyết định tốt hơn
      </div>
    </div>
  );
};

export default ReviewForm;
