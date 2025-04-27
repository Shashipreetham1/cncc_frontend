import React, { Fragment } from 'react';
// Using Headless UI for accessible modal primitive
// Install: npm install @headlessui/react
import { Dialog, Transition } from '@headlessui/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void; // Function to close the modal
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Control modal width
  footer?: React.ReactNode; // Optional footer content (e.g., buttons)
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}) => {
  const sizeClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl', // Add more sizes if needed: '2xl', '3xl', etc.
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}> {/* Increased z-index */}
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </Transition.Child>

        {/* Modal container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full ${sizeClasses[size]} transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all`}
              >
                {/* Modal Header */}
                {title && (
                   <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-neutral-900 px-6 py-4 border-b border-neutral-200"
                  >
                    {title}
                  </Dialog.Title>
                )}

                {/* Modal Body */}
                <div className="p-6"> {/* Content padding */}
                    {children}
                </div>

                {/* Modal Footer (optional) */}
                {footer && (
                  <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-end space-x-3">
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;