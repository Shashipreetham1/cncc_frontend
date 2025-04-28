import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { disconnectSocket } from '../../lib/socket';

// Example simple User icon (replace with a proper icon library like react-icons)
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);
// Example simple Logout icon
const LogoutIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
         <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
     </svg>
);


const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore((state) => ({
    user: state.user,
    logout: state.logout,
  }));
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Triggering logout process...');
    disconnectSocket(); // Disconnect socket first
    logout();           // Clear auth state
    navigate('/login'); // Redirect
    // Consider adding toast confirmation on the login page after redirect if needed
  };

  return (
    // Use fixed positioning to keep navbar at the top
    <nav className="fixed top-0 left-0 right-0 z-40 h-16 bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 h-full flex justify-between items-center">
        {/* Left Side: Logo/Title */}
        <Link to={user ? "/dashboard" : "/login"} className="text-xl font-bold hover:opacity-80 transition-opacity flex items-center">
            {/* Placeholder for a potential logo */}
            {/* <img src="/path/to/logo.png" alt="Logo" className="h-8 mr-2" /> */}
             <span className='text-2xl mr-2'>🏢</span> {/* Simple placeholder */}
             <span>CNCC Portal</span>
        </Link>

        {/* Right Side: User Info & Logout */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {user ? (
            <>
              <span className="text-sm hidden md:inline">
                 <span className='opacity-80'>Welcome, </span>
                 <span className="font-semibold">{user.username}</span>
                 <span className={`ml-2 px-2 py-0.5 text-xs rounded font-medium ${user.role === 'ADMIN' ? 'bg-accent text-white' : 'bg-white/20'}`}>
                     {user.role}
                 </span>
              </span>
               <Link
                    to="/profile"
                    title="View Profile"
                    className="p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white"
               >
                    <UserIcon />
               </Link>
              <button
                onClick={handleLogout}
                 title="Logout"
                className="flex items-center space-x-1 bg-secondary hover:bg-secondary-dark text-white text-sm font-medium py-1.5 px-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-light focus:ring-opacity-75"
              >
                 <LogoutIcon />
                 <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
             <Link to="/login" className="text-sm font-medium hover:opacity-80">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;