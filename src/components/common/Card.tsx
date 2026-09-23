import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={twMerge(clsx('animate-pulse bg-[#E5E9E5]/70 rounded-lg', className))} />;
};

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}> = ({ children, className, onClick, hoverable = false }) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          'bg-white border border-[#E5E9E5] rounded-xl shadow-card transition-all',
          hoverable && 'hover:shadow-card-hover hover:border-[#16C763]/40 cursor-pointer',
          className
        )
      )}
    >
      {children}
    </div>
  );
};
