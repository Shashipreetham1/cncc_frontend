// src/components/ui/DatePicker.tsx
import React from 'react';

/**
 * Basic Date Picker Wrapper Placeholder.
 * In a real application, this would typically wrap a library like 'react-datepicker'.
 * For now, it just renders a styled native date input.
 * Use the `Input` component with `type="date"` for basic native functionality.
 *
 * Example library usage (install react-datepicker @types/react-datepicker):
 * import ReactDatePicker from 'react-datepicker';
 * import 'react-datepicker/dist/react-datepicker.css';
 * // ... inside component ...
 * // <ReactDatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} ... />
 */

interface DatePickerProps {
  id: string;
  label?: string;
  labelClassName?: string;
  selectedDate?: string; // Date string in 'YYYY-MM-DD' format for native input
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  // Add props specific to a date picker library if wrapping one
}

const DatePicker: React.FC<DatePickerProps> = ({
  id,
  label,
  labelClassName = '',
  selectedDate,
  onChange,
  error,
  disabled,
  containerClassName = '',
  inputClassName = '',
}) => {

   // Using the native date input for simplicity here
   // Base input styles - relies on @tailwindcss/forms plugin
    const baseInputClasses = `
        block w-full rounded-md border-0 py-1.5 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300
        placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-primary-dark
        sm:text-sm sm:leading-6
        disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500 disabled:ring-neutral-200
    `;
     const errorInputClasses = `ring-red-500 text-red-900 focus:ring-red-600`;
     const errorLabelClasses = 'text-red-600';
     const errorDescClasses = 'text-red-600 text-xs mt-1';
     const finalInputClassName = `${baseInputClasses} ${error ? errorInputClasses : ''} ${inputClassName}`;


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
            <input
                type="date"
                id={id}
                name={id}
                value={selectedDate} // Controlled component value
                onChange={onChange} // Handler from parent or form library
                disabled={disabled}
                className={finalInputClassName}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
            />
       </div>
       {error && (
            <p id={`${id}-error`} className={errorDescClasses} role="alert">
                {error}
            </p>
       )}
    </div>
  );
};

export default DatePicker;