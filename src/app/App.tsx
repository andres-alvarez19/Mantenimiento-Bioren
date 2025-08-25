
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import LoginPage from './(admin)/admin/LoginPage';
import DashboardPage from './(admin)/admin/DashboardPage';
import EquipmentPage from './(admin)/admin/EquipmentPage';
import AddEquipmentPage from './(admin)/admin/AddEquipmentPage'; // New
import EditEquipmentPage from './(admin)/admin/EditEquipmentPage'; // New
import EquipmentDetailPage from './(admin)/admin/EquipmentDetailPage'; // New
import ReportIssuePage from './(admin)/admin/ReportIssuePage';
import IssuesListPage from './(admin)/admin/IssuesListPage';
import ReportsPage from './(admin)/admin/ReportsPage';
import AdminPage from './(admin)/admin/AdminPage';
import { UserRole } from '@/types';
import ActivateInvitePage from './(admin)/admin/ActivateInvitePage';

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
      <Route path="invite/:token" element={<ActivateInvitePage />} />
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
            <ProtectedRoute allowedRoles={[UserRole.BIOREN_ADMIN, UserRole.UNIT_MANAGER]}>
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
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
