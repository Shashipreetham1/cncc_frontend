import React, { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

import { invoiceFormSchema, InvoiceFormData, ProductFormData } from '../../features/invoices/invoiceSchema';
import { fetchInvoiceById, createInvoice, updateInvoice, validateInvoiceIdApi } from '../../features/invoices/invoiceApi';
import { ApiErrorResponse, Invoice } from '../../types';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../lib/utils'; // Assuming you have date utils

interface InvoiceFormPageProps {
    mode: 'create' | 'edit';
}

// Icons
const AddIcon = () => <span>➕</span>;
const RemoveIcon = () => <span>➖</span>;


const InvoiceFormPage: React.FC<InvoiceFormPageProps> = ({ mode }) => {
    const { id: invoiceId } = useParams<{ id?: string }>(); // Get ID from URL for edit mode
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(mode === 'edit'); // Load data only in edit mode
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null); // For top-level API errors
    const [invoiceData, setInvoiceData] = useState<Invoice | null>(null); // Store fetched data for edit

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        trigger,
        formState: { errors, isDirty }, // Use errors from RHF
    } = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceFormSchema),
        defaultValues: {
            id: '',
            purchaseDate: formatDate(new Date().toISOString(), { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-'), // Default to today YYYY-MM-DD
            companyName: '',
            vendorName: '',
            address: '',
            totalAmount: '',
            products: [{ productName: '', quantity: 1, price: '' }], // Start with one empty product row
            invoiceFile: null,
            orderOrSerialNumber: '',
            contactNumber: '',
            additionalDetails: '',
        },
    });

    // React Hook Form Field Array for Products
    const { fields, append, remove } = useFieldArray({
        control,
        name: "products",
    });

    // Fetch data for editing
    useEffect(() => {
        if (mode === 'edit' && invoiceId) {
            setIsLoading(true);
            console.log(`Fetching invoice ${invoiceId} for editing...`);
            fetchInvoiceById(invoiceId)
                .then(data => {
                    console.log("Fetched invoice data:", data);
                    setInvoiceData(data); // Store original data if needed
                    // Format data for the form (especially dates and product numbers)
                    const formattedProducts = data.products.map(p => ({
                        id: p.id,
                        productName: p.productName,
                        serialNumber: p.serialNumber ?? '', // Handle null
                        warrantyYears: p.warrantyYears?.toString() ?? '0',
                        quantity: p.quantity.toString(),
                        price: p.price.toString(),
                    }));
                    reset({
                        ...data,
                        purchaseDate: data.purchaseDate ? data.purchaseDate.split('T')[0] : '', // Format date YYYY-MM-DD
                        totalAmount: data.totalAmount.toString(), // Convert number to string for input
                        products: formattedProducts,
                        invoiceFile: null, // Reset file input on load
                    });
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch invoice for edit:", err);
                    toast.error(`Error loading invoice: ${(err as Error).message}`);
                    setIsLoading(false);
                    navigate('/invoices'); // Redirect back if error fetching
                });
        } else {
            setIsLoading(false); // No loading needed for create mode
        }
    }, [mode, invoiceId, reset, navigate]);


     // Calculate total amount dynamically based on products - useDebounce could optimize this
     const productsWatcher = watch('products'); // Watch the products array
     useEffect(() => {
         let calculatedTotal = 0;
         productsWatcher.forEach(product => {
             const qty = parseInt(String(product.quantity), 10);
             const price = parseFloat(String(product.price));
             if (!isNaN(qty) && qty > 0 && !isNaN(price) && price > 0) {
                 calculatedTotal += qty * price;
             }
         });
         // Only update if the value is significantly different to avoid excessive re-renders?
         // Or format here if needed
         setValue('totalAmount', calculatedTotal > 0 ? calculatedTotal.toFixed(2) : '', { shouldValidate: false });
     }, [productsWatcher, setValue]);

     // Debounced ID validation for 'create' mode
    const validateId = useCallback(
        async (idValue: string) => {
        if (mode === 'create' && idValue && idValue.trim().length > 0) {
            try {
                const { isUnique } = await validateInvoiceIdApi(idValue);
                 if (!isUnique) {
                    setValue('id', idValue, { shouldValidate: false }); // Set value but flag error
                     trigger('id'); // Manually trigger validation to show RHF error
                     return 'Invoice ID already exists.'; // Return error message for RHF
                 }
            } catch (apiError) {
                console.error("ID validation API error:", apiError);
                toast.error("Could not validate Invoice ID."); // Inform user of validation check failure
                return 'ID validation failed.'; // Return error message for RHF
             }
         }
          return true; // ID is valid or not in create mode
        },
        [mode, setValue, trigger]
     );


    // Form submission handler
    const onSubmit = async (data: InvoiceFormData) => {
        setFormError(null); // Clear previous top-level errors
        setIsSubmitting(true);
        console.log('Form data submitted:', data);

        // --- Validate ID uniqueness explicitly on submit for create mode ---
         if (mode === 'create') {
             try {
                const validationResult = await validateInvoiceIdApi(data.id);
                if (!validationResult.isUnique) {
                    toast.error(`Invoice ID '${data.id}' already exists.`);
                     setError('id', { type: 'manual', message: 'Invoice ID already exists.' }); // Using RHF setError
                    setIsSubmitting(false);
                    return;
                 }
            } catch (validationError) {
                 toast.error("Failed to verify Invoice ID uniqueness. Please try again.");
                 setIsSubmitting(false);
                 return;
            }
         }


        // Construct FormData for submission (needed for file upload)
        const formData = new FormData();

        // Append non-file fields (handle nested products array)
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'products') {
                 // Backend expects 'products' as a JSON string if sent via FormData
                formData.append(key, JSON.stringify(value));
            } else if (key !== 'invoiceFile' && value !== null && value !== undefined) {
                // Append other fields, ensure numbers are sent correctly if needed
                 if(typeof value === 'number') {
                    formData.append(key, value.toString());
                 } else {
                      formData.append(key, value as string); // Append strings
                 }
            }
        });

        // Append the file if it exists in the form data
        if (data.invoiceFile && data.invoiceFile.length > 0) {
            formData.append('invoiceFile', data.invoiceFile[0]); // 'invoiceFile' must match upload.single() key
        }

         // console.log("Submitting FormData:", Object.fromEntries(formData.entries())); // Debug: See FormData content

        // Choose API call based on mode
        const apiCall = mode === 'create'
            ? createInvoice(formData)
            : updateInvoice(invoiceId!, formData); // Assert invoiceId exists in edit mode

        try {
            const result = await apiCall;
            toast.success(`Invoice successfully ${mode === 'create' ? 'created' : 'updated'}! (ID: ${result.id})`);
            navigate('/invoices'); // Redirect to list page on success
        } catch (err) {
            console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} invoice:`, err);
             const error = err as AxiosError<ApiErrorResponse>; // Type assertion
             const backendMessage = error.response?.data?.message || `Failed to ${mode} invoice.`;
             setFormError(backendMessage); // Show general error message
            toast.error(backendMessage);
            setIsSubmitting(false); // Re-enable form on error
        }
         //setIsSubmitting(false); // Done in catch or finally
    };

    if (isLoading) {
        return <div className="flex justify-center items-center p-10"><Spinner size="lg" /> Loading Invoice Data...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-primary mb-6">
                {mode === 'create' ? 'Create New Invoice' : `Edit Invoice`}
             </h1>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                 <Card title={mode === 'edit' ? `Invoice ID: ${invoiceId}` : 'Invoice Details'}>
                    {formError && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
                           {formError}
                        </div>
                    )}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                         {/* Invoice ID - Readonly in edit, validated in create */}
                        <Input
                            id="id"
                            label="Invoice ID*"
                             disabled={mode === 'edit' || isSubmitting} // Disable in edit mode
                            error={errors.id?.message}
                            {...register('id', {
                                // Add RHF validation for uniqueness on blur/change for create mode
                                validate: mode === 'create' ? validateId : undefined
                            })}
                             required
                        />
                        <Input
                            id="purchaseDate"
                            label="Purchase Date*"
                            type="date" // Use native date picker
                            error={errors.purchaseDate?.message}
                             disabled={isSubmitting}
                             {...register('purchaseDate')}
                             required
                        />
                         <Input
                            id="companyName"
                            label="Company Name*"
                            error={errors.companyName?.message}
                            disabled={isSubmitting}
                             {...register('companyName')}
                             required
                         />
                         <Input
                            id="vendorName"
                            label="Vendor Name*"
                            error={errors.vendorName?.message}
                            disabled={isSubmitting}
                             {...register('vendorName')}
                             required
                        />
                         <Input
                            id="orderOrSerialNumber"
                            label="Order / Serial Number"
                            error={errors.orderOrSerialNumber?.message}
                            disabled={isSubmitting}
                             {...register('orderOrSerialNumber')}
                         />
                        <Input
                            id="contactNumber"
                            label="Contact Number"
                            error={errors.contactNumber?.message}
                             disabled={isSubmitting}
                             {...register('contactNumber')}
                         />
                        <div className="md:col-span-2">
                            <Input
                                id="address"
                                label="Address*"
                                type="textarea" // Use textarea type if your Input component supports it
                                error={errors.address?.message}
                                disabled={isSubmitting}
                                {...register('address')}
                                 required
                                 className="h-20" // Example height adjust
                            />
                         </div>
                         <div className="md:col-span-2">
                            <Input
                                id="additionalDetails"
                                label="Additional Details"
                                 type="textarea"
                                error={errors.additionalDetails?.message}
                                disabled={isSubmitting}
                                {...register('additionalDetails')}
                                className="h-20"
                             />
                        </div>
                         <div className="md:col-span-2">
                             <Input
                                id="totalAmount"
                                label="Total Amount*"
                                type="number"
                                step="0.01" // Allow decimals
                                error={errors.totalAmount?.message}
                                disabled={isSubmitting}
                                {...register('totalAmount')}
                                readOnly // Make readonly if calculated dynamically
                                required
                            />
                         </div>

                         {/* File Upload */}
                         <div className="md:col-span-2">
                            <label htmlFor="invoiceFile" className="block text-sm font-medium text-neutral-900 mb-1">
                                Attach Invoice File (PDF, IMG, etc.)
                            </label>
                            <input
                                type="file"
                                id="invoiceFile"
                                className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                                 {...register('invoiceFile')}
                                 />
                                 {/* Display existing filename in edit mode (if desired) */}
                                 {mode === 'edit' && invoiceData?.invoiceFileUrl && !watch('invoiceFile')?.[0] && (
                                    <p className='text-xs text-neutral-500 mt-1'>
                                        Current file: <a href={invoiceData.fullFileUrl} target='_blank' rel="noreferrer" className='text-primary underline'>{invoiceData.invoiceFileUrl.split('/').pop()}</a> (Uploading new file will replace it)
                                    </p>
                                 )}
                            {errors.invoiceFile && <p className="text-red-600 text-xs mt-1">{errors.invoiceFile.message}</p>}
                         </div>
                    </div>
                 </Card>


                 {/* --- Products Section --- */}
                 <Card title="Products / Items" className="mt-6">
                      <div className="space-y-4">
                         {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-12 gap-x-4 gap-y-2 items-start border p-3 rounded-md relative">
                                 {/* Index Number */}
                                <div className="col-span-12 md:col-span-1 text-center md:text-left pt-2">
                                    <span className="text-xs font-semibold text-neutral-500">#{index + 1}</span>
                                 </div>

                                 {/* Inputs */}
                                 <div className="col-span-12 md:col-span-4">
                                    <Input
                                        id={`products.${index}.productName`}
                                        placeholder="Product Name"
                                        error={errors.products?.[index]?.productName?.message}
                                        disabled={isSubmitting}
                                         {...register(`products.${index}.productName` as const)} // 'as const' helps with type inference
                                         labelClassName='sr-only' // Hide label visually
                                        containerClassName='mb-0' // Remove bottom margin inside array item
                                     />
                                </div>
                                <div className="col-span-6 md:col-span-2">
                                     <Input
                                        id={`products.${index}.serialNumber`}
                                        placeholder="Serial Number (Optional)"
                                         error={errors.products?.[index]?.serialNumber?.message}
                                         disabled={isSubmitting}
                                         {...register(`products.${index}.serialNumber` as const)}
                                          labelClassName='sr-only'
                                        containerClassName='mb-0'
                                    />
                                 </div>
                                  <div className="col-span-6 md:col-span-1">
                                    <Input
                                        id={`products.${index}.warrantyYears`}
                                        placeholder="Warranty (Yrs)"
                                         type="number"
                                         min="0"
                                        error={errors.products?.[index]?.warrantyYears?.message}
                                        disabled={isSubmitting}
                                         {...register(`products.${index}.warrantyYears` as const)}
                                          labelClassName='sr-only'
                                         containerClassName='mb-0'
                                    />
                                 </div>
                                <div className="col-span-6 md:col-span-1">
                                     <Input
                                        id={`products.${index}.quantity`}
                                         placeholder="Qty"
                                        type="number"
                                         min="1"
                                        error={errors.products?.[index]?.quantity?.message}
                                        disabled={isSubmitting}
                                         {...register(`products.${index}.quantity` as const)}
                                         labelClassName='sr-only'
                                         containerClassName='mb-0'
                                    />
                                 </div>
                                 <div className="col-span-6 md:col-span-2">
                                    <Input
                                        id={`products.${index}.price`}
                                        placeholder="Unit Price"
                                         type="number"
                                         step="0.01"
                                         min="0.01"
                                         error={errors.products?.[index]?.price?.message}
                                         disabled={isSubmitting}
                                        {...register(`products.${index}.price` as const)}
                                        labelClassName='sr-only'
                                        containerClassName='mb-0'
                                    />
                                </div>

                                {/* Remove Button */}
                                {fields.length > 1 && (
                                     <div className="col-span-12 md:col-span-1 flex items-center justify-end">
                                         <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                             onClick={() => remove(index)}
                                             disabled={isSubmitting}
                                             title="Remove Product"
                                            className="text-red-500 hover:bg-red-100 mt-1"
                                        >
                                           <RemoveIcon />
                                        </Button>
                                     </div>
                                 )}
                            </div>
                         ))}
                     </div>

                      {/* Add Product Button */}
                     <div className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                             size="sm"
                            onClick={() => append({ productName: '', quantity: 1, price: '' })} // Append new empty row
                            disabled={isSubmitting}
                            leftIcon={<AddIcon />}
                        >
                            Add Product
                        </Button>
                        {errors.products?.root && <p className="text-red-600 text-xs mt-1">{errors.products.root.message}</p>}
                        {errors.products?.message && <p className="text-red-600 text-xs mt-1">{errors.products.message}</p>}
                    </div>
                </Card>


                 {/* --- Form Actions --- */}
                <div className="mt-8 flex justify-end space-x-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/invoices')}
                         disabled={isSubmitting}
                     >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                         variant="primary"
                         isLoading={isSubmitting}
                         loadingText={mode === 'create' ? "Creating..." : "Updating..."}
                         disabled={isSubmitting || !isDirty} // Disable if not changed in edit mode
                    >
                         {mode === 'create' ? 'Create Invoice' : 'Update Invoice'}
                     </Button>
                </div>
             </form>
        </div>
    );
};

export default InvoiceFormPage;