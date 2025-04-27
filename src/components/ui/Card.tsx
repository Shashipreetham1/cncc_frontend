import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string; // Allow extending base card styles
  title?: string;
  titleClassName?: string; // Allow custom title styles
  actions?: React.ReactNode; // Slot for buttons/icons in the header
  footer?: React.ReactNode; // Slot for footer content
  noPadding?: boolean; // Option to remove internal padding (e.g., for tables flush to edge)
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  titleClassName = 'text-lg font-semibold text-neutral-800',
  actions,
  footer,
  noPadding = false,
}) => {
  const paddingClass = noPadding ? '' : 'p-4 sm:p-6'; // Conditional padding

  return (
    // Base card styling: background, shadow, rounded corners
    <div className={`bg-white shadow-lg rounded-lg overflow-hidden border border-neutral-200/50 ${className}`}>
      {/* Card Header: Optional title and actions */}
      {(title || actions) && (
          <div className="px-4 py-3 border-b border-neutral-200 sm:px-6 flex justify-between items-center min-h-[50px]">
             {/* Render title if provided */}
             {title && <h3 className={titleClassName}>{title}</h3>}
              {/* Spacer to push actions right if only title exists */}
             {!actions && <div className="flex-grow"></div>}
             {/* Render actions if provided */}
             {actions && <div className="flex items-center space-x-2 flex-shrink-0">{actions}</div>}
         </div>
      )}

      {/* Card Body: Content area with conditional padding */}
      <div className={paddingClass}>
        {children}
      </div>

      {/* Card Footer: Optional area at the bottom */}
      {footer && (
          <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 sm:px-6">
              {footer}
          </div>
      )}
    </div>
  );
};

export default Card;