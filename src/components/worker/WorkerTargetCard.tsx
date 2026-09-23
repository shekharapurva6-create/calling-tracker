import React from 'react';
import { Card } from '../common/Card';
import { CheckCircle2, Target, PhoneCall } from 'lucide-react';
import { WorkerPerformance } from '../../types';

interface WorkerTargetCardProps {
  performance: WorkerPerformance;
}

export const WorkerTargetCard: React.FC<WorkerTargetCardProps> = ({ performance }) => {
  const target = performance.dailyTarget || 15;
  const callsMade = performance.callsToday;
  const percentage = Math.min(100, Math.round((callsMade / target) * 100));
  const isCompleted = callsMade >= target;

  return (
    <Card className="p-5 sm:p-6 bg-white border border-[#E5E9E5] shadow-card rounded-2xl relative overflow-hidden">
      {/* Background Accent Pill */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#E9F9EF]/50 rounded-bl-full pointer-events-none" />

      {/* Title & Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E9F9EF] text-[#0BAA45] flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B756D] block">
              TODAY'S TARGET
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-[#172017]">
              {callsMade} <span className="text-sm font-semibold text-[#6B756D]">/ {target} Calls</span>
            </div>
          </div>
        </div>

        {isCompleted ? (
          <div className="px-3 py-1 bg-[#E9F9EF] text-[#0BAA45] border border-[#16C763]/40 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4" />
            <span>Target Completed</span>
          </div>
        ) : (
          <div className="px-3 py-1 bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] rounded-xl text-xs font-bold">
            {performance.remainingCalls} {performance.remainingCalls === 1 ? 'call' : 'calls'} remaining
          </div>
        )}
      </div>

      {/* Large Green Progress Bar */}
      <div className="mt-4">
        <div className="w-full h-4 bg-[#E5E9E5] rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-[#0BAA45] rounded-full transition-all duration-700 ease-out shadow-xs"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Quick Summary Sub-Metrics */}
      <div className="mt-4 pt-3 border-t border-[#E5E9E5]/70 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#0BAA45]" />
          <span className="text-[#6B756D]">Connected:</span>
          <span className="font-bold text-[#172017]">{performance.connectedToday}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#6B756D]" />
          <span className="text-[#6B756D]">Success Rate:</span>
          <span className="font-bold text-[#0BAA45]">{performance.connectionRate}%</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
          <span className="text-[#6B756D]">Avg Duration:</span>
          <span className="font-bold text-[#172017]">{Math.floor(performance.avgDurationSeconds / 60)}m {performance.avgDurationSeconds % 60}s</span>
        </div>
      </div>
    </Card>
  );
};
