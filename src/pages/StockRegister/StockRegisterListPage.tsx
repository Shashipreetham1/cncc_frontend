import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

import { fetchStockEntries, deleteStockEntry, requestStockEditPermission } from '../../features/stockRegister/stockRegisterApi';
import { StockRegister, PaginatedResponse, ApiErrorResponse } from '../../types';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../lib/utils';
import Modal from '../../components/ui/Modal';
import { useAuthStore } from '../../store/authStore';

// Icons
const EditIcon = () => <span title="Edit">✏️</span>;
const DeleteIcon = () => <span title="Delete">🗑️</span>;
const ViewFileIcon = () => <span title="View Photo">👁️</span>; // Changed title for photo
const DownloadIcon = () => <span title="Download Photo">💾</span>;
const RequestEditIcon = () => <span title="Request Edit Permission">⏳</span>;

const StockRegisterListPage: React.FC = () => {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    const [stockEntries, setStockEntries] = useState<StockRegister[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0);
    const [limit] = useState(10);

    // Delete Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<StockRegister | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit Request
    const [isRequestingEdit, setIsRequestingEdit] = useState<string | null>(null);

    // Fetch Data
    const loadStockEntries = useCallback(async (page: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchStockEntries(page, limit);
            setStockEntries(data.results);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
            setTotalEntries(data.totalResults);
        } catch (err) {
            const message = err instanceof AxiosError ? (err.response?.data as ApiErrorResponse)?.message || 'Error fetching data' : 'An error occurred';
            setError(message);
            toast.error(`Failed to load stock entries: ${message}`);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    // Initial Load
    useEffect(() => {
        loadStockEntries(1);
    }, [loadStockEntries]);

    // --- Handlers ---
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            loadStockEntries(newPage);
        }
    };

    const openDeleteModal = (entry: StockRegister) => {
        setEntryToDelete(entry);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setEntryToDelete(null);
    };

    const confirmDelete = async () => {
        if (!entryToDelete) return;
        setIsDeleting(true);
        try {
            await deleteStockEntry(entryToDelete.id);
            toast.success(`Stock Entry ${entryToDelete.id} deleted!`);
            closeDeleteModal();
            loadStockEntries(currentPage);
        } catch (err) {
            const message = err instanceof AxiosError ? (err.response?.data as ApiErrorResponse)?.message || 'Deletion failed' : 'An error occurred';
            toast.error(`Delete failed: ${message}`);
        } finally {
            setIsDeleting(false);
        }
    };

     const handleRequestEdit = async (entry: StockRegister) => {
        const reason = prompt(`Reason for requesting edit for Entry ID: ${entry.id}`);
        if (!reason) return toast.info("Edit request cancelled.");
        setIsRequestingEdit(entry.id);
        try {
            const response = await requestStockEditPermission(entry.id, reason);
            toast.success(response.message || "Edit request submitted!");
        } catch (err) {
            const message = err instanceof AxiosError ? (err.response?.data as ApiErrorResponse)?.message || 'Request failed' : 'An error occurred';
            toast.error(`Request failed: ${message}`);
        } finally {
            setIsRequestingEdit(null);
        }
    };

    // --- Permission Checks ---
    const canUserEdit = (entry: StockRegister): boolean => {
        if (!currentUser) return false;
        if (currentUser.role === 'ADMIN') return true;
        if (entry.userId !== currentUser.id) return false;
        const now = new Date();
        const isWithinInitial = (now.getTime() - new Date(entry.createdAt).getTime()) < (24 * 60 * 60 * 1000);
        const hasValidPermission = entry.allowEditing && (!entry.editableUntil || now < new Date(entry.editableUntil));
        return isWithinInitial || hasValidPermission;
    };

     const shouldShowRequestEdit = (entry: StockRegister): boolean => {
         if (!currentUser || currentUser.role === 'ADMIN' || entry.userId !== currentUser.id) return false;
        const now = new Date();
        const isWithinInitial = (now.getTime() - new Date(entry.createdAt).getTime()) < (24 * 60 * 60 * 1000);
        const hasExpiredPermission = entry.allowEditing && entry.editableUntil && now >= new Date(entry.editableUntil);
        return !isWithinInitial && (!Boolean(entry.allowEditing) || hasExpiredPermission);
     };

    // --- Table Columns ---
    const columns = useMemo(() => [
        { header: 'Entry ID', accessor: 'id', cellClassName: 'font-mono text-xs' },
        { header: 'Article Name', accessor: 'articleName', className: 'min-w-[180px]' },
        { header: 'Entry Date', accessor: (item: StockRegister) => formatDate(item.entryDate) },
        { header: 'Billing Date', accessor: (item: StockRegister) => formatDate(item.billingDate) },
        { header: 'Voucher/Bill #', accessor: 'voucherOrBillNumber'},
        { header: 'Total Rate', accessor: (item: StockRegister) => `₹${item.totalRate?.toFixed(2)}`, cellClassName: 'text-right', headerClassName: 'text-right'},
        { header: 'Created By', accessor: (item: StockRegister) => item.user?.username ?? 'N/A' },
        { header: 'Photo', accessor: (item: StockRegister) => (
            item.photoUrl ? (
                <div className="flex space-x-2 justify-center">
                   {/* View Photo might open in modal later */}
                   <a href={item.fullFileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark" title="View Photo"><ViewFileIcon /></a>
                   <a href={item.fullFileUrl} download={`${item.id}_photo.jpg`} className="text-neutral-600 hover:text-neutral-900" title="Download Photo"><DownloadIcon /></a>
                 </div>
            ) : (
                 <span className="text-neutral-400 italic text-xs">None</span>
             )
            ),
           cellClassName: 'text-center', headerClassName: 'text-center'
        },
        { header: 'Actions', accessor: (item: StockRegister) => (
             <div className="flex items-center justify-end space-x-2">
                {canUserEdit(item) ? (
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/stock-register/edit/${item.id}`)} title="Edit Entry"><EditIcon /></Button>
                ) : shouldShowRequestEdit(item) ? (
                     <Button variant="outline" size="icon" onClick={() => handleRequestEdit(item)} title="Request Edit" isLoading={isRequestingEdit === item.id} disabled={isRequestingEdit === item.id}><RequestEditIcon /></Button>
                ) : (
                     <div className='w-8 h-8'></div> // Spacer
                 )}
                <Button variant="ghost" size="icon" onClick={() => openDeleteModal(item)} title="Delete Entry" className="text-red-600 hover:bg-red-100 disabled:text-red-300" disabled={isDeleting && entryToDelete?.id === item.id}>
                     {isDeleting && entryToDelete?.id === item.id ? <Spinner size="sm"/> : <DeleteIcon />}
                </Button>
            </div>
        ), cellClassName: 'text-right', headerClassName: 'text-right' },
    ], [navigate, isDeleting, entryToDelete, isRequestingEdit, currentUser]);

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Stock Register</h1>
                 <Link to="/stock-register/new">
                     <Button variant="primary" size="md">Add New Entry</Button>
                 </Link>
            </div>

            {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded border border-red-300">{error}</p>}

            <Table<StockRegister>
                columns={columns}
                data={stockEntries}
                isLoading={isLoading}
                emptyMessage="No stock entries found."
                loadingRowCount={5} // Adjust skeleton rows if needed
            />

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-2 mt-6">
                <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || isLoading} variant="outline" size="sm">Previous</Button>
                 <span className="text-sm text-neutral-600">Page {currentPage} of {totalPages} (Total: {totalEntries})</span>
                <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages || isLoading} variant="outline" size="sm">Next</Button>
            </div>

            {/* Delete Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title={`Delete Stock Entry ${entryToDelete?.id || ''}?`}>
                 <p className="text-sm text-neutral-600 mb-4">Are you sure you want to permanently delete this stock register entry? This action cannot be undone.</p>
                <p>Article: <strong>{entryToDelete?.articleName}</strong></p>
                <div className="mt-6 flex justify-end space-x-3">
                    <Button variant="ghost" onClick={closeDeleteModal} disabled={isDeleting}>Cancel</Button>
                    <Button variant="danger" onClick={confirmDelete} isLoading={isDeleting} loadingText="Deleting...">Delete Entry</Button>
                 </div>
            </Modal>
        </div>
    );
};

export default StockRegisterListPage;