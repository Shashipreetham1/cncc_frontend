import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string; label?: string; labelClassName?: string; error?: string;
  containerClassName?: string; inputClassName?: string; // Use inputClassName over className for the input itself
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, labelClassName = '', error, containerClassName = '', inputClassName = '', type = 'text', ...props }, ref ) => {
    // Manual Tailwind classes for basic appearance (similar to forms plugin, but direct)
    const baseClasses = "block w-full rounded-md shadow-sm sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-100";
    const borderClasses = error ? "border-red-500 ring-1 ring-red-500" : "border-neutral-300 focus:border-primary focus:ring-1 focus:ring-primary";
    const paddingClasses = "px-3 py-2"; // Adjust padding as needed

    const finalInputClassName = `${baseClasses} ${borderClasses} ${paddingClasses} ${inputClassName}`;
    const errorLabelClasses = 'text-red-600';
    const errorDescClasses = 'text-red-600 text-xs mt-1';

    return (
      <div className={`mb-4 ${containerClassName}`}>
        {label && <label htmlFor={id} className={`block text-sm font-medium ${error ? errorLabelClasses : 'text-neutral-700'} ${labelClassName}`}>{label}</label>}
        <div className={`mt-1 ${label ? '' : 'mt-0'}`}>
          <input type={type} id={id} ref={ref} className={finalInputClassName} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...props} />
        </div>
        {error && <p id={`${id}-error`} className={errorDescClasses} role="alert">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
export default Input;