import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

import { fetchEditRequests, approveEditRequestApi, rejectEditRequestApi } from '../../features/editRequests/editRequestApi';
import { EditRequest, PaginatedResponse, ApiErrorResponse, EditRequestStatus } from '../../types';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input'; // For rejection reason
import Select from '../../components/ui/Select';
import { formatDate } from '../../lib/utils';
// import { getSocket } from '../../lib/socket'; // Direct socket import is okay for listening here

// Icons
const ApproveIcon = () => <span title="Approve">✅</span>;
const RejectIcon = () => <span title="Reject">❌</span>;

const AdminEditRequestsPage: React.FC = () => {
    const [editRequests, setEditRequests] = useState<EditRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters and Pagination
    const [filterStatus, setFilterStatus] = useState<EditRequestStatus | 'ALL'>('PENDING'); // Default to PENDING
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRequests, setTotalRequests] = useState(0);
    const [limit] = useState(15); // Show more per page

    // Action States
    const [processingId, setProcessingId] = useState<string | null>(null); // ID being approved/rejected
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [requestToReject, setRequestToReject] = useState<EditRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Fetch Edit Requests
    const loadRequests = useCallback(async (page: number, status: EditRequestStatus | 'ALL') => {
        setIsLoading(true);
        setError(null);
        console.log(`Fetching edit requests - Status: ${status}, Page: ${page}`);
        try {
            // Adjust sortBy/sortOrder if needed, e.g., 'createdAt', 'desc'
            const data = await fetchEditRequests(page, limit, status);
            setEditRequests(data.results || []);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
            setTotalRequests(data.totalRequests || data.totalResults || 0); // Adjust based on API response field name
        } catch (err) {
            const message = err instanceof AxiosError ? (err.response?.data as ApiErrorResponse)?.message || 'Error fetching data' : 'An error occurred';
            setError(message);
            toast.error(`Failed to load requests: ${message}`);
            setEditRequests([]); // Clear list on error
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    // Initial Load & Filter Change Load
    useEffect(() => {
        loadRequests(1, filterStatus); // Load page 1 when filter changes
    }, [filterStatus, loadRequests]);

    // Effect for Socket.IO Listener (optional, alternative to just toast in socket.ts)
    // useEffect(() => {
    //     const socket = getSocket();
    //     const handleNewRequest = (data: { message?: string, editRequest?: EditRequest }) => {
    //         console.log('Socket received new-edit-request on Admin Page');
    //         toast.info(`🔔 New Request: ${data.editRequest?.id} (reload may be needed)`);
    //         // Potentially refresh if showing PENDING or ALL
    //         if (filterStatus === 'PENDING' || filterStatus === 'ALL') {
    //            // Maybe just show a "new requests arrived" banner instead of auto-refreshing?
    //            // loadRequests(1, filterStatus); // Auto-refresh might be disruptive
    //         }
    //     };
    //     socket?.on('new-edit-request', handleNewRequest);
    //     return () => {
    //          socket?.off('new-edit-request', handleNewRequest);
    //     };
    // }, [filterStatus, loadRequests]);


    // --- Handlers ---
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            loadRequests(newPage, filterStatus);
        }
    };

    const handleStatusFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterStatus(event.target.value as EditRequestStatus | 'ALL');
        setCurrentPage(1); // Reset to page 1 when filter changes
        // useEffect will trigger loadRequests
    };

    const handleApprove = async (request: EditRequest) => {
        if (processingId) return;
        setProcessingId(request.id);
        try {
            // Simple confirmation, could use modal too
             if (!window.confirm(`Approve edit request for ${request.documentTypeLabel} ID: ${request.documentId}?`)) {
                 setProcessingId(null);
                return;
            }
            const result = await approveEditRequestApi(request.id);
            toast.success(result.message || `Request ${request.id} approved!`);
            loadRequests(currentPage, filterStatus); // Refresh list
        } catch (err) {
             const message = err instanceof AxiosError ? (err.response?.data as ApiErrorResponse)?.message || 'Approval failed' : 'An error occurred';
             toast.error(`Approve failed: ${message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const openRejectModal = (request: EditRequest) => {
        setRequestToReject(request);
        setRejectionReason(''); // Clear previous reason
        setIsRejectModalOpen(true);
    };

    const closeRejectModal = () => {
        setIsRejectModalOpen(false);
        setRequestToReject(null);
        setRejectionReason('');
    };

    const handleReject = async () => {
        if (!requestToReject || !rejectionReason.trim()) {
            toast.warn("Please provide a reason for rejection.");
            return;
        }
        if (processingId) return;
        setProcessingId(requestToReject.id); // Indicate processing
        try {
            const result = await rejectEditRequestApi(requestToReject.id, rejectionReason);
            toast.success(result.message || `Request ${requestToReject.id} rejected!`);
            closeRejectModal();
            loadRequests(currentPage, filterStatus); // Refresh list
        } catch (err) {
             const message = err instanceof AxiosError ? (err.response?.data as ApiErrorResponse)?.message || 'Rejection failed' : 'An error occurred';
             toast.error(`Reject failed: ${message}`);
        } finally {
            setProcessingId(null); // Stop processing indicator even on error
        }
    };


    // --- Table Columns ---
    const columns = useMemo(() => [
        { header: 'Req. ID', accessor: 'id', cellClassName: 'font-mono text-xs w-1/6 truncate' },
        { header: 'Requested By', accessor: (item: EditRequest) => item.requestedBy?.username ?? 'N/A'},
        { header: 'Doc Type', accessor: 'documentTypeLabel'}, // Added in API response
        { header: 'Doc ID', accessor: 'documentId', cellClassName: 'font-mono text-xs'}, // Added in API response
        { header: 'Request Message', accessor: 'requestMessage', className: 'max-w-xs truncate', cellClassName: 'text-sm text-neutral-600'},
        { header: 'Req. Date', accessor: (item: EditRequest) => formatDate(item.createdAt) },
        { header: 'Status', accessor: 'status', cellClassName: 'font-semibold', },
        { header: 'Processed By', accessor: (item: EditRequest) => item.adminUser?.username ?? '-'},
        { header: 'Actions', accessor: (item: EditRequest) => (
             <div className="flex items-center justify-end space-x-2">
                {item.status === 'PENDING' && (
                    <>
                        <Button
                            variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50"
                             onClick={() => handleApprove(item)}
                             isLoading={processingId === item.id} loadingText='Approving' disabled={!!processingId}
                             leftIcon={<ApproveIcon />}
                         >Approve</Button>
                         <Button
                            variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50"
                             onClick={() => openRejectModal(item)}
                             disabled={!!processingId}
                             leftIcon={<RejectIcon />}
                         >Reject</Button>
                    </>
                )}
                 {/* Optionally show 'View Details' for processed requests */}
                 {item.status !== 'PENDING' && (
                     <span className='text-xs italic text-neutral-500'>Processed</span>
                 )}
           </div>
        ), cellClassName: 'text-right', headerClassName: 'text-right'},
    ], [processingId, handleApprove, openRejectModal]); // Include handlers


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Manage Edit Requests</h1>

             {/* Filters */}
             <div className="flex items-center space-x-4">
                 <label htmlFor="statusFilter" className="text-sm font-medium text-neutral-700">Filter by Status:</label>
                 <Select
                    id="statusFilter"
                    options={[
                        { value: 'ALL', label: 'All Statuses' },
                        { value: 'PENDING', label: 'Pending' },
                        { value: 'APPROVED', label: 'Approved' },
                        { value: 'REJECTED', label: 'Rejected' },
                    ]}
                    value={filterStatus}
                    onChange={handleStatusFilterChange}
                    disabled={isLoading}
                    containerClassName="mb-0" // Remove default margin
                     className="w-48"
                 />
            </div>

            {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded border border-red-300">{error}</p>}

             <Table<EditRequest>
                columns={columns}
                data={editRequests}
                isLoading={isLoading}
                loadingRowCount={5}
                 emptyMessage={isLoading ? "Loading..." : `No ${filterStatus !== 'ALL' ? filterStatus.toLowerCase() : ''} edit requests found.`}
            />

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
                 <div className="flex justify-center items-center space-x-2 mt-6">
                     <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} variant="outline" size="sm">Previous</Button>
                    <span className="text-sm text-neutral-600">Page {currentPage} of {totalPages} (Total: {totalRequests})</span>
                    <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} variant="outline" size="sm">Next</Button>
                </div>
            )}

             {/* Reject Confirmation Modal */}
             <Modal isOpen={isRejectModalOpen} onClose={closeRejectModal} title={`Reject Edit Request ${requestToReject?.id || ''}?`} size="lg">
                <p className="text-sm mb-4">Provide a reason for rejecting this request:</p>
                 <Input
                    id="rejectionReason"
                    label="Reason for Rejection"
                    labelClassName='sr-only' // Label provided by modal title/text
                    type="textarea"
                     className="h-20"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                />
                <div className="mt-6 flex justify-end space-x-3">
                     <Button variant="ghost" onClick={closeRejectModal} disabled={processingId === requestToReject?.id}>Cancel</Button>
                    <Button variant="danger" onClick={handleReject} isLoading={processingId === requestToReject?.id} loadingText="Rejecting...">Confirm Rejection</Button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminEditRequestsPage;