import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode; // Represents the routed page component
}

/**
 * Main application layout component.
 * Provides the Navbar, Sidebar, and the main content area
 * for authenticated user routes.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-100"> {/* Ensure background color */}
      {/* Navbar is fixed at the top */}
      <Navbar />

      {/* Container for Sidebar and Main Content */}
      {/* pt-16 pushes content below the fixed navbar (h-16) */}
      <div className="flex flex-1 pt-16">

        {/* Sidebar is fixed on the left */}
        <Sidebar />

        {/* Main Content Area */}
        {/* ml-64 creates space for the fixed sidebar (w-64) */}
        {/* overflow-y-auto allows content to scroll independently */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 ml-64 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full"> {/* Optional: Constrain content width */}
             {/* Render the active page component passed as children */}
             {children}
          </div>
        </main>

      </div>
       {/* Optional Footer for the entire page could go here */}
       {/* <footer className="ml-64 p-4 text-center text-sm text-neutral-500">
           My Footer
       </footer> */}
    </div>
  );
};

export default Layout;