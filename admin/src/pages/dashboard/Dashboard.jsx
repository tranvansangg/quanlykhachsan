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
} from "recharts";
import {
  Building2,
  DoorOpen,
  Users,
  Star,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import axios from "axios";
import "./Dashboard.scss";

const Dashboard = () => {
  const [stats, setStats] = useState({
    hotels: 0,
    rooms: 0,
    users: 0,
    reviews: 0,
  });
  const [recentHotels, setRecentHotels] = useState([]);
  const [recentRooms, setRecentRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [hotelsRes, roomsRes, usersRes, reviewsRes] = await Promise.all([
          axios.get("/hotels", { headers }),
          axios.get("/rooms", { headers }),
          axios.get("/users", { headers }),
          axios.get("/reviews", { headers }),
        ]);

        const hotels = hotelsRes.data || [];
        const rooms = roomsRes.data || [];
        const users = usersRes.data || [];
        const reviews = reviewsRes.data || [];

        setStats({
          hotels: hotels.length,
          rooms: rooms.length,
          users: users.length,
          reviews: reviews.length,
        });

        setRecentHotels(hotels.slice(0, 5).reverse());
        setRecentRooms(rooms.slice(0, 8).reverse());

        const chartData = [
          { name: "Khách Sạn", value: hotels.length, fill: "#6366f1" },
          { name: "Phòng", value: rooms.length, fill: "#ec4899" },
          { name: "Người Dùng", value: users.length, fill: "#06b6d4" },
          { name: "Đánh Giá", value: reviews.length, fill: "#f59e0b" },
        ];
        setChartData(chartData);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div className={`stat-card ${bgColor}`}>
      <div className="stat-icon">
        <Icon size={28} color={color} />
      </div>
      <div className="stat-content">
        <p className="stat-label">{title}</p>
        <h3 className="stat-value">{loading ? "-" : value}</h3>
      </div>
      <div className="stat-trend">
        <TrendingUp size={16} color={color} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard loading-container">
        <div className="skeleton-loader"></div>
        <div className="skeleton-loader"></div>
        <div className="skeleton-loader"></div>
        <div className="skeleton-loader"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Chào mừng quay lại, Admin!</p>
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
          <h2>Tỷ Lệ Phân Bố</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label
              >
                {chartData.map((entry, index) => (
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
                        {room.price?.toLocaleString("vi-VN")}
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
      </div>
    </div>
  );
};

export default Dashboard;
