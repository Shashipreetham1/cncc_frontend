import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

import { fetchPurchaseOrders, deletePurchaseOrder, requestPurchaseOrderEditPermission } from '../../features/purchaseOrders/purchaseOrderApi';
import { PurchaseOrder, PaginatedResponse, ApiErrorResponse } from '../../types';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../lib/utils';
import Modal from '../../components/ui/Modal';
import { useAuthStore } from '../../store/authStore';

// Icons (Replace with actual icon components)
const EditIcon = () => <span title="Edit">✏️</span>;
const DeleteIcon = () => <span title="Delete">🗑️</span>;
const ViewFileIcon = () => <span title="View File">👁️</span>;
const DownloadIcon = () => <span title="Download File">💾</span>;
const RequestEditIcon = () => <span title="Request Edit Permission">⏳</span>;

const PurchaseOrderListPage: React.FC = () => {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPOs, setTotalPOs] = useState(0);
    const [limit] = useState(10);

    // Delete Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [poToDelete, setPoToDelete] = useState<PurchaseOrder | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit Request
    const [isRequestingEdit, setIsRequestingEdit] = useState<string | null>(null);

    // Fetch Data Function
    const loadPOs = useCallback(async (page: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchPurchaseOrders(page, limit);
            setPurchaseOrders(data.results);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
            setTotalPOs(data.totalResults);
        } catch (err) {
            const message = err instanceof AxiosError ? (err.response?.data as ApiErrorResponse)?.message || 'Error fetching data' : 'An unexpected error occurred';
            setError(message);
            toast.error(`Failed to load purchase orders: ${message}`);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    // Initial Load
    useEffect(() => {
        loadPOs(1);
    }, [loadPOs]);

    // --- Handlers ---
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            loadPOs(newPage);
        }
    };

    const openDeleteModal = (po: PurchaseOrder) => {
        setPoToDelete(po);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setPoToDelete(null);
    };

    const confirmDelete = async () => {
        if (!poToDelete) return;
        setIsDeleting(true);
        try {
            await deletePurchaseOrder(poToDelete.id);
            toast.success(`Purchase Order ${poToDelete.purchaseOrderNumber} deleted!`);
            closeDeleteModal();
            loadPOs(currentPage); // Refresh list
        } catch (err) {
            const message = err instanceof AxiosError ? (err.response?.data as ApiErrorResponse)?.message || 'Deletion failed' : 'An error occurred';
            toast.error(`Delete failed: ${message}`);
            setIsDeleting(false);
        }
        // isLoading handled by loadPOs
    };

    const handleRequestEdit = async (po: PurchaseOrder) => {
        const reason = prompt(`Reason for requesting edit for PO#: ${po.purchaseOrderNumber}`);
        if (!reason) return toast.info("Edit request cancelled.");
        setIsRequestingEdit(po.id);
        try {
            const response = await requestPurchaseOrderEditPermission(po.id, reason);
            toast.success(response.message || "Edit request submitted!");
            // Could potentially update local PO state to reflect pending request
        } catch (err) {
            const message = err instanceof AxiosError ? (err.response?.data as ApiErrorResponse)?.message || 'Request failed' : 'An error occurred';
            toast.error(`Request failed: ${message}`);
        } finally {
            setIsRequestingEdit(null);
        }
    };

     // --- Permission Checks ---
    const canUserEdit = (po: PurchaseOrder): boolean => {
        if (!currentUser) return false;
        if (currentUser.role === 'ADMIN') return true;
        if (po.userId !== currentUser.id) return false;
        const now = new Date();
        const isWithinInitial = (now.getTime() - new Date(po.createdAt).getTime()) < (24 * 60 * 60 * 1000);
        const hasValidPermission = po.allowEditing && (!po.editableUntil || now < new Date(po.editableUntil));
        return isWithinInitial || hasValidPermission;
    };

    const shouldShowRequestEdit = (po: PurchaseOrder): boolean => {
        if (!currentUser || currentUser.role === 'ADMIN' || po.userId !== currentUser.id) return false;
        const now = new Date();
        const isWithinInitial = (now.getTime() - new Date(po.createdAt).getTime()) < (24 * 60 * 60 * 1000);
        const hasExpiredPermission = po.allowEditing && po.editableUntil && now >= new Date(po.editableUntil);
        return !isWithinInitial && (!po.allowEditing || hasExpiredPermission);
     };


    // --- Define Table Columns ---
    const columns = useMemo(() => [
        { header: 'PO ID', accessor: 'id', cellClassName: 'font-mono text-xs' },
        { header: 'PO Number', accessor: 'purchaseOrderNumber' },
        { header: 'Order Date', accessor: (item: PurchaseOrder) => formatDate(item.orderDate) },
        { header: 'Vendor', accessor: 'vendorName' },
        { header: 'Total Amount', accessor: (item: PurchaseOrder) => `₹${item.totalAmount?.toFixed(2)}`, cellClassName: 'text-right', headerClassName: 'text-right'},
        { header: 'Created By', accessor: (item: PurchaseOrder) => item.user?.username ?? 'N/A' },
        { header: 'File', accessor: (item: PurchaseOrder) => (
            item.purchaseOrderFileUrl ? (
                   <div className="flex space-x-2">
                       <a href={item.fullFileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark" title="View File"><ViewFileIcon /></a>
                       <a href={item.fullFileUrl} download={`${item.purchaseOrderNumber}.pdf`} className="text-neutral-600 hover:text-neutral-900" title="Download File"><DownloadIcon /></a>
                    </div>
               ) : (
                   <span className="text-neutral-400 italic text-xs">None</span>
               )
           ),
            cellClassName: 'text-center', headerClassName: 'text-center'
        },
        { header: 'Actions', accessor: (item: PurchaseOrder) => (
             <div className="flex items-center justify-end space-x-2">
                 {canUserEdit(item) ? (
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/purchase-orders/edit/${item.id}`)} title="Edit PO"><EditIcon /></Button>
                 ) : shouldShowRequestEdit(item) ? (
                     <Button variant="outline" size="icon" onClick={() => handleRequestEdit(item)} title="Request Edit" isLoading={isRequestingEdit === item.id} disabled={isRequestingEdit === item.id}><RequestEditIcon /></Button>
                 ) : (
                     <div className='w-8 h-8'></div>
                 )}
                <Button variant="ghost" size="icon" onClick={() => openDeleteModal(item)} title="Delete PO" className="text-red-600 hover:bg-red-100 disabled:text-red-300" disabled={isDeleting && poToDelete?.id === item.id}>
                   {isDeleting && poToDelete?.id === item.id ? <Spinner size="sm"/> : <DeleteIcon />}
                </Button>
            </div>
        )},
    ], [navigate, isDeleting, poToDelete, isRequestingEdit, currentUser]);


    return (
         <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Purchase Orders</h1>
                 <Link to="/purchase-orders/new">
                    <Button variant="primary" size="md">Add New Purchase Order</Button>
                 </Link>
            </div>

             {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded border border-red-300">{error}</p>}

            <Table<PurchaseOrder>
                columns={columns}
                data={purchaseOrders}
                isLoading={isLoading}
                emptyMessage="No purchase orders found."
            />

             {/* Pagination */}
             <div className="flex justify-center items-center space-x-2 mt-6">
                 <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || isLoading} variant="outline" size="sm">Previous</Button>
                 <span className="text-sm text-neutral-600">Page {currentPage} of {totalPages} (Total: {totalPOs})</span>
                 <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages || isLoading} variant="outline" size="sm">Next</Button>
             </div>

              {/* Delete Modal */}
              <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title={`Delete PO ${poToDelete?.purchaseOrderNumber || ''}?`}>
                    <p className="text-sm text-neutral-600 mb-4">Are you sure? This will permanently delete the Purchase Order and its associated items.</p>
                    {/* Display some PO info */}
                    <p>Vendor: <strong>{poToDelete?.vendorName}</strong></p>
                    <div className="mt-6 flex justify-end space-x-3">
                         <Button variant="ghost" onClick={closeDeleteModal} disabled={isDeleting}>Cancel</Button>
                         <Button variant="danger" onClick={confirmDelete} isLoading={isDeleting} loadingText="Deleting...">Delete PO</Button>
                    </div>
                </Modal>
        </div>
    );
};

export default PurchaseOrderListPage;