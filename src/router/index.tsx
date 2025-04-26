import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/layout/Layout'; // Create this next

// --- Protected Route Component ---
export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    // Show a loading spinner or placeholder while checking auth state
    return <div>Loading Authentication...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login, saving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content within the layout
  return (
    <Layout>
       <Outlet /> {/* Child routes will render here */}
    </Layout>
   );
};

 // --- Admin Only Route Component ---
export const AdminRoute: React.FC = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading Authentication...</div>;
  }

  if (!isAuthenticated) {
    // Not logged in at all
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

   if (!isAdmin) {
      // Logged in, but not an admin
      console.warn("Access denied: Admin privileges required.");
      // Redirect to a 'forbidden' page or dashboard
       return <Navigate to="/dashboard" state={{ message: "Admin access required" }} replace />;
   }

  // User is authenticated and is an admin
    return (
        <Layout>
             <Outlet /> {/* Admin child routes will render here */}
        </Layout>
    );
};


// Define your main route configuration array here (if preferred)
// Or define directly in App.tsx