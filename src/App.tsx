import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import ChartListPage from './pages/ChartListPage';
import BehaviorChartPage from './pages/BehaviorChartPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const location = useLocation();

  useEffect(() => {
    const defaultBgColor = '#f4f4f4'; // From index.css
    let bgColor = defaultBgColor;

    // Assign colors based on the current path
    if (location.pathname === '/') {
      bgColor = '#e0f7fa'; // Light Cyan for Home
    } else if (location.pathname === '/charts') {
      bgColor = '#e8f5e9'; // Light Green for Chart List
    } else if (location.pathname.startsWith('/chart/')) {
      bgColor = '#f3e5f5'; // Light Purple for individual charts
    } else if (location.pathname === '/about') {
      bgColor = '#fffde7'; // Light Yellow for About
    }

    document.body.style.backgroundColor = bgColor;

    // Cleanup function to reset on component unmount
    return () => {
      document.body.style.backgroundColor = defaultBgColor;
    };
  }, [location]); // Rerun this effect whenever the location changes

  return (
    <div className="App">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />          
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/charts" 
            element={<ProtectedRoute><ChartListPage /></ProtectedRoute>} 
          />
          <Route 
            path="/chart/:shareCode" 
            element={<ProtectedRoute><BehaviorChartPage /></ProtectedRoute>} 
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
