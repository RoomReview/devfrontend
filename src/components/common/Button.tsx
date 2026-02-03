import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'dark' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
}

const LoadingSpinner = ({ className = '' }: { className?: string }) => (
  <svg 
    className={`animate-spin h-4 w-4 ${className}`} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled,
  className = '', 
  ...props 
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 uppercase tracking-[0.03em]';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-600 focus:ring-primary-400 disabled:bg-gray-light disabled:text-gray-dark/50',
    secondary: 'bg-white text-primary border-2 border-primary hover:bg-primary-50 focus:ring-primary-400 disabled:border-gray-light disabled:text-gray-dark/50',
    dark: 'bg-secondary text-white hover:bg-secondary-600 focus:ring-secondary-400 disabled:bg-gray-light disabled:text-gray-dark/50',
    outline: 'bg-white text-secondary border-2 border-secondary hover:bg-secondary-50 focus:ring-secondary-400 disabled:border-gray-light disabled:text-gray-dark/50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-2.5 text-base gap-2.5',
    lg: 'px-8 py-3 text-lg gap-3',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      
      {children}
      
      {isLoading ? (
        <LoadingSpinner />
      ) : rightIcon ? (
        <span className="flex-shrink-0">{rightIcon}</span>
      ) : null}
    </button>
  );
};

export default Button;
