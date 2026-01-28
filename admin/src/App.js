import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.scss';
import Login from './pages/login/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Hotels from './pages/hotels/Hotels';
import HotelDetail from './pages/hotels/HotelDetail';
import Rooms from './pages/rooms/Rooms';
import RoomDetail from './pages/rooms/RoomDetail';
import Users from './pages/users/Users';
import UserDetail from './pages/users/UserDetail';
import Reviews from './pages/reviews/Reviews';
import Bookings from './pages/bookings/Bookings';
import BookingDetail from './pages/bookingDetail/BookingDetail';
import Statistics from './pages/statistics/Statistics';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <div className="app-wrapper">
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onLogout={handleLogout} />
          <div className="app-main">
            <Navbar />
            <div className="app-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/hotels/new" element={<HotelDetail />} />
                <Route path="/hotels/:id" element={<HotelDetail />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/rooms/new" element={<RoomDetail />} />
                <Route path="/rooms/:id" element={<RoomDetail />} />
                <Route path="/users" element={<Users />} />
                <Route path="/users/:id" element={<UserDetail />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/bookings/:id" element={<BookingDetail />} />
                <Route path="/statistics" element={<Statistics />} />
              </Routes>
            </div>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
