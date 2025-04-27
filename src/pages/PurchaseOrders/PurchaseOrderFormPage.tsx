import React, { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

import { purchaseOrderFormSchema, PurchaseOrderFormData, ItemFormData } from '../../features/purchaseOrders/purchaseOrderSchema';
import { fetchPurchaseOrderById, createPurchaseOrder, updatePurchaseOrder, validatePurchaseOrderIdApi } from '../../features/purchaseOrders/purchaseOrderApi';
import { ApiErrorResponse, PurchaseOrder } from '../../types';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../lib/utils';

interface PurchaseOrderFormPageProps {
    mode: 'create' | 'edit';
}

// Icons
const AddIcon = () => <span>➕</span>;
const RemoveIcon = () => <span>➖</span>;


const PurchaseOrderFormPage: React.FC<PurchaseOrderFormPageProps> = ({ mode }) => {
    const { id: purchaseOrderId } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(mode === 'edit');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [poData, setPoData] = useState<PurchaseOrder | null>(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        trigger,
        formState: { errors, isDirty },
    } = useForm<PurchaseOrderFormData>({
        resolver: zodResolver(purchaseOrderFormSchema),
        defaultValues: {
            id: '',
            orderDate: formatDate(new Date().toISOString(), { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-'),
            fromAddress: '',
            vendorName: '',
            purchaseOrderNumber: '',
            totalAmount: '',
            items: [{ description: '', quantity: 1, rate: '' }],
            purchaseOrderFile: null,
            contactNumber: '',
            gstNumber: '',
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    // Fetch existing data for edit mode
    useEffect(() => {
        if (mode === 'edit' && purchaseOrderId) {
            setIsLoading(true);
            fetchPurchaseOrderById(purchaseOrderId)
                .then(data => {
                    setPoData(data);
                    const formattedItems = data.items.map(item => ({
                        id: item.id,
                        description: item.description,
                        quantity: item.quantity.toString(),
                        rate: item.rate.toString(),
                    }));
                    reset({
                        ...data,
                        orderDate: data.orderDate ? data.orderDate.split('T')[0] : '',
                        totalAmount: data.totalAmount.toString(),
                        items: formattedItems,
                        purchaseOrderFile: null, // Reset file input
                    });
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch PO for edit:", err);
                    toast.error(`Error loading PO: ${(err as Error).message}`);
                    setIsLoading(false);
                    navigate('/purchase-orders');
                });
        } else {
            setIsLoading(false);
        }
    }, [mode, purchaseOrderId, reset, navigate]);


    // Calculate total amount dynamically based on items
    const itemsWatcher = watch('items');
    useEffect(() => {
        let calculatedTotal = 0;
        itemsWatcher.forEach(item => {
            const qty = parseInt(String(item.quantity), 10);
            const rate = parseFloat(String(item.rate));
            if (!isNaN(qty) && qty > 0 && !isNaN(rate) && rate > 0) {
                calculatedTotal += qty * rate;
            }
        });
        setValue('totalAmount', calculatedTotal > 0 ? calculatedTotal.toFixed(2) : '', { shouldValidate: true }); // Also validate amount field
    }, [itemsWatcher, setValue]);

     // Debounced ID validation for 'create' mode
     const validateId = useCallback(
        async (idValue: string) => {
            if (mode === 'create' && idValue?.trim()) {
                try {
                    const { isUnique } = await validatePurchaseOrderIdApi(idValue);
                    return isUnique || 'Purchase Order ID already exists.'; // Return true or error message
                } catch (apiError) {
                    toast.error("Could not validate PO ID.");
                    return 'ID validation check failed.';
                }
            }
            return true; // Valid if editing or empty
        }, [mode]
     );


    // Form submission
    const onSubmit = async (data: PurchaseOrderFormData) => {
        setFormError(null);
        setIsSubmitting(true);

        // --- Explicit ID validation on submit for create ---
         if (mode === 'create') {
             try {
                const validationResult = await validatePurchaseOrderIdApi(data.id);
                if (!validationResult.isUnique) {
                    toast.error(`PO ID '${data.id}' already exists.`);
                    setError('id', { type: 'manual', message: 'PO ID already exists.' }, { shouldFocus: true });
                    setIsSubmitting(false);
                    return;
                 }
            } catch (validationError) {
                 toast.error("Failed to verify PO ID uniqueness.");
                 setIsSubmitting(false);
                 return;
            }
         }

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (key === 'items') {
                 // Backend expects JSON string for arrays in FormData
                 formData.append(key, JSON.stringify(value));
            } else if (key !== 'purchaseOrderFile' && value !== null && value !== undefined) {
                formData.append(key, String(value));
            }
        });

        if (data.purchaseOrderFile && data.purchaseOrderFile.length > 0) {
            formData.append('purchaseOrderFile', data.purchaseOrderFile[0]);
        }

        const apiCall = mode === 'create'
            ? createPurchaseOrder(formData)
            : updatePurchaseOrder(purchaseOrderId!, formData);

        try {
            const result = await apiCall;
            toast.success(`Purchase Order ${mode === 'create' ? 'created' : 'updated'}! (PO#: ${result.purchaseOrderNumber})`);
            navigate('/purchase-orders');
        } catch (err) {
            const error = err as AxiosError<ApiErrorResponse>;
            const backendMessage = error.response?.data?.message || `Failed to ${mode} Purchase Order.`;
            setFormError(backendMessage);
            toast.error(backendMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-10"><Spinner size="lg" /> Loading Purchase Order...</div>;
    }

    return (
         <div>
             <h1 className="text-3xl font-bold text-primary mb-6">
                 {mode === 'create' ? 'Create New Purchase Order' : `Edit Purchase Order`}
             </h1>
             <form onSubmit={handleSubmit(onSubmit)} noValidate>
                 <Card title={mode === 'edit' ? `PO Number: ${poData?.purchaseOrderNumber || purchaseOrderId}` : 'Purchase Order Details'}>
                     {formError && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">{formError}</div>}

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1">
                        {/* Row 1 */}
                        <Input id="id" label="Purchase Order ID*" disabled={mode === 'edit' || isSubmitting} error={errors.id?.message} {...register('id', { validate: mode === 'create' ? validateId : undefined })} required />
                        <Input id="purchaseOrderNumber" label="Internal PO Number*" error={errors.purchaseOrderNumber?.message} disabled={isSubmitting} {...register('purchaseOrderNumber')} required />
                        <Input id="orderDate" label="Order Date*" type="date" error={errors.orderDate?.message} disabled={isSubmitting} {...register('orderDate')} required />

                         {/* Row 2 */}
                         <Input id="vendorName" label="Vendor Name*" error={errors.vendorName?.message} disabled={isSubmitting} {...register('vendorName')} required />
                         <Input id="contactNumber" label="Vendor Contact" error={errors.contactNumber?.message} disabled={isSubmitting} {...register('contactNumber')} />
                         <Input id="gstNumber" label="Vendor GST Number" error={errors.gstNumber?.message} disabled={isSubmitting} {...register('gstNumber')} />

                         {/* Row 3 */}
                        <div className="md:col-span-3">
                            <Input id="fromAddress" label="From Address (Origin)*" type="textarea" className="h-16" error={errors.fromAddress?.message} disabled={isSubmitting} {...register('fromAddress')} required />
                         </div>

                          {/* Row 4 */}
                         <div className="md:col-span-2">
                            <label htmlFor="purchaseOrderFile" className="block text-sm font-medium text-neutral-900 mb-1">Attach PO File (PDF, Excel, etc.)</label>
                            <input type="file" id="purchaseOrderFile" className="form-input-file" disabled={isSubmitting} {...register('purchaseOrderFile')} />
                              {mode === 'edit' && poData?.purchaseOrderFileUrl && !watch('purchaseOrderFile')?.[0] && (
                                    <p className='text-xs text-neutral-500 mt-1'>Current file: <a href={poData.fullFileUrl} target='_blank' rel="noreferrer" className='text-primary underline'>{poData.purchaseOrderFileUrl.split('/').pop()}</a></p>
                                )}
                             {errors.purchaseOrderFile && <p className="text-red-600 text-xs mt-1">{errors.purchaseOrderFile.message}</p>}
                        </div>
                         <Input id="totalAmount" label="Total Amount*" type="number" step="0.01" error={errors.totalAmount?.message} {...register('totalAmount')} readOnly required /> {/* ReadOnly because calculated */}
                     </div>
                </Card>


                {/* --- Items Section --- */}
                <Card title="Items" className="mt-6">
                     <div className="space-y-3 mb-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-12 gap-x-4 gap-y-2 items-start border p-3 rounded-md relative">
                                 {/* Inputs */}
                                <div className="col-span-12 md:col-span-6">
                                    <Input id={`items.${index}.description`} placeholder="Item Description" error={errors.items?.[index]?.description?.message} disabled={isSubmitting} {...register(`items.${index}.description` as const)} labelClassName="sr-only" containerClassName="mb-0" />
                                </div>
                                <div className="col-span-6 md:col-span-2">
                                    <Input id={`items.${index}.quantity`} placeholder="Qty" type="number" min="1" error={errors.items?.[index]?.quantity?.message} disabled={isSubmitting} {...register(`items.${index}.quantity` as const)} labelClassName="sr-only" containerClassName="mb-0" />
                                </div>
                                <div className="col-span-6 md:col-span-3">
                                    <Input id={`items.${index}.rate`} placeholder="Rate (per unit)" type="number" step="0.01" min="0.01" error={errors.items?.[index]?.rate?.message} disabled={isSubmitting} {...register(`items.${index}.rate` as const)} labelClassName="sr-only" containerClassName="mb-0" />
                                </div>
                                 {/* Remove Button */}
                                {fields.length > 1 && (
                                    <div className="col-span-12 md:col-span-1 flex items-center justify-end">
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={isSubmitting} title="Remove Item" className="text-red-500 hover:bg-red-100 mt-1"> <RemoveIcon /></Button>
                                    </div>
                                )}
                           </div>
                        ))}
                    </div>
                     {/* Add Item Button */}
                     <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, rate: '' })} disabled={isSubmitting} leftIcon={<AddIcon />}>Add Item</Button>
                     {errors.items?.root && <p className="text-red-600 text-xs mt-1">{errors.items.root.message}</p>}
                     {errors.items?.message && <p className="text-red-600 text-xs mt-1">{errors.items.message}</p>}
                 </Card>


                {/* --- Form Actions --- */}
                <div className="mt-8 flex justify-end space-x-3">
                     <Button type="button" variant="outline" onClick={() => navigate('/purchase-orders')} disabled={isSubmitting}>Cancel</Button>
                     <Button type="submit" variant="primary" isLoading={isSubmitting} loadingText={mode === 'create' ? "Creating..." : "Updating..."} disabled={isSubmitting || (mode === 'edit' && !isDirty)}> {mode === 'create' ? 'Create Purchase Order' : 'Update Purchase Order'}</Button>
                 </div>
            </form>
        </div>
    );
};

export default PurchaseOrderFormPage;