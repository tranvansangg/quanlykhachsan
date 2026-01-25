import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import './roomDetail.scss';

const RoomDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') || 'edit'; // 'view' or 'edit'
  const isViewMode = mode === 'view';

  const [formData, setFormData] = useState({
    hotelId: '',
    title: '',
    price: '',
    maxPeople: '',
    desc: '',
    bedType: 'Double',
    numberOfBeds: 1,
    adults: 2,
    children: 0,
    photos: [],
    roomNumbers: [{ number: 0 }],
    rating: 5,
  });
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [roomNumbersInput, setRoomNumbersInput] = useState(''); // Comma-separated input

  useEffect(() => {
    loadHotels();
    if (id) {
      fetchRoom();
    }
  }, [id]);

  const loadHotels = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8800/api/hotels', {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHotels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading hotels:', error);
    }
  };

  const fetchRoom = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8800/api/rooms/${id}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFormData(data);
      setPhotoUrls(data.photos || []);

      // Convert roomNumbers array to comma-separated string for display
      if (data.roomNumbers && Array.isArray(data.roomNumbers)) {
        const roomNumbersStr = data.roomNumbers
          .map(room => room.number || room)
          .join(', ');
        setRoomNumbersInput(roomNumbersStr);
      }
    } catch (error) {
      console.error('Error fetching room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrls(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Validate
    if (!formData.hotelId || !formData.title || !formData.price || !formData.maxPeople || !formData.desc) {
      alert('Vui lòng điền tất cả các trường bắt buộc');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = id ? 'PUT' : 'POST';
      const url = id
        ? `http://localhost:8800/api/rooms/${id}`
        : `http://localhost:8800/api/rooms/${formData.hotelId}`;

      // Parse room numbers from comma-separated input
      let roomNumbers = formData.roomNumbers || [];
      if (roomNumbersInput.trim()) {
        roomNumbers = roomNumbersInput
          .split(',')
          .map(num => ({ number: parseInt(num.trim()) }))
          .filter(room => !isNaN(room.number));
      }

      const payload = {
        ...formData,
        photos: photoUrls,
        roomNumbers,
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
        alert(id ? 'Cập nhật phòng thành công!' : 'Tạo phòng thành công!');
        navigate('/rooms');
      } else {
        let errorMessage = 'Lỗi khi lưu phòng';
        try {
          const errorData = await res.json();
          errorMessage = errorData?.message || (typeof errorData === 'string' ? errorData : JSON.stringify(errorData));
        } catch (parseErr) {
          try {
            const text = await res.text();
            if (text && text.trim().startsWith('<')) {
              errorMessage = `${res.status} ${res.statusText}`;
            } else {
              errorMessage = text || `${res.status} ${res.statusText}`;
            }
          } catch (textErr) {
            errorMessage = `${res.status} ${res.statusText}`;
          }
        }
        alert(`Lỗi: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving room:', error);
      alert(`Lỗi khi lưu phòng: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="room-detail">
      {/* Header */}
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/rooms')}>
          <ArrowLeft size={20} />
          Quay Lại
        </button>
        <h1>{isViewMode ? '👁️ Xem Phòng' : (id ? '✏️ Sửa Phòng' : '➕ Thêm Phòng')}</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="detail-form">
        <div className="form-layout">
          {/* Left Column - Info */}
          <div className="form-column">
            <div className="form-section">
              <h3>Thông Tin Cơ Bản</h3>

              {!id && (
                <div className="form-group">
                  <label htmlFor="hotelId">Khách Sạn *</label>
                  <select
                    id="hotelId"
                    name="hotelId"
                    value={formData.hotelId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn khách sạn</option>
                    {hotels.map(h => (
                      <option key={h._id} value={h._id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="title">Tên Phòng *</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="VD: Deluxe Room"
                  required
                />
              </div>



              <div className="form-group">
                <label htmlFor="desc">Mô Tả *</label>
                <textarea
                  id="desc"
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết về phòng..."
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="roomNumbersInput">Số Phòng (dấu phẩy)</label>
                <input
                  id="roomNumbersInput"
                  type="text"
                  value={roomNumbersInput}
                  onChange={(e) => setRoomNumbersInput(e.target.value)}
                  placeholder="VD: 101, 102, 103"
                />
                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                  Nhập các số phòng cách nhau bằng dấu phẩy
                </small>
              </div>

              {/* Pricing & Bed Information */}
              <div className="form-section">
                <h3>Giá & Thiết Lập Giường</h3>

                <div className="form-row-three">
                  <div className="form-group">
                    <label htmlFor="price">Giá/Đêm ($) *</label>
                    <input
                      id="price"
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="bedType">Loại Giường</label>
                    <select
                      id="bedType"
                      name="bedType"
                      value={formData.bedType}
                      onChange={handleChange}
                    >
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Twin">Twin</option>
                      <option value="Queen">Queen</option>
                      <option value="King">King</option>
                      <option value="Bunk">Bunk</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="numberOfBeds">Số Giường</label>
                    <input
                      id="numberOfBeds"
                      type="number"
                      name="numberOfBeds"
                      value={formData.numberOfBeds}
                      onChange={handleChange}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Guest Information */}
              <div className="form-section">
                <h3>Thông Tin Khách</h3>

                <div className="form-row-three">


                  <div className="form-group">
                    <label htmlFor="maxPeople">Sức Chứa *</label>
                    <input
                      id="maxPeople"
                      type="number"
                      name="maxPeople"
                      value={formData.maxPeople}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Photos */}
          <div className="form-column">
            <div className="form-section">
              <h3>Hình Ảnh</h3>

              <div className="photo-upload">
                <label htmlFor="photos" className="upload-label">
                  <Upload size={32} />
                  <span>Chọn ảnh</span>
                </label>
                <input
                  id="photos"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </div>

              {photoUrls.length > 0 && (
                <div className="photo-gallery">
                  <h4>Ảnh Đã Chọn ({photoUrls.length})</h4>
                  <div className="gallery-grid">
                    {photoUrls.map((photo, index) => (
                      <div key={index} className="photo-item">
                        <img src={photo} alt={`Room ${index + 1}`} />
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => removePhoto(index)}
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
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
            onClick={() => navigate('/rooms')}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Đang lưu...' : id ? 'Cập Nhật' : 'Tạo Phòng'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomDetail;
