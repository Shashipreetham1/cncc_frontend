import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

import { fetchInvoices, deleteInvoice, requestInvoiceEditPermission } from '../../features/invoices/invoiceApi';
import { Invoice, PaginatedResponse, ApiErrorResponse } from '../../types'; // Import your types
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../lib/utils';
import Modal from '../../components/ui/Modal'; // For delete confirmation
import { useAuthStore } from '../../store/authStore'; // To check roles

// Icons (replace with actual icons from a library like react-icons)
const EditIcon = () => <span title="Edit">✏️</span>;
const DeleteIcon = () => <span title="Delete">🗑️</span>;
const ViewFileIcon = () => <span title="View File">👁️</span>;
const DownloadIcon = () => <span title="Download File">💾</span>;
const RequestEditIcon = () => <span title="Request Edit Permission">⏳</span>;

const InvoiceListPage: React.FC = () => {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalInvoices, setTotalInvoices] = useState(0);
    const [limit] = useState(10); // Items per page

    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

     // Edit Request State
    const [isRequestingEdit, setIsRequestingEdit] = useState<string | null>(null); // Store ID being requested

    // Fetch Invoices Function
    const loadInvoices = useCallback(async (page: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchInvoices(page, limit);
            setInvoices(data.results);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
            setTotalInvoices(data.totalResults);
        } catch (err) {
            console.error("Failed to fetch invoices:", err);
            const message = err instanceof AxiosError
                           ? (err.response?.data as ApiErrorResponse)?.message || 'Error fetching data'
                           : 'An unexpected error occurred';
            setError(message);
            toast.error(`Failed to load invoices: ${message}`);
        } finally {
            setIsLoading(false);
        }
    }, [limit]); // Dependency on limit

    // Initial Load
    useEffect(() => {
        loadInvoices(1); // Load first page on mount
    }, [loadInvoices]);

    // --- Handlers ---
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            loadInvoices(newPage);
        }
    };

    const openDeleteModal = (invoice: Invoice) => {
        setInvoiceToDelete(invoice);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setInvoiceToDelete(null);
    };

    const confirmDelete = async () => {
        if (!invoiceToDelete) return;
        setIsDeleting(true);
        try {
            await deleteInvoice(invoiceToDelete.id);
            toast.success(`Invoice ${invoiceToDelete.id} deleted successfully!`);
            closeDeleteModal();
            // Refresh the current page data
            loadInvoices(currentPage);
        } catch (err) {
             const message = err instanceof AxiosError
                           ? (err.response?.data as ApiErrorResponse)?.message || 'Deletion failed'
                           : 'An unexpected error occurred';
            toast.error(`Failed to delete invoice: ${message}`);
            setIsDeleting(false); // Ensure loading state is reset on error
        }
         // setIsLoading is handled by the loadInvoices call indirectly if successful
    };

    const handleRequestEdit = async (invoice: Invoice) => {
        // Simple prompt for reason - replace with a modal form for better UX
        const reason = prompt(`Please provide a reason for requesting edit access for Invoice ID: ${invoice.id}`);
        if (!reason || reason.trim() === '') {
            toast.info("Edit request cancelled.");
            return;
        }

        setIsRequestingEdit(invoice.id);
        try {
            const response = await requestInvoiceEditPermission(invoice.id, reason);
            toast.success(response.message || "Edit request submitted successfully!");
             // Optionally update local state or refetch to reflect pending status?
             // For simplicity, we'll just show success for now.
        } catch (err) {
             const message = err instanceof AxiosError
                           ? (err.response?.data as ApiErrorResponse)?.message || 'Request failed'
                           : 'An unexpected error occurred';
             toast.error(`Failed to submit edit request: ${message}`);
        } finally {
             setIsRequestingEdit(null);
        }
    };

     // --- Utility Functions ---
     const canUserEdit = (invoice: Invoice): boolean => {
        if (!currentUser) return false;
        if (currentUser.role === 'ADMIN') return true;
        if (invoice.userId !== currentUser.id) return false; // Must be owner if not admin

        const now = new Date();
        const initialWindowMs = 24 * 60 * 60 * 1000; // 24 hours
        const createdAt = new Date(invoice.createdAt);
        const isWithinInitialWindow = (now.getTime() - createdAt.getTime()) < initialWindowMs;

        const hasValidAdminPermission = invoice.allowEditing && (!invoice.editableUntil || now < new Date(invoice.editableUntil));

        return isWithinInitialWindow || hasValidAdminPermission;
    };

     const shouldShowRequestEdit = (invoice: Invoice): boolean => {
        if (!currentUser || currentUser.role === 'ADMIN' || invoice.userId !== currentUser.id) {
            return false; // Only non-admin owners can request
        }
        const now = new Date();
        const initialWindowMs = 24 * 60 * 60 * 1000; // 24 hours
        const createdAt = new Date(invoice.createdAt);
        const isWithinInitialWindow = (now.getTime() - createdAt.getTime()) < initialWindowMs;

        const hasExpiredPermission = invoice.allowEditing && invoice.editableUntil && now >= new Date(invoice.editableUntil);
        const needsPermission = !isWithinInitialWindow && !invoice.allowEditing;

        // Show if initial window passed AND (they don't have permission OR their permission expired)
        return !isWithinInitialWindow && (!invoice.allowEditing || hasExpiredPermission);
        // Alternative logic based on backend canEdit response: `apiErrorResponse?.needsPermissionRequest`
     };


    // --- Define Table Columns ---
    // useMemo helps prevent unnecessary re-renders of the table structure
    const columns = useMemo(() => [
        { header: 'Inv. ID', accessor: 'id', cellClassName: 'font-mono text-xs', headerClassName:'whitespace-nowrap'},
        { header: 'Purchase Date', accessor: (item: Invoice) => formatDate(item.purchaseDate) },
        { header: 'Company', accessor: 'companyName', className: 'min-w-[150px]'},
        { header: 'Vendor', accessor: 'vendorName', className: 'min-w-[150px]'},
        { header: 'Total Amount', accessor: (item: Invoice) => `₹${item.totalAmount?.toFixed(2)}`, cellClassName: 'text-right', headerClassName: 'text-right'},
         { header: 'Created By', accessor: (item: Invoice) => item.user?.username ?? 'N/A' },
        { header: 'File', accessor: (item: Invoice) => (
             item.invoiceFileUrl ? (
                    <div className="flex space-x-2">
                       <a href={item.fullFileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark" title="View File">
                            <ViewFileIcon />
                        </a>
                        <a href={item.fullFileUrl} download={`${item.id}_invoice.pdf`} className="text-neutral-600 hover:text-neutral-900" title="Download File">
                            {/* Suggest a filename */}
                           <DownloadIcon />
                        </a>
                    </div>
                ) : (
                     <span className="text-neutral-400 italic text-xs">None</span>
                )
            ),
           cellClassName: 'text-center', headerClassName: 'text-center'
        },
        { header: 'Actions', accessor: (item: Invoice) => (
            <div className="flex items-center justify-end space-x-2">
                 {/* View Details Button/Link (if a separate details page exists) */}
                {/* <Link to={`/invoices/${item.id}`}><button>View</button></Link> */}

                {/* Edit Button */}
                {canUserEdit(item) ? (
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/invoices/edit/${item.id}`)} title="Edit Invoice">
                        <EditIcon />
                    </Button>
                 ) : shouldShowRequestEdit(item) ? (
                    // Request Edit Button
                     <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRequestEdit(item)}
                        title="Request Edit Permission"
                        isLoading={isRequestingEdit === item.id}
                        disabled={isRequestingEdit === item.id}
                     >
                       <RequestEditIcon />
                     </Button>
                 ) : (
                      // Indicate non-editable state? Optional placeholder.
                      <div className='w-8 h-8'></div> // Keep spacing consistent
                 )}

                {/* Delete Button */}
                 <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteModal(item)}
                    title="Delete Invoice"
                    className="text-red-600 hover:bg-red-100 disabled:text-red-300"
                     disabled={isDeleting && invoiceToDelete?.id === item.id} // Disable while this one is deleting
                 >
                     {isDeleting && invoiceToDelete?.id === item.id ? <Spinner size="sm" /> : <DeleteIcon />}
                 </Button>
            </div>
         ), cellClassName: 'text-right', headerClassName: 'text-right'},
    // Add more columns as needed
    ], [navigate, isDeleting, invoiceToDelete, isRequestingEdit, currentUser]); // Include dependencies used in accessor functions


    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Invoices</h1>
                 <Link to="/invoices/new">
                    <Button variant="primary" size="md">
                        Add New Invoice
                    </Button>
                 </Link>
            </div>

            {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded border border-red-300">{error}</p>}

             <Table<Invoice>
                columns={columns}
                data={invoices}
                isLoading={isLoading}
                emptyMessage="No invoices found."
             />

            {/* Pagination Controls */}
            <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isLoading}
                    variant="outline"
                    size="sm"
                >
                    Previous
                </Button>
                 <span className="text-sm text-neutral-600">
                    Page {currentPage} of {totalPages} (Total: {totalInvoices})
                </span>
                 <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isLoading}
                    variant="outline"
                    size="sm"
                 >
                    Next
                 </Button>
             </div>

            {/* Delete Confirmation Modal */}
             <Modal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                title={`Delete Invoice ${invoiceToDelete?.id || ''}?`}
                size="md"
             >
                 <p className="text-sm text-neutral-600 mb-4">
                    Are you sure you want to permanently delete this invoice? This action cannot be undone. Associated products will also be deleted.
                </p>
                {/* Optional: Show invoice details here? */}
                 <p>Company: <strong>{invoiceToDelete?.companyName}</strong></p>
                <p>Vendor: <strong>{invoiceToDelete?.vendorName}</strong></p>

                <div className="mt-6 flex justify-end space-x-3">
                     <Button variant="ghost" onClick={closeDeleteModal} disabled={isDeleting}>Cancel</Button>
                    <Button
                         variant="danger"
                        onClick={confirmDelete}
                         isLoading={isDeleting}
                         loadingText="Deleting..."
                     >
                        Delete Invoice
                     </Button>
                </div>
             </Modal>

        </div>
    );
};

export default InvoiceListPage;