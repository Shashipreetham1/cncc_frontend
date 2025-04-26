import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InvoiceListPage from './pages/Invoices/InvoiceListPage';
import InvoiceFormPage from './pages/Invoices/InvoiceFormPage'; // For Create/Edit
import PurchaseOrderListPage from './pages/PurchaseOrders/PurchaseOrderListPage';
import PurchaseOrderFormPage from './pages/PurchaseOrders/PurchaseOrderFormPage';
import StockRegisterListPage from './pages/StockRegister/StockRegisterListPage';
import StockRegisterFormPage from './pages/StockRegister/StockRegisterFormPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/Admin/AdminUsersPage';
import AdminEditRequestsPage from './pages/Admin/AdminEditRequestsPage';
import NotFoundPage from './pages/NotFoundPage'; // Simple 404 component

import { ProtectedRoute, AdminRoute } from './router'; // Import guards
import { useAuthStore } from './store/authStore';
import { initializeSocket, disconnectSocket } from './lib/socket'; // Create this

function App() {
    const { user, hydrate } = useAuthStore(); // Get hydrate action

    useEffect(() => {
       // Finish hydration check after component mounts
       hydrate();
    }, [hydrate]);


   useEffect(() => {
       // Initialize Socket.IO connection when user logs in
       if (user) {
            initializeSocket(user.id, user.role); // Pass user info to socket logic
       } else {
            disconnectSocket(); // Disconnect if user logs out
       }

       // Cleanup on component unmount or user change
        return () => {
            disconnectSocket();
        };
   }, [user]); // Re-run when user state changes


  return (
    <BrowserRouter>
       {/* Toast container for notifications */}
      <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored" // Use colored themes defined in index.css
        />
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

         {/* Protected Routes (require login) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Invoice Routes */}
          <Route path="/invoices" element={<InvoiceListPage />} />
          <Route path="/invoices/new" element={<InvoiceFormPage />} />
          <Route path="/invoices/edit/:id" element={<InvoiceFormPage />} />

           {/* Purchase Order Routes */}
          <Route path="/purchase-orders" element={<PurchaseOrderListPage />} />
          <Route path="/purchase-orders/new" element={<PurchaseOrderFormPage />} />
          <Route path="/purchase-orders/edit/:id" element={<PurchaseOrderFormPage />} />

          {/* Stock Register Routes */}
           <Route path="/stock-register" element={<StockRegisterListPage />} />
          <Route path="/stock-register/new" element={<StockRegisterFormPage />} />
          <Route path="/stock-register/edit/:id" element={<StockRegisterFormPage />} />

           {/* Search Routes */}
           <Route path="/search" element={<SearchPage />} />
        </Route>

         {/* Admin Only Routes */}
        <Route element={<AdminRoute />}>
             <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/edit-requests" element={<AdminEditRequestsPage />} />
             {/* Add other admin-specific pages here */}
        </Route>

         {/* Redirect root path */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

         {/* Catch-all 404 Route */}
         <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;