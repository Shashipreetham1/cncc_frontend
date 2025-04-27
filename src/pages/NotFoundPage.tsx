import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button'; // Import your Button component

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-neutral-700 mb-4">Page Not Found</h2>
      <p className="text-neutral-500 mb-8">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link to="/dashboard">
         <Button variant="primary" size="lg">
            Go to Dashboard
         </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;