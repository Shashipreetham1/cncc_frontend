import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { SelectOption } from '../../types'; // Use the shared SelectOption type

// Combine standard select props with custom props
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string; // Ensure ID is required
  label?: string;
  labelClassName?: string;
  error?: string;
  options: SelectOption[]; // Array of { value: string | number; label: string }
  placeholder?: string; // Optional placeholder option text
  containerClassName?: string;
  selectClassName?: string; // Optional class specifically for the select element
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { id, label, labelClassName = '', error, options, placeholder, className = '', containerClassName = '', selectClassName = '', ...props },
    ref
  ) => {
     // Base select styles - relies on @tailwindcss/forms
     const baseSelectClasses = `
        block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-neutral-900 ring-1 ring-inset ring-neutral-300
        focus:ring-2 focus:ring-inset focus:ring-primary-dark sm:text-sm sm:leading-6
        disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500 disabled:ring-neutral-200
    `;
     const errorSelectClasses = `
        ring-red-500 text-red-900 focus:ring-red-600
     `;
     const errorLabelClasses = 'text-red-600';
     const errorDescClasses = 'text-red-600 text-xs mt-1';

    // Combine styles
    const finalSelectClassName = `${baseSelectClasses} ${error ? errorSelectClasses : ''} ${selectClassName} ${className}`;

    return (
      <div className={`mb-4 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={id}
            className={`block text-sm font-medium leading-6 ${error ? errorLabelClasses : 'text-neutral-900'} ${labelClassName}`}
          >
            {label}
          </label>
        )}
        <div className={`mt-1 ${label ? '' : 'mt-0'}`}>
          <select
            id={id}
            ref={ref}
            className={finalSelectClassName}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props} // Spread remaining props (value, onChange, disabled, etc.)
          >
            {placeholder && (
              <option value="" disabled={props.value !== ''}>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p id={`${id}-error`} className={errorDescClasses} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;