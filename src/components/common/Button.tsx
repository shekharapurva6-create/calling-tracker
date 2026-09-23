import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'call';
  size?: 'sm' | 'md' | 'lg' | 'call-lg';
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  icon,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-[#0BAA45] hover:bg-[#09933B] text-white shadow-sm focus:ring-[#0BAA45] active:scale-[0.99]',
    secondary:
      'bg-[#E9F9EF] hover:bg-[#d5f3e0] text-[#0BAA45] font-semibold focus:ring-[#0BAA45]',
    outline:
      'border border-[#E5E9E5] bg-white text-[#172017] hover:bg-[#F7F8F6] focus:ring-[#0BAA45]',
    danger:
      'bg-[#E53935] hover:bg-[#cc2e2a] text-white shadow-sm focus:ring-[#E53935] active:scale-[0.99]',
    ghost:
      'text-[#6B756D] hover:text-[#172017] hover:bg-[#F7F8F6] focus:ring-[#0BAA45]',
    call:
      'bg-[#0BAA45] hover:bg-[#09933B] text-white font-bold tracking-wide shadow-md hover:shadow-lg focus:ring-[#16C763] active:scale-[0.98]',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
    lg: 'text-base px-5 py-3 rounded-xl gap-2.5 font-semibold',
    'call-lg': 'text-base min-h-[52px] h-[54px] w-full px-6 py-3.5 rounded-xl gap-2.5 font-bold shadow-sm',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
