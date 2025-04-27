import React from 'react';
import { useParams } from 'react-router-dom';

interface InvoiceFormPageProps {
    mode: 'create' | 'edit';
}

const InvoiceFormPage: React.FC<InvoiceFormPageProps> = ({ mode }) => {
    const { id } = useParams<{ id?: string }>(); // Get ID from URL for edit mode

    return (
        <div>
        <h1 className="text-2xl font-semibold text-primary mb-4">
            {mode === 'create' ? 'Create New Invoice' : `Edit Invoice ${id || ''}`}
        </h1>
        <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-neutral-600">
                (React Hook Form implementation for Invoice data, including dynamic product fields and file upload, will go here.)
            </p>
            {/* <InvoiceFormComponent invoiceId={mode === 'edit' ? id : undefined} /> */}
         </div>
        </div>
    );
};

export default InvoiceFormPage;