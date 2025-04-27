import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios'; // Import AxiosError type

import { loginSchema, LoginFormInputs } from './loginSchema'; // Import schema and type
import { loginUserApi } from './authApi'; // Import API call function
import { useAuthStore } from '../../store/authStore'; // Import Zustand store hook
import Input from '../../components/ui/Input'; // Import custom Input component
import Button from '../../components/ui/Button'; // Import custom Button component
import { ApiErrorResponse } from '../../types'; // Import shared API error type

const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  // Get the login action from the Zustand store
  const zustandLoginAction = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to redirect after successful login
  const from = (location.state as any)?.from?.pathname || '/dashboard'; // Default to dashboard

  // Setup React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError, // Function to manually set form errors from API response
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema), // Use Zod schema for validation
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true); // Start loading indicator
    console.log('Login form submitted:', data.username); // Log username, not password

    try {
      // Call the API function
      const response = await loginUserApi({
          username: data.username,
          password: data.password // Password needed here
        });

      // --- Success ---
      toast.success(`Welcome back, ${response.username}!`);
      console.log('Login successful:', response);

      // Update Zustand store with token and user info
      zustandLoginAction(response.token, {
        id: response.id,
        username: response.username,
        role: response.role,
      });

      // Redirect to the intended page or dashboard
       console.log(`Redirecting to: ${from}`);
      navigate(from, { replace: true }); // replace: true avoids login page in history

    } catch (error) {
      // --- Error Handling ---
      console.error('Login failed:', error);
      setIsLoading(false); // Stop loading indicator

      let errorMessage = 'Login failed. Please check your credentials or try again later.'; // Default

       if (error instanceof AxiosError) {
            const apiError = error.response?.data as ApiErrorResponse;
            // Use specific message from backend if available
            if (apiError?.message) {
                errorMessage = apiError.message;
                // Optionally, set specific field errors if backend provides them
                // For login, usually a generic error on the password/username field or top-level
                 setError('password', { type: 'manual', message: errorMessage});
            } else if (error.response?.status === 401 || error.response?.status === 400) {
                errorMessage = 'Invalid username or password.'; // More user-friendly for 401/400
                setError('password', { type: 'manual', message: errorMessage }); // Attach error to password field
            } else if (error.code === 'ECONNABORTED') {
                 errorMessage = 'Login request timed out. Please check your connection.';
            } else if (!error.response) {
                 errorMessage = 'Network error. Cannot reach the server.';
            }
        }
        // Display error using react-toastify
       toast.error(errorMessage);

    } // finally block isn't strictly needed if loading is set in catch
      // finally {
      //     setIsLoading(false);
      // }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate> {/* noValidate prevents browser validation */}
        <div className="space-y-4">
           <Input
                id="username"
                label="Username"
                type="text"
                autoComplete="username"
                error={errors.username?.message}
                disabled={isLoading}
                {...register('username')} // Register input with RHF
           />
           <Input
                id="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                error={errors.password?.message}
                disabled={isLoading}
                {...register('password')} // Register input with RHF
            />
        </div>

      {/* TODO: Add 'Remember Me' checkbox if needed */}
      {/* TODO: Add 'Forgot Password' link if implemented */}

      <div className="mt-6">
        <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full" // Make button full width
            isLoading={isLoading}
            loadingText="Logging In..."
            disabled={isLoading}
        >
            Sign In
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;