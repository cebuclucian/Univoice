import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import { Onboarding } from './pages/Onboarding';
import { Account } from './pages/Account';
import { MarketingPlans } from './pages/MarketingPlans';
import { Pricing } from './pages/Pricing';
import { Home } from './pages/Home';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { ToastContainer } from './components/Toast';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public routes - only for non-authenticated users */}
            <Route path="/" element={
              <PublicRoute>
                <Home />
              </PublicRoute>
            } />
            <Route path="/auth" element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } />
            <Route path="/pricing" element={<Pricing />} />
            
            {/* Direct dashboard route for backward compatibility */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Navigate to="/app/dashboard" replace />
              </ProtectedRoute>
            } />
            
            {/* Protected routes - only for authenticated users */}
            <Route path="/app" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="plans" element={<MarketingPlans />} />
              <Route path="account" element={<Account />} />
            </Route>
            
            {/* Catch all route - redirect based on auth status */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Global Toast Container */}
          <ToastContainer />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;