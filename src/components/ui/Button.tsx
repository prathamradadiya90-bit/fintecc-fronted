import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-xl';
    
    const variants = {
      primary: 'bg-[#4A6FA5] hover:bg-[#3D5D8A] text-white font-semibold shadow-sm transition-all',
      secondary: 'text-[var(--color-text-on-card)] hover:opacity-80',
      danger: 'bg-[rgba(158,74,74,0.08)] text-[#9E4A4A] hover:bg-[rgba(158,74,74,0.15)] border border-[rgba(158,74,74,0.2)] font-semibold transition-all',
      ghost: 'bg-transparent hover:opacity-80',
      outline: 'bg-transparent hover:opacity-80',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-[12px]',
      md: 'px-4 py-2 text-[13px]',
      lg: 'px-6 py-3 text-sm',
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    const inlineStyle: React.CSSProperties = {};
    if (variant === 'secondary') {
      inlineStyle.background = 'var(--color-bg-skeleton)';
    } else if (variant === 'ghost') {
      inlineStyle.color = 'var(--color-text-secondary)';
    } else if (variant === 'outline') {
      inlineStyle.border = '1px solid var(--color-border)';
      inlineStyle.color = 'var(--color-text-on-card)';
    }

    return (
      <button ref={ref} className={classes} disabled={disabled || isLoading} style={inlineStyle} {...props}>
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';
