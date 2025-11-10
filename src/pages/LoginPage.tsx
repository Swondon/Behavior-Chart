import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const { user, loginWithGoogle } = useAuth();
  const location = useLocation();
  const from = location.state?.from || '/';

  // If the user is already logged in, redirect them to the charts page
  if (user) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Welcome!</h1>
        <p>Sign in to create and manage your behavior charts.</p>
        <button className="google-signin-btn" onClick={loginWithGoogle}>
          <img src="/googlelogo.webp" alt="Google logo" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default LoginPage;