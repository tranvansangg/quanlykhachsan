# Hướng Dẫn Khắc Phục Lỗi "Unexpected token '<'"

## Nguyên Nhân Lỗi
Lỗi **"Unexpected token '<', "<!DOCTYPE "... is not valid JSON"** xảy ra khi:
- API server không chạy hoặc không phản hồi
- Client đang gửi request đến sai port
- Server trả về HTML (lỗi 404/500) thay vì JSON

## Các Bước Khắc Phục

### 1. Kiểm Tra Cấu Hình API
✅ Đã tạo file [client/src/utils/axiosInstance.js](client/src/utils/axiosInstance.js)
- Đặt baseURL thành: `http://localhost:8800/api`
- Hỗ trợ biến môi trường: `REACT_APP_API_URL`

✅ Đã cập nhật [client/src/hooks/useFetch.js](client/src/hooks/useFetch.js)
- Sử dụng `axiosInstance` thay vì `axios` trực tiếp
- Tự động thêm `/api` vào URL

✅ Đã cập nhật [client/src/pages/list/List.jsx](client/src/pages/list/List.jsx)
- Sử dụng `axiosInstance.post()` thay vì `fetch()`
- Đã tạo file [client/.env](client/.env)

### 2. Chạy API Server (Port 8800)
```powershell
cd api
npm install
node index.js
# hoặc
npm start
```
Output kỳ vọng:
```
Connected to mongoDB.
```

### 3. Chạy Client (Port 3000)
**Mở terminal mới** (đừng dùng terminal chạy API)
```powershell
cd client
npm install
npm start
```

### 4. Kiểm Tra Kết Nối
Mở trình duyệt và kiểm tra:
- Client chạy ở: http://localhost:3000
- API chạy ở: http://localhost:8800
- API endpoint: http://localhost:8800/api/hotels

### 5. Xử Lý Lỗi Thường Gặp

**Lỗi: "Cannot GET /hotels/..."**
- ✅ Đã sửa: Axios sẽ tự động thêm `/api` vào URL

**Lỗi: "CORS error"**
- ✅ Đã cấu hình: API có `cors()` middleware
- Client gửi `withCredentials: true` nếu cần

**Lỗi: "Network error"**
- Kiểm tra API server có chạy không
- Kiểm tra port 8800 không bị chiếm

## File Được Thay Đổi
1. ✅ [client/src/utils/axiosInstance.js](client/src/utils/axiosInstance.js) - **Tạo mới**
2. ✅ [client/src/hooks/useFetch.js](client/src/hooks/useFetch.js) - **Cập nhật**
3. ✅ [client/src/pages/list/List.jsx](client/src/pages/list/List.jsx) - **Cập nhật**
4. ✅ [client/.env](client/.env) - **Tạo mới**

## Các Bước Tiếp Theo
1. Khởi động lại cả API và Client
2. Thử tìm kiếm khách sạn
3. Nếu vẫn lỗi, kiểm tra console trình duyệt (F12) để xem URL đang gửi
