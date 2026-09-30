import React from 'react';
import { WorkerPerformance } from '../../types';
import { Card } from '../common/Card';
import { CheckCircle2, ArrowUpRight, Users2 } from 'lucide-react';

interface TeamPerformanceListProps {
  workers: WorkerPerformance[];
  onViewWorker?: (workerId: string) => void;
}

export const TeamPerformanceList: React.FC<TeamPerformanceListProps> = ({ workers, onViewWorker }) => {
  if (workers.length === 0) {
    return (
      <Card className="p-8 text-center bg-white border border-[#E5E9E5]">
        <Users2 className="w-10 h-10 text-[#6B756D]/30 mx-auto mb-2" />
        <div className="text-base font-bold text-[#172017]">No telecallers added yet</div>
        <p className="text-xs text-[#6B756D] mt-1">
          Go to the Workers section to add telecallers and track daily team performance.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {workers.map((worker) => {
        const percentage = Math.min(100, Math.round((worker.callsToday / (worker.dailyTarget || 15)) * 100));
        const isCompleted = worker.callsToday >= worker.dailyTarget;

        return (
          <Card key={worker.workerId} className="p-5">
            {/* Header: Name and Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#E9F9EF] text-[#0BAA45] font-bold flex items-center justify-center text-sm">
                  {worker.workerName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#172017]">{worker.workerName}</h4>
                  <div className="text-xs text-[#6B756D]">{worker.email}</div>
                </div>
              </div>

              {onViewWorker && (
                <button
                  type="button"
                  onClick={() => onViewWorker(worker.workerId)}
                  className="px-3 py-1.5 bg-[#F7F8F6] hover:bg-[#E9F9EF] text-[#172017] hover:text-[#0BAA45] border border-[#E5E9E5] hover:border-[#16C763] rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span>VIEW</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]/60 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B756D] block">
                  Calls
                </span>
                <span className="text-lg font-extrabold text-[#172017]">
                  {worker.callsToday} <span className="text-xs font-semibold text-[#6B756D]">/ {worker.dailyTarget}</span>
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B756D] block">
                  Connected
                </span>
                <span className="text-lg font-extrabold text-[#0BAA45]">
                  {worker.connectedToday}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-[#6B756D]">Progress</span>
                <span className={isCompleted ? 'text-[#0BAA45] font-bold' : 'text-[#172017]'}>
                  {percentage}%
                </span>
              </div>

              <div className="w-full h-3 bg-[#E5E9E5] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#0BAA45] rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-xs font-semibold">
                {isCompleted ? (
                  <span className="text-[#0BAA45] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Target Completed
                  </span>
                ) : (
                  <span className="text-[#F59E0B]">
                    {worker.remainingCalls} {worker.remainingCalls === 1 ? 'call' : 'calls'} remaining
                  </span>
                )}
                <span className="text-[#6B756D] font-normal">
                  Conn. Rate: {worker.connectionRate}%
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
