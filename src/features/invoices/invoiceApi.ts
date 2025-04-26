import api from '../../lib/api';
import { Invoice, InvoiceFormData } from '../../types'; // Create these types

export const fetchInvoices = (page = 1, limit = 10): Promise<{ invoices: Invoice[], totalPages: number, currentPage: number, totalInvoices: number }> =>
    api.get('/invoices', { params: { page, limit } }).then(res => res.data);

export const fetchInvoiceById = (id: string): Promise<Invoice> =>
    api.get(`/invoices/${id}`).then(res => res.data);

export const createInvoice = (formData: FormData): Promise<Invoice> =>
    api.post('/invoices', formData, {
        headers: { 'Content-Type': 'multipart/form-data' } // Override for file upload
    }).then(res => res.data);

export const updateInvoice = (id: string, formData: FormData): Promise<Invoice> =>
    api.put(`/invoices/${id}`, formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);

export const deleteInvoice = (id: string): Promise<{ message: string }> =>
    api.delete(`/invoices/${id}`).then(res => res.data);

export const requestInvoiceEditPermission = (id: string, reason: string): Promise<any> => // Define specific type if needed
     api.post(`/invoices/${id}/request-edit`, { requestMessage: reason }).then(res => res.data);

// Add API calls for validating ID if needed here or in a shared place