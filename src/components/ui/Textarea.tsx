import React, { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string; label?: string; labelClassName?: string; error?: string;
  containerClassName?: string; textareaClassName?: string; // Use textareaClassName over className
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ id, label, labelClassName = '', error, containerClassName = '', textareaClassName = '', rows = 3, ...props }, ref) => {
    const baseClasses = "block w-full rounded-md shadow-sm sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-100 resize-y"; // Added resize-y
    const borderClasses = error ? "border-red-500 ring-1 ring-red-500" : "border-neutral-300 focus:border-primary focus:ring-1 focus:ring-primary";
    const paddingClasses = "px-3 py-2";

    const finalTextareaClassName = `${baseClasses} ${borderClasses} ${paddingClasses} ${textareaClassName}`;
    const errorLabelClasses = 'text-red-600';
    const errorDescClasses = 'text-red-600 text-xs mt-1';

    return (
       <div className={`mb-4 ${containerClassName}`}>
         {label && <label htmlFor={id} className={`block text-sm font-medium ${error ? errorLabelClasses : 'text-neutral-700'} ${labelClassName}`}>{label}</label>}
         <div className={`mt-1 ${label ? '' : 'mt-0'}`}>
           <textarea id={id} ref={ref} rows={rows} className={finalTextareaClassName} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...props} />
         </div>
         {error && <p id={`${id}-error`} className={errorDescClasses} role="alert">{error}</p>}
       </div>
     );
  }
);
Textarea.displayName = 'Textarea';
export default Textarea;