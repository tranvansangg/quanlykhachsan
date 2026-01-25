import React from 'react';
import './Navbar.scss';

const Navbar = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <header className="navbar">
            <div className="navbar-container">
                <div className="navbar-title">
                    <h2>Quản Lý Khách Sạn</h2>
                </div>
                <div className="navbar-user">
                    <div className="user-avatar">
                        {user.username ? user.username.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="user-info">
                        <p className="user-name">{user.username || 'Admin'}</p>
                        <p className="user-role">Quản trị viên</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
