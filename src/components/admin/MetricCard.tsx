import React from 'react';
import { Card } from '../common/Card';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  trend,
  accentColor = '#0BAA45',
}) => {
  return (
    <Card className="p-5 flex items-start justify-between">
      <div>
        <span className="text-xs font-semibold text-[#6B756D] uppercase tracking-wider block mb-1">
          {label}
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#172017] tracking-tight">
          {value}
        </div>
        {trend && (
          <div className="text-xs text-[#0BAA45] font-medium mt-1 flex items-center gap-1">
            {trend}
          </div>
        )}
      </div>

      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
      >
        {icon}
      </div>
    </Card>
  );
};
