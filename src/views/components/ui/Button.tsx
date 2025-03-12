import React, { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    fullWidth = false,
    isLoading = false,
    className = '',
    disabled,
    ...rest
}) => {
    // Variant classları
    const variantClasses = {
        primary: 'bg-emerald-500 text-gray-900 hover:bg-emerald-600 focus:ring-emerald-500/20',
        secondary: 'bg-gray-700 text-gray-100 hover:bg-gray-600 focus:ring-gray-600/20',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/20',
        outline: 'border border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-gray-500/20 bg-transparent'
    };

    // Size classları
    const sizeClasses = {
        sm: 'py-1.5 px-3 text-xs',
        md: 'py-2 px-4 text-sm',
        lg: 'py-2.5 px-5 text-base'
    };

    const baseClasses = `
    inline-flex items-center justify-center 
    rounded-lg font-medium transition-all 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
    ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
  `;

    // Loading spinner
    const LoadingSpinner = () => (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    return (
        <button
            className={`${baseClasses} ${className}`}
            disabled={disabled || isLoading}
            {...rest}
        >
            {isLoading && <LoadingSpinner />}
            {!isLoading && icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
            {children}
            {!isLoading && icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </button>
    );
};

export default Button; 