
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EquipmentPage from './pages/EquipmentPage';
import AddEquipmentPage from './pages/AddEquipmentPage'; // New
import EditEquipmentPage from './pages/EditEquipmentPage'; // New
import EquipmentDetailPage from './pages/EquipmentDetailPage'; // New
import ReportIssuePage from './pages/ReportIssuePage';
import IssuesListPage from './pages/IssuesListPage';
import ReportsPage from './pages/ReportsPage';
import AdminPage from './pages/AdminPage';
import { UserRole } from './types';

// ProtectedRoute component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    // User is authenticated but not authorized for this route
    return <Navigate to="/" replace />; // Or a specific "Access Denied" page
  }

  return <>{children}</>;
};


const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="equipment" element={<ProtectedRoute><EquipmentPage /></ProtectedRoute>} />
        <Route path="equipment/new" element={
            <ProtectedRoute allowedRoles={[UserRole.BIOREN_ADMIN, UserRole.UNIT_MANAGER]}>
                <AddEquipmentPage />
            </ProtectedRoute>
        } />
        <Route path="equipment/:equipmentId" element={
            <ProtectedRoute>
                <EquipmentDetailPage />
            </ProtectedRoute>
        } />
        <Route path="equipment/:equipmentId/edit" element={
            <ProtectedRoute allowedRoles={[UserRole.BIOREN_ADMIN, UserRole.UNIT_MANAGER]}>
                <EditEquipmentPage />
            </ProtectedRoute>
        } />
        <Route path="issues/new" element={<ProtectedRoute><ReportIssuePage /></ProtectedRoute>} />
        <Route path="issues" element={<ProtectedRoute><IssuesListPage /></ProtectedRoute>} />
        <Route path="reports" element={
            <ProtectedRoute allowedRoles={[UserRole.BIOREN_ADMIN, UserRole.UNIT_MANAGER]}>
                <ReportsPage />
            </ProtectedRoute>
        } />
        <Route path="admin/users" element={
            <ProtectedRoute allowedRoles={[UserRole.BIOREN_ADMIN]}>
                <AdminPage />
            </ProtectedRoute>
        } />
         <Route path="admin/settings" element={
            <ProtectedRoute allowedRoles={[UserRole.BIOREN_ADMIN]}>
                <AdminPage /> {/* Assuming settings are part of AdminPage for simplicity */}
            </ProtectedRoute>
        } />
        {/* Catch-all for authenticated users or redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;