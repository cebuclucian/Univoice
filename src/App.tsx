import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Onboarding } from './pages/Onboarding';
import { Account } from './pages/Account';
import { Home } from './pages/Home';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/app" element={<Layout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="account" element={<Account />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;