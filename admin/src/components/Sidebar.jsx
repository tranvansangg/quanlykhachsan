import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    DoorOpen,
    Users,
    MessageSquare,
    LogOut,
    Menu,
    BarChart3,
    BookOpen
} from 'lucide-react';
import './Sidebar.scss';

const Sidebar = ({ isOpen, setIsOpen, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/hotels', label: 'Khách Sạn', icon: Building2 },
        { path: '/rooms', label: 'Phòng', icon: DoorOpen },
        { path: '/users', label: 'Người Dùng', icon: Users },
        { path: '/reviews', label: 'Đánh Giá', icon: MessageSquare },
        { path: '/bookings', label: 'Đặt Phòng', icon: BookOpen },
        { path: '/statistics', label: 'Thống Kê', icon: BarChart3 },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
            onLogout();
            navigate('/login');
        }
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <Building2 size={28} />
                    <span>Hotel Admin</span>
                </div>
                <button
                    className="sidebar-close"
                    onClick={() => setIsOpen(false)}
                >
                    ✕
                </button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.path}
                        className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => {
                            navigate(item.path);
                            setIsOpen(false);
                        }}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={20} />
                <span>Đăng Xuất</span>
            </button>
        </aside>
    );
};

export default Sidebar;
