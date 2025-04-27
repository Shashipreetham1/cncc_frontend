import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

import { fetchAllUsers, promoteUserToAdmin, registerUserApiAdmin } from '../../features/admin/adminApi';
import { PaginatedResponse, ApiErrorResponse, Role } from '../../types';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal'; // If using modal for registration
import Input from '../../components/ui/Input'; // If using modal for registration
import { useForm } from 'react-hook-form'; // If using modal for registration
// Optional: Add zod schema for register form
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';

// Icons
const PromoteIcon = () => <span title="Promote to Admin">👑</span>;
// Existing exports in the file

type User = {
    id: string;
    username: string;
    role: Role;
    createdAt: string;
};
const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPromoting, setIsPromoting] = useState<string | null>(null); // Store ID of user being promoted

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [limit] = useState(15); // Show more users per page?

    // TODO: Add state and handlers for Register New User modal if implementing here

    // Fetch Users Function
    const loadUsers = useCallback(async (page: number) => {
        setIsLoading(true);
        setError(null);
        try {
            // Sort by role then username for easier viewing
            const data = await fetchAllUsers(page, limit, 'role', 'asc');
            setUsers(data.users || data.results || []); // Adjust key based on actual backend response
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
            setTotalUsers(data.totalUsers || data.totalResults || 0);
        } catch (err) {
            const message = err instanceof AxiosError ? (err.response?.data as ApiErrorResponse)?.message || 'Error fetching data' : 'An error occurred';
            setError(message);
            toast.error(`Failed to load users: ${message}`);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    // Initial Load
    useEffect(() => {
        loadUsers(1);
    }, [loadUsers]);

    // --- Handlers ---
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            loadUsers(newPage);
        }
    };

    const handlePromoteUser = async (userId: string, username: string) => {
        if (isPromoting) return; // Prevent double clicks

        if (!window.confirm(`Are you sure you want to promote user "${username}" to ADMIN? This grants full privileges.`)) {
             return;
        }

        setIsPromoting(userId);
        try {
            const result = await promoteUserToAdmin(userId);
            toast.success(result.message || `User ${username} promoted successfully!`);
            // Option 1: Refetch the current page to show updated role
            loadUsers(currentPage);
            // Option 2: Update local state directly (faster UI, slightly more complex)
            // setUsers(currentUsers => currentUsers.map(u => u.id === userId ? { ...u, role: 'ADMIN' } : u));
        } catch (err) {
             const message = err instanceof AxiosError ? (err.response?.data as ApiErrorResponse)?.message || 'Promotion failed' : 'An error occurred';
             toast.error(`Failed to promote ${username}: ${message}`);
        } finally {
            setIsPromoting(null);
        }
    };

     // TODO: Handler for opening/submitting the Register User Modal


    // --- Table Columns ---
    const columns = useMemo(() => [
        { header: 'ID', accessor: 'id', cellClassName: 'font-mono text-xs w-1/4 truncate' },
        { header: 'Username', accessor: 'username', cellClassName:'font-medium'},
        { header: 'Role', accessor: (item: User) => (
            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${item.role === 'ADMIN' ? 'bg-accent/80 text-white' : 'bg-neutral-200 text-neutral-800'}`}>
                {item.role}
            </span>
         )},
        { header: 'Member Since', accessor: (item: User) => formatDate(item.createdAt)},
        { header: 'Actions', accessor: (item: User) => (
            <div className="flex items-center justify-end space-x-2">
               {item.role !== 'ADMIN' && ( // Only show promote button for non-admins
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePromoteUser(item.id, item.username)}
                        isLoading={isPromoting === item.id}
                        loadingText='Promoting...'
                        disabled={!!isPromoting} // Disable all promote buttons while one is in progress
                        leftIcon={<PromoteIcon />}
                     >
                         Promote
                    </Button>
               )}
               {item.role === 'ADMIN' && (
                   <span className='text-xs text-neutral-400 italic pr-2'>Admin</span>
               )}
               {/* Add Delete User button/logic if needed */}
           </div>
        )},
    ], [isPromoting, handlePromoteUser]); // Add handlePromoteUser to dependencies

    return (
         <div className="space-y-6">
             <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-bold text-primary">Manage Users</h1>
                  {/* TODO: Add Button to open Register User Modal */}
                 {/* <Button variant="primary" onClick={openRegisterModal}>Register New User</Button> */}
            </div>

            {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded border border-red-300">{error}</p>}

            <Table<User> // Make sure User type has 'id'
                columns={columns}
                data={users}
                isLoading={isLoading}
                emptyMessage="No users found."
            />

             {/* Pagination */}
             {!isLoading && totalPages > 1 && (
                 <div className="flex justify-center items-center space-x-2 mt-6">
                     <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} variant="outline" size="sm">Previous</Button>
                     <span className="text-sm text-neutral-600">Page {currentPage} of {totalPages} (Total: {totalUsers})</span>
                    <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} variant="outline" size="sm">Next</Button>
                 </div>
            )}

             {/* TODO: Add Register New User Modal here */}
             {/* <Modal isOpen={isRegisterModalOpen} onClose={closeRegisterModal} title="Register New User">
                 <RegisterUserForm onSuccess={handleRegisterSuccess} onCancel={closeRegisterModal} />
             </Modal> */}

        </div>
    );
};

export default AdminUsersPage;