import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, DollarSign, Calendar, Package } from 'lucide-react';
import './statistics.scss';

const Statistics = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    confirmedBookings: 0,
    completedBookings: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8800/api/bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      console.log('Statistics - Fetched bookings:', data);
      setBookings(data);
      calculateStats(data);
      calculateMonthlyStats(data);
    } catch (err) {
      console.error('Lỗi khi lấy thống kê:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsData) => {
    // Exclude cancelled and refunded bookings from revenue
    const validBookings = bookingsData.filter(b => b.status !== 'cancelled' && b.paymentStatus !== 'refunded');
    const totalBookings = validBookings.length;
    const totalRevenue = validBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const confirmedBookings = validBookings.filter(b => b.status === 'confirmed').length;
    const completedBookings = validBookings.filter(b => b.status === 'completed').length;

    console.log('Statistics - Valid bookings:', validBookings.length);
    console.log('Statistics - Total revenue:', totalRevenue);
    console.log('Statistics - Booking details:', validBookings.map(b => ({ _id: b._id, amount: b.totalAmount, status: b.status, paymentStatus: b.paymentStatus })));

    setStats({
      totalBookings,
      totalRevenue,
      confirmedBookings,
      completedBookings,
    });
  };

  const calculateMonthlyStats = (bookingsData) => {
    const monthMap = {};
    // Exclude cancelled and refunded bookings from monthly stats
    const validBookings = bookingsData.filter(b => b.status !== 'cancelled' && b.paymentStatus !== 'refunded');

    validBookings.forEach(booking => {
      const date = new Date(booking.paymentDate);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          month: monthKey,
          bookings: 0,
          revenue: 0,
          date: new Date(date.getFullYear(), date.getMonth(), 1),
        };
      }

      monthMap[monthKey].bookings++;
      monthMap[monthKey].revenue += booking.totalAmount || 0;
    });

    const sorted = Object.values(monthMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-12); // Last 12 months

    setMonthlyStats(sorted);
  };

  const getDailyStats = () => {
    const [year, month] = selectedMonth.split('-');
    // Exclude cancelled and refunded bookings
    const monthBookings = bookings.filter(b => {
      const date = new Date(b.paymentDate);
      return date.getFullYear() === parseInt(year) && (date.getMonth() + 1) === parseInt(month) && b.status !== 'cancelled' && b.paymentStatus !== 'refunded';
    });

    const dayMap = {};
    monthBookings.forEach(booking => {
      const date = new Date(booking.paymentDate);
      const day = date.getDate();

      if (!dayMap[day]) {
        dayMap[day] = {
          day,
          bookings: 0,
          revenue: 0,
        };
      }

      dayMap[day].bookings++;
      dayMap[day].revenue += booking.totalAmount || 0;
    });

    return Object.values(dayMap).sort((a, b) => a.day - b.day);
  };

  const dailyStats = getDailyStats();
  const maxDailyRevenue = Math.max(...dailyStats.map(d => d.revenue), 0);

  if (loading) return <div className="stats-loader">Đang tải thống kê...</div>;

  return (
    <div className="statistics-container">
      <div className="stats-header">
        <h1>Thống Kê & Phân Tích</h1>
        <p className="header-subtitle">Tổng quan về doanh thu và đơn đặt</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card total-bookings">
          <div className="kpi-icon">
            <Package size={32} />
          </div>
          <div className="kpi-content">
            <h3>Tổng Đơn Đặt</h3>
            <p className="kpi-value">{stats.totalBookings}</p>
            <span className="kpi-detail">tất cả các đơn</span>
          </div>
        </div>

        <div className="kpi-card total-revenue">
          <div className="kpi-icon">
            <DollarSign size={32} />
          </div>
          <div className="kpi-content">
            <h3>Tổng Doanh Thu</h3>
            <p className="kpi-value">{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
            <span className="kpi-detail">{stats.totalRevenue.toLocaleString('vi-VN')} VND</span>
          </div>
        </div>

        <div className="kpi-card confirmed-bookings">
          <div className="kpi-icon">
            <Calendar size={32} />
          </div>
          <div className="kpi-content">
            <h3>Đã Thanh Toán</h3>
            <p className="kpi-value">{stats.confirmedBookings}</p>
            <span className="kpi-detail">đang chờ xử lý</span>
          </div>
        </div>

        <div className="kpi-card completed-bookings">
          <div className="kpi-icon">
            <TrendingUp size={32} />
          </div>
          <div className="kpi-content">
            <h3>Hoàn Thành</h3>
            <p className="kpi-value">{stats.completedBookings}</p>
            <span className="kpi-detail">đã kết thúc</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Monthly Revenue Chart */}
        <div className="chart-container">
          <h2>Doanh Thu Theo Tháng</h2>
          <div className="chart-wrapper">
            <div className="monthly-chart">
              {monthlyStats.length === 0 ? (
                <p className="no-data">Chưa có dữ liệu</p>
              ) : (
                <div className="bars-container">
                  {monthlyStats.map((stat) => {
                    const maxRevenue = Math.max(...monthlyStats.map(s => s.revenue), 0);
                    const heightPercent = maxRevenue > 0 ? (stat.revenue / maxRevenue) * 100 : 0;

                    return (
                      <div key={stat.month} className="bar-item">
                        <div className="bar-content">
                          <div
                            className="bar"
                            style={{ height: `${heightPercent}%` }}
                            title={`${stat.revenue.toLocaleString('vi-VN')} VND`}
                          ></div>
                          <div className="bar-label">
                            <span className="month">{stat.month}</span>
                            <span className="value">{(stat.revenue / 1000000).toFixed(1)}M</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Daily Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <h2>Doanh Thu Theo Ngày</h2>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="month-picker"
            />
          </div>
          <div className="chart-wrapper">
            <div className="daily-chart">
              {dailyStats.length === 0 ? (
                <p className="no-data">Chưa có dữ liệu cho tháng này</p>
              ) : (
                <div className="days-container">
                  {dailyStats.map((stat) => {
                    const heightPercent = maxDailyRevenue > 0 ? (stat.revenue / maxDailyRevenue) * 100 : 0;

                    return (
                      <div key={stat.day} className="day-item">
                        <div className="day-content">
                          <div
                            className="bar"
                            style={{ height: `${heightPercent}%` }}
                            title={`${stat.revenue.toLocaleString('vi-VN')} VND (${stat.bookings} đơn)`}
                          ></div>
                          <div className="day-label">
                            <span className="day-num">{stat.day}</span>
                            <span className="revenue">{(stat.revenue / 1000000).toFixed(2)}M</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="summary-section">
        <h2>Tóm Tắt Doanh Thu</h2>
        <div className="summary-table-wrapper">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Tháng</th>
                <th>Số Đơn</th>
                <th>Doanh Thu</th>
                <th>Trung Bình</th>
              </tr>
            </thead>
            <tbody>
              {monthlyStats.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                monthlyStats.map((stat) => (
                  <tr key={stat.month}>
                    <td className="month-cell">
                      <strong>{stat.month}</strong>
                    </td>
                    <td>{stat.bookings}</td>
                    <td className="revenue-cell">
                      <strong>{stat.revenue.toLocaleString('vi-VN')} VND</strong>
                    </td>
                    <td className="average-cell">
                      {(stat.revenue / stat.bookings).toLocaleString('vi-VN')} VND
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
