import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for toastify

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import SearchPage from './pages/SearchPage';

// Invoice Pages
import InvoiceListPage from './pages/Invoices/InvoiceListPage';
import InvoiceFormPage from './pages/Invoices/InvoiceFormPage';

// Purchase Order Pages
import PurchaseOrderListPage from './pages/PurchaseOrders/PurchaseOrderListPage';
import PurchaseOrderFormPage from './pages/PurchaseOrders/PurchaseOrderFormPage';

// Stock Register Pages
import StockRegisterListPage from './pages/StockRegister/StockRegisterListPage';
import StockRegisterFormPage from './pages/StockRegister/StockRegisterFormPage';

// Admin Pages
import AdminUsersPage from './pages/Admin/AdminUsersPage';
import AdminEditRequestsPage from './pages/Admin/AdminEditRequestsPage';

import { ProtectedRoute, AdminRoute } from './router'; // Import route guards
import { useAuthStore } from './store/authStore';
import { initializeSocket, disconnectSocket } from './lib/socket'; // Socket functions

function App() {
    // Get user and hydrate function from the store
    const user = useAuthStore((state) => state.user);
    const hydrate = useAuthStore((state) => state.hydrate);
    const isLoadingAuth = useAuthStore((state) => state.isLoading); // Track loading state


    useEffect(() => {
       // Indicate hydration check is complete *after* the component initially mounts.
       // Zustand persist might finish loading before this, but this signals app is ready.
        console.log("App mounted, calling hydrate.");
       hydrate();
    }, [hydrate]);

    // Effect to manage Socket.IO connection based on user state
    useEffect(() => {
        // Only initialize socket if authentication check is done and user is logged in
        if (!isLoadingAuth && user) {
             console.log("User authenticated, initializing socket...");
            initializeSocket(user.id, user.role);
        } else if (!isLoadingAuth && !user) {
            console.log("User not authenticated, ensuring socket is disconnected...");
            disconnectSocket(); // Ensure disconnection on logout or if initially not logged in
        }

        // Cleanup function: disconnect socket when component unmounts or user logs out
        return () => {
             console.log("App cleanup: Disconnecting socket.");
            disconnectSocket();
        };
    }, [user, isLoadingAuth]); // Re-run when user state or loading status changes


  return (
    <BrowserRouter>
      {/* Toast container must be rendered within the app */}
      <ToastContainer
            position="bottom-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            limit={5} // Limit number of toasts shown
        />
      <Routes>
        {/* Public Route: Login Page */}
        <Route path="/login" element={<LoginPage />} />

         {/* Protected Routes (Accessed via ProtectedRoute guard which includes Layout) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/search" element={<SearchPage />} />

          {/* --- Feature Routes --- */}
          {/* Invoices */}
          <Route path="/invoices" element={<InvoiceListPage />} />
          <Route path="/invoices/new" element={<InvoiceFormPage mode="create" />} />
          <Route path="/invoices/edit/:id" element={<InvoiceFormPage mode="edit" />} />

          {/* Purchase Orders */}
          <Route path="/purchase-orders" element={<PurchaseOrderListPage />} />
          <Route path="/purchase-orders/new" element={<PurchaseOrderFormPage mode="create" />} />
          <Route path="/purchase-orders/edit/:id" element={<PurchaseOrderFormPage mode="edit" />} />

          {/* Stock Register */}
          <Route path="/stock-register" element={<StockRegisterListPage />} />
          <Route path="/stock-register/new" element={<StockRegisterFormPage mode="create" />} />
          <Route path="/stock-register/edit/:id" element={<StockRegisterFormPage mode="edit" />} />

          {/* Redirect base protected path to dashboard */}
           <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

         {/* Admin Only Routes (Accessed via AdminRoute guard which includes Layout) */}
        <Route element={<AdminRoute />}>
             <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/edit-requests" element={<AdminEditRequestsPage />} />
            {/* Add other admin routes here */}
        </Route>

         {/* Catch-all 404 Route - Placed last */}
         <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;