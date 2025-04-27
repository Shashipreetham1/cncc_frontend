// src/pages/LoginPage.tsx
import React from 'react';
import LoginForm from '../features/auth/LoginForm'; // Import the form component

const LoginPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-100 to-neutral-200 px-4"> {/* Added a subtle gradient */}
       <div className="p-8 py-10 bg-white rounded-xl shadow-xl w-full max-w-md">
           {/* Optional: Logo Placeholder */}
           <div className="text-center mb-8">
                {/* Replace with your actual logo */}
                <span className="text-3xl font-bold text-primary tracking-tight">
                    {/* <img src="/path/to/logo.png" alt="CNCC Logo" className="h-10 mx-auto mb-2"/> */}
                     🏢 CNCC Portal
                </span>
                 <p className="text-neutral-500 text-sm mt-1">VNR Vignana Jyothi Institute of Engineering and Technology</p>
            </div>

            {/* Render the Login Form */}
            <LoginForm />

             {/* Optional: Links */}
             <div className="mt-6 text-center text-sm">
                {/* <a href="/forgot-password" className="font-medium text-primary hover:text-primary-dark">
                Forgot password?
                </a> */}
            </div>
      </div>
    </div>
  );
};

export default LoginPage;