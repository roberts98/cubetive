import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useEffect } from 'react';
import { theme } from './shared/theme/theme';
import LandingPage from './features/landing/pages/LandingPage';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import UpdatePasswordPage from './features/auth/pages/UpdatePasswordPage';
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage';
import DashboardPage from './features/timer/pages/DashboardPage';
import ProfilePage from './features/profile/pages/ProfilePage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import { useAuthStore } from './features/auth/stores/authStore';

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  // Initialize auth state on app mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
