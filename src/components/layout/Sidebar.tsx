import React from 'react';
// Remove useLocation if isLinkActive is removed
// import { NavLink, useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom'; // Keep NavLink
import { useAuthStore } from '../../store/authStore';

// --- Keep Icons definition ---
const icons = {
  dashboard: "📊", invoice: "📄", purchaseOrder: "🛒", stock: "📦",
  search: "🔍", users: "👥", editRequests: "🔔", admin: "⚙️"
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

// --- Keep NavItem component ---
const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  const baseClasses = "flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md group transition-colors duration-150";
  const inactiveClasses = "text-neutral-300 hover:text-white hover:bg-primary";
  const activeClasses = "bg-primary text-white font-semibold shadow-inner";

  return (
    <NavLink
      to={to}
      end // Use 'end' prop for exact path matching
      className={({ isActive }) =>
        `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
      }
    >
      <span className="mr-3 flex-shrink-0 h-5 w-5 opacity-80 group-hover:opacity-100 transition-opacity">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};


const Sidebar: React.FC = () => {
  const isAdmin = useAuthStore((state) => state.isAdmin);
  // const location = useLocation(); // REMOVED - Not needed currently

  // REMOVED - Unused helper function
  // const isLinkActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside className="fixed top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-primary-dark text-white flex flex-col shadow-lg">
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* General Navigation */}
        <NavItem to="/dashboard" icon={icons.dashboard} label="Dashboard" />
        <NavItem to="/invoices" icon={icons.invoice} label="Invoices" />
        <NavItem to="/purchase-orders" icon={icons.purchaseOrder} label="Purchase Orders" />
        <NavItem to="/stock-register" icon={icons.stock} label="Stock Register" />
        <NavItem to="/search" icon={icons.search} label="Search & Saved" />

        {/* Conditional Admin Section */}
        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-white/10">
             <h3 className="px-3 mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase flex items-center">
                  <span className="mr-2">{icons.admin}</span>
                   Admin Tools
              </h3>
             <NavItem to="/admin/users" icon={icons.users} label="Manage Users" />
             <NavItem to="/admin/edit-requests" icon={icons.editRequests} label="Edit Requests" />
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-white/10 text-center text-xs text-neutral-400">
         App Version 1.0.0
      </div>
    </aside>
  );
};

export default Sidebar;