import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const [code, setCode] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chartCode = code.trim().toUpperCase();
    if (chartCode) {
      if (user) {
        navigate(`/chart/${chartCode}`);
      } else {
        navigate('/login', { state: { from: `/chart/${chartCode}` } });
      }
    }
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Welcome to the Behavior Chart!</h1>
        <p className="home-subtitle">
          A fun and easy way to track and encourage positive behavior.
        </p>
      </header>
      <main className="home-main">
        <div className="home-card">
          <h2>Get Started</h2>
          {user ? (
            <>
              <p>View your behavior charts and see how everyone is doing. Ready to start a great day?</p>
              <Link to="/charts" className="home-cta-button">
                View My Charts
              </Link>
            </>
          ) : (
            <>
              <p>Login to create your own charts and track progress with your friends and family.</p>
              <Link to="/login" className="home-cta-button">Login to Get Started</Link>
            </>
          )}
        </div>

        <div className="home-card join-card">
          <h2>Join a Chart</h2>
          <form onSubmit={handleJoinSubmit} className="join-form">
            <input type="text" placeholder="Enter Code" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} />
            <button type="submit">Join</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
