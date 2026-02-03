import { InputHTMLAttributes, forwardRef, useState, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}

const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    {isVisible ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, rightIcon, onRightIconClick, className = '', type, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    
    const hasError = !!error;
    const isActive = isFocused || props.value;

    const labelStyles = hasError 
      ? 'text-primary' 
      : isActive 
        ? 'text-primary' 
        : 'text-secondary';

    const inputStyles = hasError
      ? 'border-primary focus:ring-primary'
      : isFocused
        ? 'border-secondary focus:ring-secondary'
        : 'border-gray-light focus:ring-secondary';

    return (
      <div className="w-full">
        {label && (
          <label className={`block text-sm font-medium mb-1.5 transition-colors ${labelStyles}`}>
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={`
              block w-full px-4 py-3 border-2 rounded-xl
              text-secondary placeholder:text-gray-dark/40
              focus:outline-none focus:ring-2 focus:ring-offset-0
              transition-all duration-200
              ${inputStyles}
              ${(rightIcon || isPassword) ? 'pr-12' : ''}
              ${className}
            `}
            {...props}
          />
          {(rightIcon || isPassword) && (
            <button
              type="button"
              onClick={() => {
                if (isPassword) {
                  setShowPassword(!showPassword);
                }
                onRightIconClick?.();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
            >
              {isPassword ? <EyeIcon isVisible={showPassword} /> : rightIcon}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm font-medium text-primary">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
