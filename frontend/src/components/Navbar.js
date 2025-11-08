import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'faculty':
        return '/faculty';
      case 'student':
        return '/student';
      default:
        return '/login';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to={getDashboardPath()} className="navbar-brand">
          SCNBCP
        </Link>
        {user && (
          <div className="navbar-links">
            <Link to={getDashboardPath()}>Dashboard</Link>
            {user.role === 'admin' && (
              <>
                <Link to="/admin/users">Users</Link>
                <Link to="/admin/analytics">Analytics</Link>
              </>
            )}
            <div className="navbar-user">
              <div className="user-info">
                <span>{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

