import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import EntryPage from './pages/EntryPage';
import ViolationsListPage from './pages/ViolationsListPage';
import RoleSheetPage from './pages/RoleSheetPage';
import ReportsPage from './pages/ReportsPage';
import EmployeeManagementPage from './pages/EmployeeManagementPage';
import AuditLogPage from './pages/AuditLogPage';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-bold">
        جاري تهيئة النظام...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-bold">
        جاري تهيئة النظام...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <EntryPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/violations"
            element={
              <PrivateRoute>
                <Layout>
                  <ViolationsListPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/sheet/:role"
            element={
              <PrivateRoute>
                <Layout>
                  <RoleSheetPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Layout>
                  <ReportsPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/employees"
            element={
              <AdminRoute>
                <Layout>
                  <EmployeeManagementPage />
                </Layout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/audit"
            element={
              <AdminRoute>
                <Layout>
                  <AuditLogPage />
                </Layout>
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
