import React, { useState, useEffect } from 'react';
import { Trash2, Search, RefreshCw, Star } from 'lucide-react';
import './reviews.scss';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8800/api/reviews', {
                headers: { 
                    authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            setReviews(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading reviews:', error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const deleteReview = async (id) => {
        if (window.confirm('Xóa đánh giá này?')) {
            try {
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId'); // Get current user ID
                
                await fetch(`http://localhost:8800/api/reviews/${id}`, {
                    method: 'DELETE',
                    headers: { 
                        authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        userId: userId,
                        isAdmin: true // Admin can delete any review
                    })
                });
                loadReviews();
            } catch (error) {
                console.error('Error deleting review:', error);
                alert('Lỗi khi xóa đánh giá');
            }
        }
    };

    const filteredReviews = reviews.filter(r =>
        r.hotelName?.toLowerCase().includes(search.toLowerCase()) ||
        r.hotelID?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedReviews = filteredReviews.slice(startIndex, startIndex + itemsPerPage);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const renderStars = (rating) => {
        return (
            <div className="stars">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        className={i < rating ? 'filled' : ''}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="reviews-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>⭐ Quản Lý Đánh Giá</h1>
                    <p>Quản lý các đánh giá từ khách hàng</p>
                </div>
            </div>

            {/* Controls */}
            <div className="page-controls">
                            <div className="search-box">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm đánh giá..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <button onClick={loadReviews} className="btn btn-ghost">
                                <RefreshCw size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                            </div>
                        ) : filteredReviews.length === 0 ? (
                            <div className="empty-state">
                                <p>Không có đánh giá nào</p>
                            </div>
                        ) : (
                            <div className="reviews-grid">
                                {paginatedReviews.map((review) => (
                                    <div key={review._id} className="review-card">
                                        <div className="review-header">
                                            <div className="review-info">
                                                <h3>{review.hotelName}</h3>
                                                <div className="rating">
                                                    {renderStars(review.rating)}
                                                    <span className="rating-value">{review.rating}/5</span>
                                                </div>
                                            </div>
                                            <button
                                                className="btn-delete"
                                                onClick={() => deleteReview(review._id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="review-content">
                                            <p className="review-text">{review.comment}</p>
                                            <p className="review-meta">
                                                <span>Người dùng: {review.userName}</span>
                                                <span>Ngày: {new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
            {!loading && filteredReviews.length > 0 && (
                <div className="page-footer">
                    <div className="footer-info">
                        <p>Hiển thị <strong>{startIndex + 1}</strong>-<strong>{Math.min(startIndex + itemsPerPage, filteredReviews.length)}</strong> trên <strong>{filteredReviews.length}</strong> đánh giá</p>
                    </div>
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                onClick={handlePrevPage} 
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                ← Trang trước
                            </button>
                            <span className="pagination-info">Trang {currentPage}/{totalPages}</span>
                            <button 
                                onClick={handleNextPage} 
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                Trang sau →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reviews;
