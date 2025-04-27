import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // For linking results

// API & Types
import { basicSearchApi } from '../features/savedSearches/savedSearchApi'; // Use the search call from here or searchApi.ts
import { fetchUserSavedSearches, saveSearchApi, deleteSavedSearchApi, fetchSavedSearchById } from '../features/savedSearches/savedSearchApi';
import { ApiErrorResponse, BasicSearchResponse, DocumentType, SavedSearch, SelectOption, GenericDocument } from '../types';
import { saveSearchFormSchema, SaveSearchFormData } from '../features/savedSearches/saveSearchSchema';
import { useAuthStore } from '../store/authStore';

// UI Components
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal'; // Import Modal
import Table from '../components/ui/Table'; // Maybe use for results? Or cards? Let's plan for cards.

// Icons (Replace)
const SaveIcon = () => <span>💾</span>;
const LoadIcon = () => <span>📂</span>;
const SearchIcon = () => <span>🔍</span>;
const DeleteIcon = () => <span>🗑️</span>;
const ViewFileIcon = () => <span>👁️</span>;
const DownloadIcon = () => <span>🔽</span>;
const EditIcon = () => <span>✏️</span>;
const DetailIcon = () => <span>ℹ️</span>;

// --- Helper Component for Search Result Item ---
// You might want to break this into separate components per type later
const SearchResultItem: React.FC<{ item: GenericDocument }> = ({ item }) => {
    const backendBase = import.meta.env.VITE_API_BASE_URL || '';
    const getFileUrl = (doc: GenericDocument): string | null => {
         const relativePath = doc.invoiceFileUrl || doc.purchaseOrderFileUrl || doc.photoUrl || null;
         return relativePath ? `${backendBase}/${relativePath}` : null;
    };
    const getDisplayName = (doc: GenericDocument): string => {
        return doc.companyName || doc.vendorName || doc.articleName || `Document ${doc.id}`;
    }
     const getDetailLink = (doc: GenericDocument): string => {
         switch(doc.documentType) {
             case 'invoice': return `/invoices/edit/${doc.id}`; // Go to edit or a dedicated view page
             case 'purchaseOrder': return `/purchase-orders/edit/${doc.id}`;
             case 'stockRegister': return `/stock-register/edit/${doc.id}`;
             default: return '#';
         }
     };
     const fileUrl = getFileUrl(item);

    return (
        <Card className="mb-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                     <Link to={getDetailLink(item)} className="text-lg font-semibold text-primary hover:underline">{getDisplayName(item)}</Link>
                    <p className="text-xs text-neutral-500 font-mono mt-1">ID: {item.id} | Type: <span className="font-semibold">{item.documentType}</span></p>
                     {/* Display 1-2 key details based on type */}
                    {item.documentType === 'invoice' && <p className="text-sm text-neutral-600">Vendor: {item.vendorName} | Total: ₹{item.totalAmount?.toFixed(2)}</p>}
                     {item.documentType === 'purchaseOrder' && <p className="text-sm text-neutral-600">PO #: {item.purchaseOrderNumber} | Vendor: {item.vendorName}</p>}
                     {item.documentType === 'stockRegister' && <p className="text-sm text-neutral-600">Voucher: {item.voucherOrBillNumber} | Cost: ₹{item.costRate?.toFixed(2)}</p>}
                </div>
                 {/* File Actions */}
                {fileUrl && (
                    <div className="flex space-x-2 flex-shrink-0 ml-4">
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" title="View File" className="text-primary p-1 hover:bg-primary/10 rounded"><ViewFileIcon/></a>
                        <a href={fileUrl} download={`${item.id}_file`} title="Download File" className="text-neutral-600 p-1 hover:bg-neutral-100 rounded"><DownloadIcon/></a>
                    </div>
                )}
            </div>
         </Card>
    );
};

// --- Main Search Page Component ---
const SearchPage: React.FC = () => {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state: { user: any; }) => state.user);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<DocumentType | string>('INVOICE'); // Default to Invoice
    const [searchResults, setSearchResults] = useState<GenericDocument[]>([]);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Pagination State for Search Results
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [limit] = useState(10);

    // Saved Search State
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [isLoadingSaved, setIsLoadingSaved] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isLoadDropdownOpen, setIsLoadDropdownOpen] = useState(false); // For loading saved searches UI

    // Form for Saving Search
    const { register: registerSave, handleSubmit: handleSubmitSave, reset: resetSaveForm } = useForm<SaveSearchFormData>({
        resolver: zodResolver(saveSearchFormSchema)
    });

    // --- API Calls ---
    const performSearch = useCallback(async (page = 1, query = searchQuery, type = searchType) => {
        if (!query || !type) return; // Don't search if query or type is missing
        setIsLoadingSearch(true);
        setSearchError(null);
        console.log(`Performing search - Type: ${type}, Query: ${query}, Page: ${page}`);
        try {
            const data = await basicSearchApi({ query, type, page, limit });
            setSearchResults(data.results || []);
            setCurrentPage(data.currentPage || 1);
            setTotalPages(data.totalPages || 1);
            setTotalResults(data.totalResults || 0);
        } catch (err) {
             const message = err instanceof AxiosError ? (err.response?.data as ApiErrorResponse)?.message || 'Search failed' : 'An unexpected search error occurred';
            setSearchError(message);
            setSearchResults([]); // Clear previous results on error
            toast.error(`Search failed: ${message}`);
        } finally {
            setIsLoadingSearch(false);
        }
    }, [searchQuery, searchType, limit]); // Dependencies

    const loadSavedSearches = useCallback(async () => {
        setIsLoadingSaved(true);
        try {
            const data = await fetchUserSavedSearches(); // Fetches for current user
            setSavedSearches(data.savedSearches || []);
        } catch (error) {
            toast.error("Failed to load saved searches.");
        } finally {
            setIsLoadingSaved(false);
        }
    }, []);

    // --- Effects ---
    // Load saved searches on mount
    useEffect(() => {
        loadSavedSearches();
    }, [loadSavedSearches]);

    // --- Handlers ---
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page for new search
        performSearch(1);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            performSearch(newPage);
        }
    };

    const openSaveModal = () => {
         // Prepare form data based on current search state
         resetSaveForm({
             name: '', // User needs to provide a name
             documentType: searchType as DocumentType, // Assume valid type from state
             searchParams: { query: searchQuery } // Save the basic query for now; extend for advanced later
         });
        setIsSaveModalOpen(true);
    };

    const handleSaveSearch = async (data: SaveSearchFormData) => {
        setIsSubmitting(true); // Assuming you add isSubmitting state to save modal form
        try {
             // Use current state if form doesn't have these (might need hidden fields)
             const payload = {
                name: data.name,
                documentType: searchType as DocumentType,
                 searchParams: { query: searchQuery /* ... add advanced filters if implemented */ }
             };
            await saveSearchApi(payload);
            toast.success(`Search '${data.name}' saved successfully!`);
            setIsSaveModalOpen(false);
            loadSavedSearches(); // Refresh saved searches list
        } catch (error) {
            const message = error instanceof AxiosError ? (error.response?.data as ApiErrorResponse)?.message || 'Failed to save' : 'An error occurred';
             toast.error(`Save failed: ${message}`);
        } finally {
            // setIsSubmitting(false);
        }
    };

    const handleLoadSavedSearch = (savedSearch: SavedSearch) => {
        console.log("Loading saved search:", savedSearch.name, savedSearch.searchParams);
        // Set search state based on saved search
        setSearchType(savedSearch.documentType);
         // Basic example assumes searchParams = { query: "term" }
        const queryParam = (savedSearch.searchParams as any)?.query || ''; // Type assertion needed if 'unknown'
         setSearchQuery(queryParam);
        setIsLoadDropdownOpen(false); // Close dropdown
        // Trigger search immediately with loaded params
        // Needs setTimeout to allow state to update before search runs
         setTimeout(() => performSearch(1, queryParam, savedSearch.documentType), 0);
     };

    const handleDeleteSavedSearch = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete the saved search "${name}"?`)) {
            // You might want to set a loading state specific to this delete action
            try {
                await deleteSavedSearchApi(id);
                toast.success(`Saved search "${name}" deleted.`);
                loadSavedSearches(); // Refresh the list
            } catch (error) {
                 const message = error instanceof AxiosError ? (error.response?.data as ApiErrorResponse)?.message || 'Delete failed' : 'An error occurred';
                 toast.error(`Delete failed: ${message}`);
            }
        }
     };


    // Document type options for select input
    const documentTypeOptions: SelectOption[] = [
        { value: 'INVOICE', label: 'Invoices' },
        { value: 'PURCHASE_ORDER', label: 'Purchase Orders' },
        { value: 'STOCK_REGISTER', label: 'Stock Register' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Search Documents</h1>

            {/* --- Search Controls --- */}
             <Card>
                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                     <Input
                        id="searchQuery"
                         label="Search Term"
                        placeholder="Enter ID, name, vendor, SN, etc..."
                        value={searchQuery}
                         onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setSearchQuery(e.target.value)}
                         containerClassName="md:col-span-2 mb-0" // Span 2 cols on medium+
                         required
                    />
                    <Select
                        id="searchType"
                         label="Document Type"
                        options={documentTypeOptions}
                         value={searchType}
                         onChange={(e: { target: { value: any; }; }) => setSearchType(e.target.value as DocumentType)}
                        containerClassName="mb-0"
                        required
                    />
                     <div className="md:col-start-3 flex flex-col items-end md:flex-row md:items-end md:space-x-2 mt-2 md:mt-0">
                         <Button type="submit" variant="primary" isLoading={isLoadingSearch} loadingText="Searching..." className="w-full md:w-auto" leftIcon={<SearchIcon />}>Search</Button>
                     </div>
                </form>
                 {/* Save/Load Buttons */}
                <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={openSaveModal} disabled={!searchQuery || isLoadingSearch} leftIcon={<SaveIcon/>}>
                        Save Current Search
                     </Button>
                      <div className="relative"> {/* Dropdown/Popover for Loading Saved Searches */}
                         <Button variant="outline" size="sm" onClick={() => { setIsLoadDropdownOpen(!isLoadDropdownOpen); if (!isLoadDropdownOpen) loadSavedSearches(); } } leftIcon={<LoadIcon />}>
                            Load Saved Search {isLoadingSaved ? <Spinner size="sm" className="ml-2" /> : `(${savedSearches.length})`}
                        </Button>
                         {isLoadDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg border border-neutral-200 z-10 max-h-60 overflow-y-auto">
                                {isLoadingSaved ? (
                                     <div className="p-4 text-center text-neutral-500">Loading...</div>
                                ) : savedSearches.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-neutral-500">No saved searches found.</div>
                                ) : (
                                     <ul>
                                        {savedSearches.map(ss => (
                                             <li key={ss.id} className="flex justify-between items-center p-3 text-sm hover:bg-neutral-100 border-b last:border-b-0">
                                                <button
                                                    onClick={() => handleLoadSavedSearch(ss)}
                                                     className="flex-1 text-left mr-2"
                                                     title={`Type: ${ss.documentType}\nParams: ${JSON.stringify(ss.searchParams)}`}
                                                >
                                                     {ss.name} <span className="text-xs text-neutral-400">({ss.documentType})</span>
                                                 </button>
                                                <Button variant="ghost" size="icon" className="p-1 h-auto text-red-500 hover:bg-red-100" onClick={() => handleDeleteSavedSearch(ss.id, ss.name)} title="Delete Saved Search">
                                                     <DeleteIcon />
                                                 </Button>
                                             </li>
                                        ))}
                                    </ul>
                                 )}
                             </div>
                        )}
                    </div>
                 </div>
             </Card>


             {/* --- Search Results --- */}
            <div className="mt-6">
                 <h2 className="text-xl font-semibold text-neutral-800 mb-3">
                    Results {totalResults > 0 ? `(${totalResults} found)` : ''}
                </h2>
                 {isLoadingSearch && (
                    <div className="flex justify-center items-center p-10">
                        <Spinner size="lg" /><span className="ml-3 text-neutral-500">Searching...</span>
                     </div>
                 )}
                {!isLoadingSearch && searchError && (
                    <p className="text-center text-red-600 bg-red-100 p-3 rounded border border-red-300">{searchError}</p>
                )}
                {!isLoadingSearch && !searchError && searchResults.length === 0 && (
                     <p className="text-center text-neutral-500 p-5">(No results found for your query.)</p>
                 )}
                {!isLoadingSearch && !searchError && searchResults.length > 0 && (
                     <div className="space-y-3">
                        {searchResults.map(item => (
                           <SearchResultItem key={item.id} item={item} />
                         ))}
                    </div>
                 )}

                {/* Pagination for search results */}
                {!isLoadingSearch && totalPages > 1 && (
                     <div className="flex justify-center items-center space-x-2 mt-6">
                        <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} variant="outline" size="sm">Previous</Button>
                        <span className="text-sm text-neutral-600">Page {currentPage} of {totalPages}</span>
                         <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} variant="outline" size="sm">Next</Button>
                    </div>
                )}
             </div>

              {/* --- Save Search Modal --- */}
              <Modal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} title="Save Search">
                 <form onSubmit={handleSubmitSave(handleSaveSearch)}>
                      <Input
                        id="saveSearchName"
                        label="Search Name"
                        {...registerSave('name')}
                        error={(Error as any)?.saveSearchName?.message} // RHF typing issue with modal forms sometimes
                        required
                      />
                       {/* Readonly display of current search params for confirmation */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-neutral-700">Criteria to Save</label>
                         <pre className="mt-1 p-2 text-xs bg-neutral-100 rounded border border-neutral-200 overflow-x-auto">
                           Type: {searchType} <br />
                           Query: {searchQuery} <br/>
                           {/* Add advanced filters here later */}
                        </pre>
                     </div>

                      <div className="mt-6 flex justify-end space-x-3">
                         <Button type="button" variant="ghost" onClick={() => setIsSaveModalOpen(false)}>Cancel</Button>
                         <Button type="submit" variant="primary" /* isLoading={isSubmitting} */ >Save Search</Button>
                    </div>
                </form>
             </Modal>
        </div>
    );
};

export default SearchPage;

function setIsSubmitting(_arg0: boolean) {
  throw new Error('Function not implemented.');
}
