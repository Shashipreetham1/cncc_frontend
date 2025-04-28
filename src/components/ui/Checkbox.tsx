import React, { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
    id: string; label: React.ReactNode; labelClassName?: string; description?: string;
    descriptionClassName?: string; error?: string; containerClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ id, label, labelClassName = '', description, descriptionClassName = '', error, containerClassName = '', ...props }, ref) => {
        // Manual styling as @tailwindcss/forms plugin is not available
        const baseCheckboxClasses = "h-4 w-4 rounded border-neutral-400 text-primary focus:ring-primary focus:ring-offset-0 disabled:opacity-50";
        const errorCheckboxClasses = 'border-red-500 text-red-600 focus:ring-red-600';
        const errorLabelClasses = 'text-red-600';
        const errorDescClasses = 'text-red-500';

        return (
             <div className={`relative flex items-start gap-x-2 ${containerClassName} mb-4`}> {/* Reduced gap */}
                 <div className="flex h-6 items-center pt-0.5"> {/* Align checkbox better */}
                    <input
                        id={id} ref={ref} type="checkbox"
                        className={`${baseCheckboxClasses} ${error ? errorCheckboxClasses : ''}`}
                         aria-describedby={description ? `${id}-description` : error ? `${id}-error` : undefined}
                        aria-invalid={!!error}
                         {...props}
                     />
                 </div>
                 <div className="text-sm leading-6">
                     <label htmlFor={id} className={`font-medium ${error ? errorLabelClasses : 'text-neutral-700'} ${labelClassName}`}>{label}</label>
                     {description && !error && (<p id={`${id}-description`} className={`text-neutral-500 text-xs ${descriptionClassName}`}>{description}</p>)}
                     {error && (<p id={`${id}-error`} className={`text-red-600 text-xs mt-0.5 ${errorDescClasses}`} role="alert">{error}</p>)}
                 </div>
            </div>
         );
     }
);
Checkbox.displayName = 'Checkbox';
export default Checkbox;