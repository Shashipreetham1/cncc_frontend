import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import Card from '../components/ui/Card'; // Import Card
import Spinner from '../components/ui/Spinner'; // Import Spinner
import { fetchDashboardSummary, DashboardSummary } from '../features/dashboard/dashboardApi'; // Import API call
import { Link } from 'react-router-dom';

// Icons (Replace with actual components)
const InvoiceIcon = () => <span>📄</span>;
const PurchaseOrderIcon = () => <span>🛒</span>;
const StockIcon = () => <span>📦</span>;
const EditReqIcon = () => <span>🔔</span>;

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }));
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchDashboardSummary();
        setSummary(data);
      } catch (err) {
        const message = (err as Error).message || "Failed to load dashboard data.";
        setError(message);
        // Display toast error but don't crash the page
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, []); // Fetch on component mount

  const renderSummaryCard = (title: string, value?: number, icon?: React.ReactNode, linkTo?: string, accentColorClass = 'text-primary') => {
    const cardContent = isLoading ? (
       <div className="flex items-center justify-center h-24">
           <Spinner size="md" />
       </div>
    ) : error && value === undefined ? ( // Show specific error only if count isn't available fallback
        <p className="text-xs text-red-500 text-center py-4">Could not load count.</p>
     ) : (
        <>
           <div className={`text-4xl font-bold ${accentColorClass}`}>{value ?? 'N/A'}</div>
           {linkTo ? (
                <Link to={linkTo} className="text-xs text-neutral-500 hover:underline mt-1">View All</Link>
            ) : <div className="h-4 mt-1"></div> /* Spacer */}
       </>
    );

     return (
         <Card title={title} className="text-center" actions={icon ? <div className={`text-xl opacity-50 ${accentColorClass}`}>{icon}</div> : undefined}>
            {cardContent}
        </Card>
     );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Dashboard</h1>

      {/* Welcome Message Card */}
      <Card>
        <h2 className="text-xl font-semibold text-neutral-800 mb-3">Welcome Back!</h2>
        {user?.username ? (
             <p className="text-neutral-600">
                 Hello, <span className="font-medium text-primary-dark">{user.username}</span>! Use the sidebar to navigate the portal.
            </p>
         ) : (
             <p className="text-neutral-500">Loading user info...</p> // Should be quick via Zustand
         )}
         {/* Display general error if summary fetch failed */}
         {error && !isLoading && (
             <p className="text-sm text-red-600 mt-2">{error}</p>
         )}
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderSummaryCard("Total Invoices", summary?.totalInvoices, <InvoiceIcon/>, '/invoices', 'text-blue-600')}
        {renderSummaryCard("Total Purchase Orders", summary?.totalPurchaseOrders, <PurchaseOrderIcon/>, '/purchase-orders', 'text-green-600')}
        {renderSummaryCard("Total Stock Entries", summary?.totalStockEntries, <StockIcon/>, '/stock-register', 'text-indigo-600')}
        {/* Highlight pending requests for admins */}
        {user?.role === 'ADMIN' && renderSummaryCard("Pending Edit Requests", summary?.pendingEditRequests, <EditReqIcon/>, '/admin/edit-requests', summary?.pendingEditRequests ?? 0 > 0 ? 'text-warning font-bold' : 'text-orange-600')}
      </div>

      {/* Placeholder for recent activity or other sections */}
       <Card title="Recent Activity (Placeholder)">
         <p className="text-neutral-500 text-sm">
            [A list or summary of recent actions/updates would go here...]
         </p>
       </Card>

    </div>
  );
};

export default DashboardPage;