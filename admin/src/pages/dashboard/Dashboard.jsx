import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Building2,
  DoorOpen,
  Users,
  Star,
  TrendingUp,
  DollarSign,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import "./Dashboard.scss";

const Dashboard = () => {
  const [stats, setStats] = useState({
    hotels: 0,
    rooms: 0,
    users: 0,
    reviews: 0,
    bookings: 0,
    totalRevenue: 0,
  });
  const [recentHotels, setRecentHotels] = useState([]);
  const [recentRooms, setRecentRooms] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [bookingStatusData, setBookingStatusData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const [hotelsRes, roomsRes, usersRes, reviewsRes, bookingsRes] = await Promise.all([
          axiosInstance.get("/hotels"),
          axiosInstance.get("/rooms"),
          axiosInstance.get("/users"),
          axiosInstance.get("/reviews"),
          axiosInstance.get("/bookings"),
        ]);

        const hotels = Array.isArray(hotelsRes.data) ? hotelsRes.data : [];
        const rooms = Array.isArray(roomsRes.data) ? roomsRes.data : [];
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        const reviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
        const bookings = bookingsRes.data?.data || bookingsRes.data || [];

        // Calculate total revenue
        const totalRevenue = Array.isArray(bookings)
          ? bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)
          : 0;

        // Calculate booking status breakdown
        const statusBreakdown = {
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          pending: 0,
        };

        if (Array.isArray(bookings)) {
          bookings.forEach((booking) => {
            const status = booking.status || "pending";
            statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
          });
        }

        setStats({
          hotels: hotels.length,
          rooms: rooms.length,
          users: users.length,
          reviews: reviews.length,
          bookings: bookings.length,
          totalRevenue: totalRevenue,
        });

        setRecentHotels(hotels.slice(0, 5).reverse());
        setRecentRooms(rooms.slice(0, 8).reverse());
        
        if (Array.isArray(bookings)) {
          setRecentBookings(bookings.slice(0, 5).reverse());
        }

        const overviewData = [
          { name: "Khách Sạn", value: hotels.length, fill: "#6366f1" },
          { name: "Phòng", value: rooms.length, fill: "#ec4899" },
          { name: "Người Dùng", value: users.length, fill: "#06b6d4" },
          { name: "Đánh Giá", value: reviews.length, fill: "#f59e0b" },
          { name: "Đặt Phòng", value: bookings.length, fill: "#10b981" },
        ];
        setChartData(overviewData);

        const bookingStatusChart = [
          { name: "Xác Nhận", value: statusBreakdown.confirmed, fill: "#3b82f6" },
          { name: "Hoàn Thành", value: statusBreakdown.completed, fill: "#10b981" },
          { name: "Hủy", value: statusBreakdown.cancelled, fill: "#ef4444" },
          { name: "Chờ Xử Lý", value: statusBreakdown.pending, fill: "#f59e0b" },
        ];
        setBookingStatusData(bookingStatusChart);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError("Lỗi tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ icon: Icon, title, value, color, bgColor, trend }) => (
    <div className={`stat-card ${bgColor}`}>
      <div className="stat-icon">
        <Icon size={28} color={color} />
      </div>
      <div className="stat-content">
        <p className="stat-label">{title}</p>
        <h3 className="stat-value">{loading ? "-" : typeof value === "number" && value > 1000 ? `${(value / 1000).toFixed(1)}K` : value}</h3>
        {trend && <p className="stat-trend-text">↑ {trend}</p>}
      </div>
      <div className="stat-trend">
        <TrendingUp size={16} color={color} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard loading-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard error-container">
        <div className="error-state">
          <AlertCircle size={40} color="#ef4444" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Chào mừng quay lại, Admin! Tổng quan hệ thống quản lý khách sạn</p>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={Building2}
          title="Tổng Khách Sạn"
          value={stats.hotels}
          color="#6366f1"
          bgColor="bg-indigo"
        />
        <StatCard
          icon={DoorOpen}
          title="Tổng Phòng"
          value={stats.rooms}
          color="#ec4899"
          bgColor="bg-pink"
        />
        <StatCard
          icon={Users}
          title="Tổng Người Dùng"
          value={stats.users}
          color="#06b6d4"
          bgColor="bg-cyan"
        />
        <StatCard
          icon={Star}
          title="Tổng Đánh Giá"
          value={stats.reviews}
          color="#f59e0b"
          bgColor="bg-amber"
        />
        {/* Removed Tổng Đặt Phòng card as requested */}
        {stats.totalRevenue > 0 && (
          <StatCard
            icon={DollarSign}
            title="Tổng Doanh Thu"
            value={`${(stats.totalRevenue || 0).toLocaleString("vi-VN")} ₫`}
            color="#ef4444"
            bgColor="bg-red"
          />
        )}
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h2>Thống Kê Tổng Quan</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar
                dataKey="value"
                radius={[8, 8, 0, 0]}
                isAnimationActive={true}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h2>Trạng Thái Đặt Phòng</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bookingStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label
              >
                {bookingStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tables-section">
        <div className="table-container">
          <div className="table-header">
            <h2>Khách Sạn Gần Đây</h2>
            <span className="badge">{recentHotels.length}</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên Khách Sạn</th>
                <th>Địa Chỉ</th>
                <th>Thành Phố</th>
                <th>Phòng</th>
              </tr>
            </thead>
            <tbody>
              {recentHotels.length > 0 ? (
                recentHotels.map((hotel) => (
                  <tr key={hotel._id} className="table-row">
                    <td>
                      <span className="hotel-name">{hotel.name}</span>
                    </td>
                    <td>{hotel.address || "-"}</td>
                    <td>
                      <span className="badge-city">{hotel.city}</span>
                    </td>
                    <td>{hotel.rooms?.length || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">
                    Chưa có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-container">
          <div className="table-header">
            <h2>Phòng Gần Đây</h2>
            <span className="badge">{recentRooms.length}</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên Phòng</th>
                <th>Giá</th>
                <th>Số Người Tối Đa</th>
                <th>Loại Giường</th>
              </tr>
            </thead>
            <tbody>
              {recentRooms.length > 0 ? (
                recentRooms.map((room) => (
                  <tr key={room._id} className="table-row">
                    <td>
                      <span className="room-name">{room.title}</span>
                    </td>
                    <td>
                      <span className="price-badge">
                        <DollarSign size={14} />
                        {room.price?.toLocaleString("vi-VN")} ₫
                      </span>
                    </td>
                    <td>{room.maxPeople || "-"}</td>
                    <td>
                      <span className="bed-type">{room.bedType || "-"}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">
                    Chưa có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-container">
          <div className="table-header">
            <h2>Đặt Phòng Gần Đây</h2>
            <span className="badge">{recentBookings.length}</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Khách Sạn</th>
                <th>Người Dùng</th>
                <th>Ngày Check-in</th>
                <th>Trạng Thái</th>
                <th>Giá</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <tr key={booking._id} className="table-row">
                    <td>
                      <span className="hotel-name">
                        {booking.hotelId?.name || "Không xác định"}
                      </span>
                    </td>
                    <td>{booking.userId?.username || "Người dùng"}</td>
                    <td>
                      {booking.dates?.startDate
                        ? new Date(booking.dates.startDate).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                    <td>
                      <span className={`status-badge status-${booking.status || "pending"}`}>
                        {booking.status || "pending"}
                      </span>
                    </td>
                    <td className="price-badge">
                      {booking.totalPrice?.toLocaleString("vi-VN")} ₫
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    Chưa có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
