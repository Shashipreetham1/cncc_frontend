import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode; // To render the routed page component
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 pt-16"> {/* Add padding-top equal to Navbar height */}
        <Sidebar />
        <main className="flex-1 p-6 ml-64 bg-neutral-100 overflow-y-auto"> {/* Add margin-left equal to Sidebar width */}
          {/* Page content is rendered here */}
          {children}
        </main>
      </div>
       {/* Optional Footer can go here if not in sidebar */}
    </div>
  );
};

export default Layout;