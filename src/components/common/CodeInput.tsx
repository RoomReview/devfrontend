import { useState, useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';

interface CodeInputProps {
  length?: number;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
  error?: string;
  disabled?: boolean;
}

const CodeInput = ({
  length = 6,
  onChange,
  onComplete,
  error,
  disabled = false,
}: CodeInputProps) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const hasError = !!error;

  const focusInput = (index: number) => {
    if (index >= 0 && index < length) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow single digit
    if (value.length > 1) return;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    const code = newValues.join('');
    onChange?.(code);

    // Move to next input if value entered
    if (value && index < length - 1) {
      focusInput(index + 1);
    }

    // Check if complete
    if (code.length === length && !code.includes('')) {
      onComplete?.(code);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        // Move to previous input if current is empty
        focusInput(index - 1);
        const newValues = [...values];
        newValues[index - 1] = '';
        setValues(newValues);
        onChange?.(newValues.join(''));
      }
    } else if (e.key === 'ArrowLeft') {
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight') {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    
    if (pastedData) {
      const newValues = [...values];
      for (let i = 0; i < pastedData.length; i++) {
        newValues[i] = pastedData[i];
      }
      setValues(newValues);
      
      const code = newValues.join('');
      onChange?.(code);
      
      // Focus the next empty input or last input
      const nextEmptyIndex = newValues.findIndex(v => !v);
      focusInput(nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex);
      
      if (code.length === length) {
        onComplete?.(code);
      }
    }
  };

  const inputStyles = hasError
    ? 'border-primary focus:ring-primary'
    : 'border-gray-light focus:border-secondary focus:ring-secondary';

  return (
    <div className="w-full">
      <div className="flex gap-3 justify-center">
        {values.map((value, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={`
              w-14 h-16 text-center text-2xl font-bold
              border-2 rounded-xl
              text-secondary
              focus:outline-none focus:ring-2 focus:ring-offset-0
              transition-all duration-200
              disabled:bg-gray-light/50 disabled:cursor-not-allowed
              ${inputStyles}
            `}
          />
        ))}
      </div>
      {error && (
        <p className="mt-3 text-sm font-medium text-primary text-center">{error}</p>
      )}
    </div>
  );
};

export default CodeInput;
