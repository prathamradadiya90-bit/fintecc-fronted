import React, { forwardRef, useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const defaultId = useId();
    const inputId = id || defaultId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[13px] font-medium mb-1"
            style={{ color: 'var(--color-text-on-card)' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-2.5 py-1.5 rounded-xl text-[13px] 
              placeholder:opacity-50
              focus:outline-none focus:ring-2 focus:ring-[#00C2B3] focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-shadow duration-200
              ${leftIcon ? 'pl-9' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error ? 'focus:ring-red-500' : ''}
              ${className}
            `}
            style={{
              background: 'var(--color-bg-input)',
              border: `1px solid ${error ? '#ef4444' : 'var(--color-border)'}`,
              color: 'var(--color-text-primary)',
            }}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center" style={{ color: 'var(--color-text-muted)' }}>
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
