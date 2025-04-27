import React, { InputHTMLAttributes, forwardRef } from 'react';

// Combine standard input props with custom props
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string; // Ensure ID is always required for label association
  label?: string;
  labelClassName?: string;
  error?: string; // Optional error message string
  containerClassName?: string; // Optional class for the wrapping div
  inputClassName?: string; // Optional class specifically for the input element
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { id, label, labelClassName = '', error, className = '', containerClassName = '', inputClassName = '', type = 'text', ...props },
    ref
  ) => {
    // Base input styles - relies on @tailwindcss/forms plugin
    const baseInputClasses = `
        block w-full rounded-md border-0 py-1.5 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300
        placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-primary-dark
        sm:text-sm sm:leading-6
        disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500 disabled:ring-neutral-200
    `;

    // Error state styles
    const errorInputClasses = `
        ring-red-500 text-red-900 focus:ring-red-600 placeholder:text-red-300
    `;
     const errorLabelClasses = 'text-red-600';
     const errorDescClasses = 'text-red-600 text-xs mt-1';

     // Combine base and conditional error styles
     const finalInputClassName = `${baseInputClasses} ${error ? errorInputClasses : ''} ${inputClassName} ${className}`; // className is fallback

    return (
      <div className={`mb-4 ${containerClassName}`}> {/* Add bottom margin */}
        {label && (
          <label
            htmlFor={id}
            className={`block text-sm font-medium leading-6 ${error ? errorLabelClasses : 'text-neutral-900'} ${labelClassName}`}
          >
            {label}
          </label>
        )}
        <div className={`mt-1 ${label ? '' : 'mt-0'}`}> {/* Adjust top margin if no label */}
          <input
            type={type}
            id={id}
            ref={ref} // Forward the ref to the actual input element
            className={finalInputClassName}
            aria-invalid={!!error} // Accessibility attribute
            aria-describedby={error ? `${id}-error` : undefined}
            {...props} // Spread remaining props (value, onChange, placeholder, etc.)
          />
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

Input.displayName = 'Input'; // Set display name for DevTools

export default Input;