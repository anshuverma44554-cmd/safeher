import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EmergencyProvider } from './context/EmergencyContext';

// Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ActiveSosBanner } from './components/common/ActiveSosBanner';
import { EmergencyModal } from './components/common/EmergencyModal';
import { AiAssistantDrawer } from './components/ai/AiAssistantDrawer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TravellerDashboard } from './pages/TravellerDashboard';
import { GuardianDashboard } from './pages/GuardianDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { PublicTrackingPage } from './pages/PublicTrackingPage';
import { SafePlacesPage } from './pages/SafePlacesPage';
import { AiSafetyPage } from './pages/AiSafetyPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: Array<'traveller' | 'guardian' | 'admin'> }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-xs text-slate-400 font-semibold animate-pulse">Loading SafeHer session...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If trying to access admin without admin role, redirect to their home
    if (user.role === 'guardian') return <Navigate to="/guardian" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-[#07090E] text-slate-100 font-sans">
      <Navbar />
      <ActiveSosBanner />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/safe-places" element={<SafePlacesPage />} />
          <Route path="/assistant" element={<AiSafetyPage />} />
          <Route path="/track/:shareToken" element={<PublicTrackingPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['traveller', 'guardian', 'admin']}>
                <TravellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guardian"
            element={
              <ProtectedRoute allowedRoles={['guardian', 'admin']}>
                <GuardianDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <EmergencyModal />
      <AiAssistantDrawer />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EmergencyProvider>
          <AppContent />
        </EmergencyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

