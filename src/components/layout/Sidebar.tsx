import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

// Example icons (replace with actual icon components e.g., from react-icons)
const DashboardIcon = () => <span>📊</span>;
const InvoiceIcon = () => <span>📄</span>;
const PurchaseOrderIcon = () => <span>🛒</span>;
const StockIcon = () => <span>📦</span>;
const SearchIcon = () => <span>🔍</span>;
const AdminIcon = () => <span>⚙️</span>; // Generic Admin
const UsersIcon = () => <span>👥</span>;
const EditReqIcon = () => <span>🔔</span>;


interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  const baseClasses = "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-150";
  const inactiveClasses = "text-neutral-300 hover:text-white hover:bg-primary-dark";
  const activeClasses = "bg-primary-dark text-white font-semibold shadow-inner"; // Active state style

  return (
    <NavLink
      to={to}
      end // Match exact path for active state (important for index routes)
      className={({ isActive }) =>
        `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
      }
    >
      <span className="mr-3 w-5 h-5">{icon}</span>
      {label}
    </NavLink>
  );
};


const Sidebar: React.FC = () => {
  const isAdmin = useAuthStore((state) => state.isAdmin);

  return (
    <aside className="w-64 bg-primary-dark text-white h-screen fixed top-16 left-0 shadow-lg flex flex-col"> {/* Adjusted for fixed Navbar */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* General Navigation */}
        <NavItem to="/dashboard" icon={<DashboardIcon />} label="Dashboard" />
        <NavItem to="/invoices" icon={<InvoiceIcon />} label="Invoices" />
        <NavItem to="/purchase-orders" icon={<PurchaseOrderIcon />} label="Purchase Orders" />
        <NavItem to="/stock-register" icon={<StockIcon />} label="Stock Register" />
        <NavItem to="/search" icon={<SearchIcon />} label="Search & Saved" />

        {/* Admin Only Navigation */}
        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-primary">
            <h3 className="px-4 mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
              Admin Tools
            </h3>
            <NavItem to="/admin/users" icon={<UsersIcon />} label="Manage Users" />
            <NavItem to="/admin/edit-requests" icon={<EditReqIcon />} label="Edit Requests" />
            {/* Add other admin links here */}
          </div>
        )}
      </div>

       {/* Optional Footer Area in Sidebar */}
        <div className="p-4 border-t border-primary text-center text-xs text-neutral-400">
           CNCC Portal © {new Date().getFullYear()}
        </div>
    </aside>
  );
};

export default Sidebar;