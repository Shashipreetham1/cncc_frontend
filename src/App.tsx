// src/App.tsx
// (Keep the code exactly as provided in the previous "Final Consolidated" step)
// No changes are needed here just because the Tailwind method changed.
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import SearchPage from './pages/SearchPage';
import InvoiceListPage from './pages/Invoices/InvoiceListPage';
import InvoiceFormPage from './pages/Invoices/InvoiceFormPage';
import PurchaseOrderListPage from './pages/PurchaseOrders/PurchaseOrderListPage';
import PurchaseOrderFormPage from './pages/PurchaseOrders/PurchaseOrderFormPage';
import StockRegisterListPage from './pages/StockRegister/StockRegisterListPage';
import StockRegisterFormPage from './pages/StockRegister/StockRegisterFormPage';
import AdminUsersPage from './pages/Admin/AdminUsersPage';
import AdminEditRequestsPage from './pages/Admin/AdminEditRequestsPage';
import { ProtectedRoute, AdminRoute } from './router';
import { useAuthStore } from './store/authStore';
import { initializeSocket, disconnectSocket } from './lib/socket';

const App: React.FC = () => { /* ... function body as provided before ... */
    const user = useAuthStore((state) => state.user);
    const hydrateAuth = useAuthStore((state) => state.hydrate);
    const isLoadingAuth = useAuthStore((state) => state.isLoading);

    useEffect(() => { hydrateAuth(); }, [hydrateAuth]);

    useEffect(() => {
        if (!isLoadingAuth && user) initializeSocket(user.id, user.role);
        else if (!isLoadingAuth && !user) disconnectSocket();
        return () => { disconnectSocket(); };
    }, [user, isLoadingAuth]);

  return (
     <BrowserRouter>
       <ToastContainer /* ...props... */ />
       <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
             <Route path="/dashboard" element={<DashboardPage />} />
             <Route path="/profile" element={<ProfilePage />} />
             <Route path="/search" element={<SearchPage />} />
             {/* ... other protected routes for invoices, POs, stock ... */}
              <Route path="/invoices" element={<InvoiceListPage />} />
              <Route path="/invoices/new" element={<InvoiceFormPage mode="create" />} />
              <Route path="/invoices/edit/:id" element={<InvoiceFormPage mode="edit" />} />
              <Route path="/purchase-orders" element={<PurchaseOrderListPage />} />
              <Route path="/purchase-orders/new" element={<PurchaseOrderFormPage mode="create" />} />
              <Route path="/purchase-orders/edit/:id" element={<PurchaseOrderFormPage mode="edit" />} />
              <Route path="/stock-register" element={<StockRegisterListPage />} />
              <Route path="/stock-register/new" element={<StockRegisterFormPage mode="create" />} />
              <Route path="/stock-register/edit/:id" element={<StockRegisterFormPage mode="edit" />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
           {/* Admin Only Routes */}
           <Route element={<AdminRoute />}>
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/edit-requests" element={<AdminEditRequestsPage />} />
           </Route>
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
   );
}
export default App;