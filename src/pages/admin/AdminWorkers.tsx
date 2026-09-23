import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AddWorkerModal } from '../../components/admin/AddWorkerModal';
import { dataStore, subscribeToStore } from '../../services/storage/dataStore';
import { UserProfile, WorkerPerformance } from '../../types';
import {
  UserPlus,
  CheckCircle2,
  Phone,
  Mail,
  Target,
  Edit2,
  Power,
  KeyRound,
  ArrowUpRight,
} from 'lucide-react';
import { showToast } from '../../components/common/Toast';

export const AdminWorkers: React.FC<{ onNavigateToPerformance: () => void }> = ({
  onNavigateToPerformance,
}) => {
  const [workers, setWorkers] = useState<UserProfile[]>(() => dataStore.getWorkers());
  const [workersPerf, setWorkersPerf] = useState<WorkerPerformance[]>(() =>
    dataStore.getAllWorkersPerformance()
  );
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<UserProfile | null>(null);

  const refreshData = () => {
    setWorkers(dataStore.getWorkers());
    setWorkersPerf(dataStore.getAllWorkersPerformance());
  };

  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, []);

  const handleToggleActive = (worker: UserProfile) => {
    const updated = dataStore.toggleWorkerActive(worker.id);
    showToast(
      `${worker.fullName} is now ${updated.isActive ? 'Active' : 'Deactivated'}`,
      updated.isActive ? 'success' : 'warning'
    );
    refreshData();
  };

  const handleResetPassword = (worker: UserProfile) => {
    showToast(`Password reset link sent to ${worker.email}`, 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E9E5]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172017] tracking-tight">Workers</h1>
          <p className="text-sm text-[#6B756D] mt-0.5">
            Manage telecallers, team daily quotas, and account status ({workers.length} active workers)
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={() => {
            setEditingWorker(null);
            setIsAddWorkerOpen(true);
          }}
          icon={<UserPlus className="w-4 h-4" />}
        >
          ADD WORKER
        </Button>
      </div>

      {/* Workers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {workersPerf.map((perf) => {
          const profile = workers.find((w) => w.id === perf.workerId);
          const percentage = Math.min(100, Math.round((perf.callsToday / (perf.dailyTarget || 15)) * 100));
          const isCompleted = perf.callsToday >= perf.dailyTarget;

          return (
            <Card key={perf.workerId} className="p-5 relative overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E9F9EF] text-[#0BAA45] font-extrabold text-base flex items-center justify-center shadow-xs">
                    {perf.workerName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[#172017]">{perf.workerName}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          perf.isActive
                            ? 'bg-[#E9F9EF] text-[#0BAA45] border border-[#16C763]/30'
                            : 'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]'
                        }`}
                      >
                        {perf.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-xs text-[#6B756D] flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {perf.email}
                      </span>
                      {perf.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {perf.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (profile) {
                        setEditingWorker(profile);
                        setIsAddWorkerOpen(true);
                      }
                    }}
                    className="p-1.5 text-[#6B756D] hover:text-[#0BAA45] hover:bg-[#E9F9EF] rounded-lg transition-colors"
                    title="Edit Worker"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => profile && handleToggleActive(profile)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      perf.isActive
                        ? 'text-[#6B756D] hover:text-[#E53935] hover:bg-[#FEE2E2]/50'
                        : 'text-[#DC2626] hover:bg-[#E9F9EF] hover:text-[#0BAA45]'
                    }`}
                    title={perf.isActive ? 'Deactivate Worker' : 'Activate Worker'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Performance Box */}
              <div className="p-4 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5] mb-4">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B756D] block">
                      Today's Calls
                    </span>
                    <span className="text-xl font-extrabold text-[#172017]">
                      {perf.callsToday}{' '}
                      <span className="text-xs font-semibold text-[#6B756D]">
                        / {perf.dailyTarget}
                      </span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B756D] block">
                      Connected
                    </span>
                    <span className="text-xl font-extrabold text-[#0BAA45]">
                      {perf.connectedToday}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-[#E5E9E5] rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-[#0BAA45] rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs font-semibold">
                  {isCompleted ? (
                    <span className="text-[#0BAA45] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ✓ TARGET COMPLETED
                    </span>
                  ) : (
                    <span className="text-[#F59E0B]">
                      {perf.remainingCalls} {perf.remainingCalls === 1 ? 'call' : 'calls'} remaining
                    </span>
                  )}
                  <span className="text-[#6B756D] font-normal">
                    {percentage}% completed
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E5E9E5]/60 text-xs">
                <button
                  type="button"
                  onClick={() => profile && handleResetPassword(profile)}
                  className="inline-flex items-center gap-1 text-[#6B756D] hover:text-[#172017] font-medium"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Reset Password</span>
                </button>

                <button
                  type="button"
                  onClick={onNavigateToPerformance}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-[#E9F9EF] text-[#0BAA45] border border-[#16C763]/40 rounded-lg font-bold transition-all"
                >
                  <span>VIEW PERFORMANCE</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add / Edit Worker Modal */}
      <AddWorkerModal
        isOpen={isAddWorkerOpen}
        onClose={() => {
          setIsAddWorkerOpen(false);
          setEditingWorker(null);
        }}
        onWorkerAdded={refreshData}
        editingWorker={editingWorker}
      />
    </div>
  );
};
