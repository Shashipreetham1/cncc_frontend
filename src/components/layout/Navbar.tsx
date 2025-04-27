import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { disconnectSocket } from '../../lib/socket'; // Import disconnect function

const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore((state) => ({
    user: state.user,
    logout: state.logout,
  }));
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Logout button clicked');
    // Disconnect socket *before* clearing auth state
    disconnectSocket();
    // Clear auth state in Zustand store (which also clears localStorage via persist)
    logout();
    // Redirect to login page
    navigate('/login');
    // Optionally show a logout success message
    // toast.success("Logged out successfully"); // If using react-toastify
  };

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        {/* Left Side: Logo/Title */}
        <Link to="/dashboard" className="text-xl font-bold hover:text-primary-light transition-colors">
          CNCC Portal {/* Replace with Logo if available */}
        </Link>

        {/* Right Side: User Info & Logout */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm hidden sm:inline">
                Welcome, <span className="font-semibold">{user.username}</span> ({user.role})
              </span>
              {/* Profile Link (Optional) */}
               <Link
                    to="/profile"
                    title="View Profile"
                    className="p-2 rounded hover:bg-primary-dark transition-colors"
                >
                   {/* Add a User Icon here maybe */} 👤
               </Link>
              <button
                onClick={handleLogout}
                className="bg-secondary hover:bg-secondary-dark text-white text-sm font-medium py-1 px-3 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-light focus:ring-opacity-75"
              >
                Logout
              </button>
            </>
          ) : (
            // Optional: Show login link if Navbar is ever rendered when logged out
             <Link to="/login" className="text-sm hover:text-primary-light">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;