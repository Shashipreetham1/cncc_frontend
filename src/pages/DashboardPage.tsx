import React from 'react';
import { useAuthStore } from '../store/authStore';
import Card from '../components/ui/Card'; // Import Card

const DashboardPage: React.FC = () => {
  const username = useAuthStore((state) => state.user?.username);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Dashboard</h1>

      <Card>
        <h2 className="text-xl font-semibold text-neutral-800 mb-3">Welcome!</h2>
        {username ? (
             <p className="text-neutral-600">
                 Hello, <span className="font-medium text-primary-dark">{username}</span>! Welcome back to the CNCC Portal.
            </p>
         ) : (
             <p className="text-neutral-600">Loading user information...</p>
         )}
         <p className="text-neutral-500 text-sm mt-2">
            Use the sidebar navigation to access different sections.
        </p>
      </Card>

      {/* Placeholder Cards for future content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="Recent Activity" className="animate-pulse bg-neutral-50">
                 <div className="h-24 rounded bg-neutral-200"></div> {/* Placeholder content */}
                 <p className="text-center text-neutral-400 mt-4 text-sm">Activity summary loading...</p>
            </Card>

            <Card title="Quick Stats" className="animate-pulse bg-neutral-50">
                <div className="h-24 rounded bg-neutral-200"></div> {/* Placeholder content */}
                <p className="text-center text-neutral-400 mt-4 text-sm">Statistics loading...</p>
            </Card>

            <Card title="Notifications / Tasks" className="animate-pulse bg-neutral-50">
                 <div className="h-24 rounded bg-neutral-200"></div> {/* Placeholder content */}
                 <p className="text-center text-neutral-400 mt-4 text-sm">Alerts loading...</p>
            </Card>
        </div>

      {/* Add more dashboard specific components here */}

    </div>
  );
};

export default DashboardPage;