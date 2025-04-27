import React from 'react';
import Spinner from './Spinner'; // Import spinner

// Define a structure for table columns
interface TableColumn<T> {
  header: string | React.ReactNode; // Column header text or element
  // Accessor can be a key of the data object, or a function that receives the item and returns the cell content
  accessor: keyof T | string | ((item: T, index: number) => React.ReactNode);
  className?: string;       // Applied to both th and td
  headerClassName?: string; // Specific class for th
  cellClassName?: string;   // Specific class for td
  id?: string;             // Optional unique ID for the column header if needed
}

// Table component props
interface TableProps<T extends { id: string | number | undefined }> { // Require id for row key (can be undefined before save)
  columns: TableColumn<T>[];    // Array defining table structure
  data: T[];                    // Array of data objects to display
  isLoading?: boolean;           // Show loading state?
  loadingRowCount?: number;     // Number of skeleton rows to show when loading
  emptyMessage?: string | React.ReactNode; // Message when data array is empty
  containerClassName?: string;   // Class for the wrapping div
  tableClassName?: string;       // Class for the <table> element
  onRowClick?: (item: T) => void;// Optional handler when a row is clicked
}

/**
 * A reusable Table component with basic styling and loading/empty states.
 */
function Table<T extends { id: string | number | undefined }>({
  columns,
  data,
  isLoading = false,
  loadingRowCount = 5, // Default number of skeleton rows
  emptyMessage = 'No data available.',
  containerClassName = '',
  tableClassName = '',
  onRowClick,
}: TableProps<T>) {

  const getAccessorKey = (accessor: TableColumn<T>['accessor'], index: number): string => {
      if(typeof accessor === 'string') return accessor;
      if(typeof accessor === 'symbol') return String(accessor); // Handle symbol keys
      // For function accessors, generate a stable key based on index or header if possible
      const headerString = typeof columns[index]?.header === 'string' ? columns[index].header : `col-${index}`;
      return headerString;
  };

  return (
    <div className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg bg-white ${containerClassName}`}>
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-neutral-200 ${tableClassName}`}>
          <thead className="bg-neutral-100">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={getAccessorKey(col.accessor, index) + '-header'}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider ${col.className || ''} ${col.headerClassName || ''}`}
                  id={col.id}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {isLoading ? (
              // Show skeleton/loading rows
              Array.from({ length: loadingRowCount }).map((_, rowIndex) => (
                <tr key={`loading-${rowIndex}`} className="animate-pulse">
                  {columns.map((col, colIndex) => (
                    <td
                      key={`loading-${rowIndex}-${getAccessorKey(col.accessor, colIndex)}`}
                      className={`px-4 py-3 whitespace-nowrap text-sm ${col.className || ''} ${col.cellClassName || ''}`}
                    >
                      <div className="h-4 bg-neutral-200 rounded w-3/4"></div> {/* Skeleton loader */}
                    </td>
                  ))}
                </tr>
              ))
            ) : data && data.length > 0 ? (
              // Render actual data rows
              data.map((item, rowIndex) => (
                <tr
                   key={item.id ?? `item-${rowIndex}`} // Use id if available, fallback to index
                   className={`${onRowClick ? 'cursor-pointer' : ''} hover:bg-neutral-50 transition-colors duration-150`}
                   onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {columns.map((col, colIndex) => {
                     // Determine cell content: either from object key or render function
                    let cellContent: React.ReactNode = '-'; // Default if accessor fails
                     try {
                          if (typeof col.accessor === 'function') {
                              cellContent = col.accessor(item, rowIndex);
                          } else if (typeof col.accessor === 'string' && item.hasOwnProperty(col.accessor)) {
                              // Type assertion needed here if T is generic without index signature
                               cellContent = (item as any)[col.accessor];
                               // Handle null/undefined rendering gracefully
                              if(cellContent === null || cellContent === undefined) {
                                   cellContent = <span className="text-neutral-400">N/A</span>;
                              }
                          }
                     } catch (e) {
                         console.error("Error accessing table cell data:", e);
                         cellContent = <span className="text-red-500">Error</span>;
                     }

                    return (
                      <td
                        key={`${item.id ?? rowIndex}-${getAccessorKey(col.accessor, colIndex)}`}
                        className={`px-4 py-3 whitespace-nowrap text-sm text-neutral-700 ${col.className || ''} ${col.cellClassName || ''}`}
                      >
                        {cellContent}
                      </td>
                    );
                   })}
                </tr>
              ))
            ) : (
              // Show empty message row
              <tr>
                <td colSpan={columns.length} className="px-4 py-5 text-center text-sm text-neutral-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;