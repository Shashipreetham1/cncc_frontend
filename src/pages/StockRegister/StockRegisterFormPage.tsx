import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

import { stockRegisterFormSchema, StockRegisterFormData } from '../../features/stockRegister/stockRegisterSchema';
import { fetchStockEntryById, createStockEntry, updateStockEntry, validateStockIdApi } from '../../features/stockRegister/stockRegisterApi';
import { ApiErrorResponse, StockRegister } from '../../types';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../lib/utils';

interface StockRegisterFormPageProps {
    mode: 'create' | 'edit';
}

const StockRegisterFormPage: React.FC<StockRegisterFormPageProps> = ({ mode }) => {
    const { id: stockEntryId } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(mode === 'edit');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [entryData, setEntryData] = useState<StockRegister | null>(null); // Store fetched data for display

    const {
        register,
        handleSubmit,
        control, // Keep control even if not used by FieldArray for consistency
        reset,
        watch,
        setValue, // Need setValue for totalRate potentially
        trigger,
        formState: { errors, isDirty },
    } = useForm<StockRegisterFormData>({
        resolver: zodResolver(stockRegisterFormSchema),
        defaultValues: {
            id: '',
            articleName: '',
            entryDate: formatDate(new Date().toISOString(), { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-'), // Default entry date
            voucherOrBillNumber: '',
            costRate: 0,
            cgst: 0,
            sgst: 0,
            billingDate: '',
            companyName: '',
            address: '',
            productDetails: '',
            receiptNumber: '',
            pageNumber: null,
            photo: null,
        },
    });

    // --- Calculated Field Logic (Total Rate) ---
    // Watch inputs needed for calculation
    const costRateWatcher = watch('costRate');
    const cgstWatcher = watch('cgst');
    const sgstWatcher = watch('sgst');
    const [calculatedTotalRate, setCalculatedTotalRate] = useState<number>(0);

    useEffect(() => {
        const cost = parseFloat(String(costRateWatcher)) || 0;
        const cgst = parseFloat(String(cgstWatcher)) || 0;
        const sgst = parseFloat(String(sgstWatcher)) || 0;
        setCalculatedTotalRate(cost + cgst + sgst);
    }, [costRateWatcher, cgstWatcher, sgstWatcher]);

    // --- Fetch Data for Edit Mode ---
    useEffect(() => {
        if (mode === 'edit' && stockEntryId) {
            setIsLoading(true);
            fetchStockEntryById(stockEntryId)
                .then(data => {
                    setEntryData(data);
                    reset({
                        ...data,
                        // Format dates and numbers for form fields
                        entryDate: data.entryDate ? data.entryDate.split('T')[0] : '',
                        billingDate: data.billingDate ? data.billingDate.split('T')[0] : '',
                        costRate: data.costRate,
                        cgst: data.cgst ?? 0,
                        sgst: data.sgst ?? 0,
                        pageNumber: data.pageNumber ?? null, // Keep null if it was null
                        photo: null, // Reset file input
                    });
                    setIsLoading(false);
                })
                .catch(err => {
                    toast.error(`Error loading stock entry: ${(err as Error).message}`);
                    setIsLoading(false);
                    navigate('/stock-register');
                });
        } else {
             // Set today's date as default for billing date in create mode if entry date isn't set? Or required? Schema says required.
             if(!watch('billingDate')) { // Only set if not already manually entered
                 setValue('billingDate', formatDate(new Date().toISOString(), { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-'));
             }
            setIsLoading(false);
        }
    }, [mode, stockEntryId, reset, navigate, setValue, watch]);

    // --- ID Validation ---
     const validateId = useCallback(
        async (idValue: string) => {
            if (mode === 'create' && idValue?.trim()) {
                try {
                    const { isUnique } = await validateStockIdApi(idValue);
                     return isUnique || 'Stock Register ID already exists.';
                 } catch (apiError) {
                     toast.error("Could not validate ID.");
                     return 'ID validation failed.';
                 }
            }
             return true;
         }, [mode]
     );

    // --- Form Submission ---
    const onSubmit = async (data: StockRegisterFormData) => {
        setFormError(null);
        setIsSubmitting(true);

         // --- Explicit ID validation on submit for create ---
         if (mode === 'create') {
            try {
                const validationResult = await validateStockIdApi(data.id);
                if (!validationResult.isUnique) {
                     toast.error(`ID '${data.id}' already exists.`);
                     setError('id', { type: 'manual', message: 'ID already exists.' }, { shouldFocus: true });
                    setIsSubmitting(false);
                     return;
                 }
             } catch (validationError) {
                 toast.error("Failed to verify ID uniqueness.");
                 setIsSubmitting(false);
                 return;
             }
         }

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'photo' && value !== null && value !== undefined) {
                formData.append(key, String(value));
            }
        });
        if (data.photo && data.photo.length > 0) {
            formData.append('photo', data.photo[0]); // Key must match upload.single() in route
        }

        // Include calculated totalRate (Backend also calculates, but good to send)
        // formData.append('totalRate', calculatedTotalRate.toFixed(2)); // Sent as string

        const apiCall = mode === 'create'
            ? createStockEntry(formData)
            : updateStockEntry(stockEntryId!, formData);

        try {
            await apiCall;
            toast.success(`Stock Entry ${mode === 'create' ? 'created' : 'updated'} successfully!`);
            navigate('/stock-register');
        } catch (err) {
            const error = err as AxiosError<ApiErrorResponse>;
            const backendMessage = error.response?.data?.message || `Failed to ${mode} entry.`;
            setFormError(backendMessage);
            toast.error(backendMessage);
        } finally {
             setIsSubmitting(false);
         }
    };

    if (isLoading) {
        return <div className="flex justify-center p-10"><Spinner size="lg" /> Loading Stock Entry...</div>;
    }

    return (
         <div>
             <h1 className="text-3xl font-bold text-primary mb-6">
                 {mode === 'create' ? 'Create New Stock Entry' : `Edit Stock Entry`}
             </h1>
             <form onSubmit={handleSubmit(onSubmit)} noValidate>
                 <Card title={mode === 'edit' ? `Entry ID: ${stockEntryId}` : 'Stock Entry Details'}>
                    {formError && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">{formError}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1">
                        {/* Row 1 */}
                        <Input id="id" label="Stock Entry ID*" disabled={mode === 'edit' || isSubmitting} error={errors.id?.message} {...register('id', { validate: mode === 'create' ? validateId : undefined })} required />
                        <Input id="articleName" label="Article Name*" error={errors.articleName?.message} disabled={isSubmitting} {...register('articleName')} required />
                        <Input id="entryDate" label="Entry Date" type="date" error={errors.entryDate?.message} disabled={isSubmitting} {...register('entryDate')} />

                        {/* Row 2 */}
                        <Input id="companyName" label="Company Name" error={errors.companyName?.message} disabled={isSubmitting} {...register('companyName')} />
                        <Input id="voucherOrBillNumber" label="Voucher/Bill Number*" error={errors.voucherOrBillNumber?.message} disabled={isSubmitting} {...register('voucherOrBillNumber')} required />
                         <Input id="receiptNumber" label="Receipt Number" error={errors.receiptNumber?.message} disabled={isSubmitting} {...register('receiptNumber')} />

                        {/* Row 3 */}
                        <Input id="billingDate" label="Billing Date*" type="date" error={errors.billingDate?.message} disabled={isSubmitting} {...register('billingDate')} required />
                        <Input id="pageNumber" label="Page Number" type="number" min="1" error={errors.pageNumber?.message} disabled={isSubmitting} {...register('pageNumber')} />
                        <Input id="costRate" label="Cost Rate*" type="number" step="0.01" min="0.01" error={errors.costRate?.message} disabled={isSubmitting} {...register('costRate')} required />

                        {/* Row 4 */}
                        <Input id="cgst" label="CGST" type="number" step="0.01" min="0" error={errors.cgst?.message} disabled={isSubmitting} {...register('cgst')} />
                        <Input id="sgst" label="SGST" type="number" step="0.01" min="0" error={errors.sgst?.message} disabled={isSubmitting} {...register('sgst')} />
                        <div> {/* Calculated Total Rate Display */}
                            <label className="block text-sm font-medium text-neutral-700">Total Rate</label>
                             <p className="mt-1 text-lg font-semibold text-neutral-900 h-[38px] flex items-center px-3">
                                ₹ {calculatedTotalRate.toFixed(2)}
                            </p>
                         </div>

                        {/* Row 5 */}
                        <div className="md:col-span-3">
                            <Input id="address" label="Address" type="textarea" className="h-16" error={errors.address?.message} disabled={isSubmitting} {...register('address')} />
                        </div>
                        <div className="md:col-span-3">
                            <Input id="productDetails" label="Product Details" type="textarea" className="h-16" error={errors.productDetails?.message} disabled={isSubmitting} {...register('productDetails')} />
                        </div>

                         {/* File Upload */}
                        <div className="md:col-span-3 mt-3">
                           <label htmlFor="photo" className="block text-sm font-medium text-neutral-900 mb-1">Attach Photo (Optional)</label>
                            <input type="file" id="photo" className="form-input-file" accept="image/*" disabled={isSubmitting} {...register('photo')} />
                             {mode === 'edit' && entryData?.photoUrl && !watch('photo')?.[0] && (
                                <p className='text-xs text-neutral-500 mt-1'>
                                     Current photo: <a href={entryData.fullFileUrl} target='_blank' rel="noreferrer" className='text-primary underline'>{entryData.photoUrl.split('/').pop()}</a> <img src={entryData.fullFileUrl} alt="Current" className="h-10 w-auto inline-block ml-2"/>
                                </p>
                            )}
                            {errors.photo && <p className="text-red-600 text-xs mt-1">{errors.photo.message}</p>}
                        </div>

                    </div>
                 </Card>


                {/* Form Actions */}
                 <div className="mt-8 flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={() => navigate('/stock-register')} disabled={isSubmitting}>Cancel</Button>
                     <Button type="submit" variant="primary" isLoading={isSubmitting} loadingText={mode === 'create' ? "Creating..." : "Updating..."} disabled={isSubmitting || (mode === 'edit' && !isDirty)}>{mode === 'create' ? 'Create Entry' : 'Update Entry'}</Button>
                 </div>
             </form>
         </div>
    );
};

export default StockRegisterFormPage;