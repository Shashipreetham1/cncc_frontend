import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/layout/Layout';
import Spinner from '../components/ui/Spinner'; // Assuming you create a Spinner component

/**
 * Protected Route Guard:
 * - Renders child routes within the main Layout if authenticated.
 * - Redirects to login page if not authenticated.
 * - Shows a loading indicator while checking auth status.
 */
export const ProtectedRoute: React.FC = () => {
  // Subscribe to specific state parts needed
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const location = useLocation();

  // Show loading indicator while Zustand rehydrates/checks auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" /> {/* Or your loading component */}
      </div>
    );
  }

  // If not authenticated after loading, redirect to login
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login.');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the main application layout with nested routes
  return (
    <Layout>
      <Outlet /> {/* Nested child routes are rendered here */}
    </Layout>
  );
};

/**
 * Admin Route Guard:
 * - Checks if user is authenticated AND has ADMIN role.
 * - Renders child admin routes within Layout if authorized.
 * - Redirects to dashboard (or forbidden page) if logged in but not admin.
 * - Redirects to login if not authenticated.
 */
export const AdminRoute: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const isLoading = useAuthStore((state) => state.isLoading);
  const location = useLocation();

  // Show loading indicator during auth check
  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <Spinner size="lg" />
        </div>
      );
  }

  // Redirect to login if not authenticated at all
  if (!isAuthenticated) {
      console.log('AdminRoute: Not authenticated, redirecting to login.');
      return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to dashboard (or a dedicated 403 page) if authenticated but not admin
  if (!isAdmin) {
      console.warn("AdminRoute: Access denied, user is not an admin. Redirecting...");
      // Consider creating a specific /forbidden page if needed
      return <Navigate to="/dashboard" state={{ message: "Access Denied: Admin Required" }} replace />;
  }

  // User is authenticated AND is an admin, render admin layout/routes
  return (
    <Layout>
      <Outlet /> {/* Nested admin child routes */}
    </Layout>
  );
};