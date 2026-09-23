import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CallStatus, LeadPriority, LeadStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'grey' | 'orange' | 'red' | 'blue' | 'purple' | 'amber';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'grey',
  size = 'md',
  className,
}) => {
  const variants = {
    green: 'bg-[#E9F9EF] text-[#0BAA45] border-[#bbf0ce]',
    grey: 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]',
    orange: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
    red: 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]',
    blue: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
    purple: 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]',
    amber: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium border',
    md: 'text-xs px-2.5 py-1 rounded-lg font-semibold border',
  };

  return (
    <span className={twMerge(clsx('inline-flex items-center gap-1 shrink-0 uppercase tracking-wider', variants[variant], sizes[size], className))}>
      {children}
    </span>
  );
};

export const CallStatusBadge: React.FC<{ status: CallStatus; size?: 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  switch (status) {
    case 'CONNECTED':
      return <Badge variant="green" size={size}>CONNECTED</Badge>;
    case 'NO_ANSWER':
      return <Badge variant="grey" size={size}>NO ANSWER</Badge>;
    case 'BUSY':
      return <Badge variant="orange" size={size}>BUSY</Badge>;
    case 'FAILED':
      return <Badge variant="red" size={size}>FAILED</Badge>;
    case 'RINGING':
      return <Badge variant="blue" size={size}>RINGING</Badge>;
    case 'INITIATED':
      return <Badge variant="blue" size={size}>INITIATED</Badge>;
    case 'COMPLETED':
      return <Badge variant="green" size={size}>COMPLETED</Badge>;
    default:
      return <Badge variant="grey" size={size}>{status}</Badge>;
  }
};

export const LeadStatusBadge: React.FC<{ status: LeadStatus; size?: 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  switch (status) {
    case 'NEW':
      return <Badge variant="blue" size={size}>NEW</Badge>;
    case 'CALLED':
      return <Badge variant="grey" size={size}>CALLED</Badge>;
    case 'CONNECTED':
      return <Badge variant="green" size={size}>CONNECTED</Badge>;
    case 'FOLLOW-UP':
      return <Badge variant="amber" size={size}>FOLLOW-UP</Badge>;
    case 'INTERESTED':
      return <Badge variant="green" size={size}>INTERESTED</Badge>;
    case 'NOT_INTERESTED':
      return <Badge variant="red" size={size}>NOT INTERESTED</Badge>;
    case 'CONVERTED':
      return <Badge variant="purple" size={size}>CONVERTED</Badge>;
    default:
      return <Badge variant="grey" size={size}>{status}</Badge>;
  }
};

export const PriorityBadge: React.FC<{ priority: LeadPriority; size?: 'sm' | 'md' }> = ({ priority, size = 'sm' }) => {
  switch (priority) {
    case 'URGENT':
      return <Badge variant="red" size={size}>URGENT</Badge>;
    case 'HIGH':
      return <Badge variant="orange" size={size}>HIGH</Badge>;
    case 'MEDIUM':
      return <Badge variant="blue" size={size}>MEDIUM</Badge>;
    case 'LOW':
      return <Badge variant="grey" size={size}>LOW</Badge>;
    default:
      return <Badge variant="grey" size={size}>{priority}</Badge>;
  }
};
