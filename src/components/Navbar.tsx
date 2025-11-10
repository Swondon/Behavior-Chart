import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand" onClick={closeMenu}>
        Behavior Chart
      </Link>
      <button className={`hamburger-menu ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </button>
      <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <li>
          <NavLink to="/about" onClick={closeMenu}>About</NavLink>
        </li>
        {user && (
          <li>
            <NavLink to="/charts" onClick={closeMenu}>Charts</NavLink>
          </li>
        )}
        <li className="nav-auth-section">
          {user ? (
            <div className="user-profile">
              <img src={user.photoURL || '/default-avatar.svg'} alt={user.firstName || 'User'} className="profile-pic" />
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="login-button" onClick={closeMenu}>
              Login
            </NavLink>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
