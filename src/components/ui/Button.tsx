import React, { ButtonHTMLAttributes } from 'react';
import Spinner from './Spinner'; // Import the Spinner

// Define Button Variants and Sizes
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'; // Added 'icon' size

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText = 'Loading...',
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  type = 'button', // Default to button type
  ...props // Pass rest of the props (like onClick) to the button element
}) => {
  // --- Base Classes ---
  const base =
    'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';

  // --- Size Classes ---
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2', // Square padding for icon buttons
  };

  // --- Variant Classes ---
  const variantClasses: Record<ButtonVariant, string> = {
    primary: `bg-primary text-white hover:bg-primary-dark focus:ring-primary border border-transparent`,
    secondary: `bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary border border-transparent`,
    danger: `bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-transparent`, // Use semantic red
    outline: `border border-primary text-primary hover:bg-primary/10 focus:ring-primary`,
    ghost: `text-neutral-700 hover:bg-neutral-200 focus:ring-neutral-500 border border-transparent`, // Less prominent
    link: `text-primary underline-offset-4 hover:underline focus:ring-primary p-0 h-auto`, // Looks like a link
  };

  // Adjust variant styles when disabled
  const disabledVariantClasses: Record<ButtonVariant, string> = {
      primary: `bg-primary/60 text-white`, // More muted background
      secondary: `bg-secondary/60 text-white`,
      danger: `bg-red-400 text-white`,
      outline: `border-neutral-300 text-neutral-400`,
      ghost: `text-neutral-400`,
      link: `text-neutral-400 no-underline`,
  }

  // Select correct variant class based on disabled state
  const currentVariantClasses = disabled || isLoading
      ? `${variantClasses[variant]} ${disabledVariantClasses[variant]}`
      : variantClasses[variant];

  return (
    <button
      type={type}
      className={`${base} ${sizeClasses[size]} ${currentVariantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" color="text-current" className="mr-2" />} {/* Show spinner when loading */}
      {!isLoading && leftIcon && <span className="mr-2 -ml-1 h-4 w-4">{leftIcon}</span>}
      <span>{isLoading ? loadingText : children}</span> {/* Show loading text or children */}
      {!isLoading && rightIcon && <span className="ml-2 -mr-1 h-4 w-4">{rightIcon}</span>}
    </button>
  );
};

export default Button;