import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import './hotelDetail.scss';

const HotelDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') || 'edit'; // 'view' or 'edit'
  const isViewMode = mode === 'view';

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    city: '',
    address: '',
    distance: '',
    title: '',
    desc: '',
    cheapestPrice: '',
    photos: [],
    star: 5,
    featured: false,
  });
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]); // Track only new photos

  useEffect(() => {
    if (id) {
      fetchHotel();
    }
  }, [id]);

  const fetchHotel = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8800/api/hotels/${id}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFormData(data);
      setPhotoUrls(data.photos || []);
    } catch (error) {
      console.error('Error fetching hotel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrls(prev => [...prev, event.target.result]);
        setNewPhotos(prev => [...prev, event.target.result]); // Track new photos
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    const removedPhoto = photoUrls[index];
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
    // Remove from newPhotos if it's a new photo (base64)
    if (removedPhoto?.startsWith('data:')) {
      setNewPhotos(prev => prev.filter((_, i) => {
        // Find the corresponding index in newPhotos
        const newPhotoIndex = photoUrls.findIndex((p, idx) => idx === index && p.startsWith('data:'));
        return newPhotoIndex === -1;
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const method = id ? 'PUT' : 'POST';
      const url = id
        ? `http://localhost:8800/api/hotels/${id}`
        : 'http://localhost:8800/api/hotels';

      // For update: send only new photos and kept old photos
      // For create: send all photos
      let photosToSend = photoUrls;
      if (id) {
        // Send all photos (both old URLs and new base64)
        photosToSend = photoUrls;
      }

      const payload = {
        ...formData,
        photos: photosToSend,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(id ? 'Cập nhật khách sạn thành công!' : 'Tạo khách sạn thành công!');
        navigate('/hotels');
      } else {
        const errorData = await res.json();
        alert(`Lỗi: ${errorData.message || 'Lỗi khi lưu khách sạn'}`);
      }
    } catch (error) {
      console.error('Error saving hotel:', error);
      alert(`Lỗi khi lưu khách sạn: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="hotel-detail">
      {/* Header */}
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/hotels')}>
          <ArrowLeft size={20} />
          Quay Lại
        </button>
        <h1>{isViewMode ? '👁️ Xem Khách Sạn' : (id ? '✏️ Sửa Khách Sạn' : '➕ Thêm Khách Sạn')}</h1>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="hotel-form">
          <div className="form-grid">
            {/* Left Column */}
            <div className="form-column">
              <div className="form-section">
                <h2>Thông Tin Cơ Bản</h2>

                <div className="form-group">
                  <label>Tên Khách Sạn *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nhập tên khách sạn"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Loại *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Chọn loại --</option>
                      <option value="hotel">Hotel</option>
                      <option value="apartment">Apartment</option>
                      <option value="resort">Resort</option>
                      <option value="villa">Villa</option>
                      <option value="hostel">Hostel</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Sao ⭐</label>
                    <input
                      type="number"
                      name="star"
                      value={formData.star}
                      onChange={handleChange}
                      min="1"
                      max="5"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Thành Phố *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Ví dụ: Hà Nội"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Giá Rẻ Nhất *</label>
                    <input
                      type="number"
                      name="cheapestPrice"
                      value={formData.cheapestPrice}
                      onChange={handleChange}
                      placeholder="Giá"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Địa Chỉ *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Khoảng Cách *</label>
                  <input
                    type="text"
                    name="distance"
                    value={formData.distance}
                    onChange={handleChange}
                    placeholder="Ví dụ: 500m từ sân bay"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tiêu Đề</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Nhập tiêu đề mô tả ngắn"
                  />
                </div>

                <div className="form-group">
                  <label>Mô Tả</label>
                  <textarea
                    name="desc"
                    value={formData.desc}
                    onChange={handleChange}
                    placeholder="Nhập mô tả chi tiết"
                    rows="5"
                  ></textarea>
                </div>

                <div className="form-group checkbox-group">
                  <label htmlFor="featured" className="checkbox-label">
                    <input
                      id="featured"
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="checkbox-input"
                    />
                    <span className="checkbox-text">✨ Đánh Dấu Nổi Bật (Khách Sạn Nổi Bật)</span>
                  </label>
                  <p className="checkbox-help">Khi được đánh dấu, khách sạn sẽ hiển thị trong phần "Khách Sạn Nổi Bật" trên trang chủ client</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="form-column">
              <div className="form-section">
                <h2>Hình Ảnh</h2>

                <div className="photo-upload">
                  <label htmlFor="photos" className="upload-label">
                    <Upload size={24} />
                    <span>Tải Lên Ảnh</span>
                    <p>Kéo thả hoặc nhấn để chọn</p>
                  </label>
                  <input
                    id="photos"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </div>

                <div className="photo-gallery">
                  {photoUrls.map((url, index) => (
                    <div key={index} className="photo-item">
                      <img src={url} alt={`Photo ${index + 1}`} />
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removePhoto(index)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {photoUrls.length === 0 && (
                  <div className="no-photos">
                    <p>Chưa có ảnh nào được tải lên</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate('/hotels')}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : id ? 'Cập Nhật' : 'Tạo Mới'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default HotelDetail;
