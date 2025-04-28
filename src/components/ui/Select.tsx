import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { SelectOption } from '../../types';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string; label?: string; labelClassName?: string; error?: string; options: SelectOption[]; placeholder?: string;
  containerClassName?: string; selectClassName?: string; // Use selectClassName over className
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ id, label, labelClassName = '', error, options, placeholder, containerClassName = '', selectClassName = '', ...props }, ref ) => {
     const baseClasses = "block w-full rounded-md shadow-sm sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-100";
     const borderClasses = error ? "border-red-500 ring-1 ring-red-500" : "border-neutral-300 focus:border-primary focus:ring-1 focus:ring-primary";
     const paddingClasses = "pl-3 pr-10 py-2"; // Specific padding for select dropdown arrow space

    const finalSelectClassName = `${baseClasses} ${borderClasses} ${paddingClasses} ${selectClassName}`;
    const errorLabelClasses = 'text-red-600';
    const errorDescClasses = 'text-red-600 text-xs mt-1';

    return (
       <div className={`mb-4 ${containerClassName}`}>
         {label && <label htmlFor={id} className={`block text-sm font-medium ${error ? errorLabelClasses : 'text-neutral-700'} ${labelClassName}`}>{label}</label>}
         <div className={`mt-1 ${label ? '' : 'mt-0'}`}>
            <select id={id} ref={ref} className={finalSelectClassName} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...props}>
                {placeholder && <option value="" disabled={props.value !== undefined && props.value !== ''}>{placeholder}</option>}
                 {options.map((option) => ( <option key={option.value} value={option.value}>{option.label}</option> ))}
           </select>
        </div>
        {error && <p id={`${id}-error`} className={errorDescClasses} role="alert">{error}</p>}
      </div>
     );
  }
);
Select.displayName = 'Select';
export default Select;