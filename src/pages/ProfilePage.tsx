import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

import { useAuthStore } from '../store/authStore';
import { fetchUserProfileApi, UserProfile } from '../features/auth/authApi'; // Import API call and enhanced type
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner'; // Import Spinner
import { ApiErrorResponse } from '../types'; // Import standard error type
import { formatDate } from '../lib/utils'; // Import date formatter

const ProfilePage: React.FC = () => {
  const storedUser = useAuthStore((state) => state.user); // User from login/storage
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching user profile...");
        const data = await fetchUserProfileApi();
        console.log("Profile data received:", data);
        setProfileData(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        let message = "Could not load profile information.";
         if (err instanceof AxiosError) {
            const apiError = err.response?.data as ApiErrorResponse;
            if (apiError?.message) message = apiError.message;
         }
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []); // Run only once on component mount

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">User Profile</h1>

      <Card title="Account Details">
        {isLoading ? (
            <div className="flex justify-center items-center py-10">
                <Spinner size="lg" />
                <span className="ml-3 text-neutral-500">Loading Profile...</span>
            </div>
        ) : error ? (
          <p className="text-center text-red-600 bg-red-100 p-4 rounded border border-red-300">{error}</p>
        ) : profileData ? (
          <dl className="divide-y divide-neutral-200">
            {/* Username */}
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 px-4">
              <dt className="text-sm font-medium text-neutral-500">Username</dt>
              <dd className="mt-1 text-sm text-neutral-900 sm:col-span-2 sm:mt-0 font-medium">{profileData.username}</dd>
            </div>
            {/* Role */}
             <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 px-4">
              <dt className="text-sm font-medium text-neutral-500">Role</dt>
              <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${profileData.role === 'ADMIN' ? 'bg-accent/80 text-white' : 'bg-neutral-200 text-neutral-800'}`}>
                      {profileData.role}
                  </span>
              </dd>
            </div>
            {/* User ID */}
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 px-4">
              <dt className="text-sm font-medium text-neutral-500">User ID</dt>
              <dd className="mt-1 text-sm text-neutral-600 sm:col-span-2 sm:mt-0">{profileData.id}</dd>
            </div>
            {/* Created At */}
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 px-4">
              <dt className="text-sm font-medium text-neutral-500">Member Since</dt>
              <dd className="mt-1 text-sm text-neutral-900 sm:col-span-2 sm:mt-0">{formatDate(profileData.createdAt)}</dd>
            </div>
             {/* Last Updated At */}
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 px-4">
              <dt className="text-sm font-medium text-neutral-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-neutral-900 sm:col-span-2 sm:mt-0">{formatDate(profileData.updatedAt)}</dd>
            </div>
            {/* Add more fields as needed */}
          </dl>
        ) : (
            // Fallback if loading finished but no profile (shouldn't happen if logged in)
            <p className="text-neutral-500 text-center py-10">Could not display profile information.</p>
        )}
      </Card>

       {/* Placeholder for other profile sections like "Change Password" */}
        {/* <Card title="Security">
             <p>(Change password form placeholder)</p>
        </Card> */}
    </div>
  );
};

export default ProfilePage;