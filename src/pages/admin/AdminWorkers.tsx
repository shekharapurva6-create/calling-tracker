import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AddWorkerModal } from '../../components/admin/AddWorkerModal';
import { EmailDispatchModal } from '../../components/admin/EmailDispatchModal';
import { dataStore, subscribeToStore } from '../../services/storage/dataStore';
import { UserProfile, WorkerPerformance, EmailDispatchLog } from '../../types';
import {
  UserPlus,
  CheckCircle2,
  Phone,
  Mail,
  Edit2,
  Power,
  KeyRound,
  ArrowUpRight,
  Send,
  FileSpreadsheet,
} from 'lucide-react';
import { showToast } from '../../components/common/Toast';

export const AdminWorkers: React.FC<{ onNavigateToPerformance: () => void }> = ({
  onNavigateToPerformance,
}) => {
  const [workers, setWorkers] = useState<UserProfile[]>(() => dataStore.getWorkers());
  const [workersPerf, setWorkersPerf] = useState<WorkerPerformance[]>(() =>
    dataStore.getAllWorkersPerformance()
  );
  const [emailDispatches, setEmailDispatches] = useState<EmailDispatchLog[]>(() =>
    dataStore.getEmailDispatchLogs()
  );
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<UserProfile | null>(null);

  const refreshData = () => {
    setWorkers(dataStore.getWorkers());
    setWorkersPerf(dataStore.getAllWorkersPerformance());
    setEmailDispatches(dataStore.getEmailDispatchLogs());
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

  const handleEmailWorkerSheet = (worker: UserProfile) => {
    const assignedLeads = dataStore.getLeads(worker.id);
    if (assignedLeads.length === 0) {
      showToast(`No leads are currently assigned to ${worker.fullName}. Assign leads first!`, 'warning');
      return;
    }

    const leadIds = assignedLeads.map((l) => l.id);
    const dispatch = dataStore.sendAssignmentEmailAndSheet(worker.id, leadIds);

    if (dispatch) {
      showToast(
        `📧 Dispatched ${assignedLeads.length} leads sheet to ${worker.email}`,
        'success',
        'Lead Sheet Dispatched'
      );
      refreshData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E9E5]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172017] tracking-tight">Workers</h1>
          <p className="text-sm text-[#6B756D] mt-0.5">
            Manage telecaller workforce, automated email sheets, and daily quotas ({workers.length} workers)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEmailModalOpen(true)}
            icon={<Mail className="w-3.5 h-3.5 text-[#0BAA45]" />}
          >
            Dispatched Emails ({emailDispatches.length})
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingWorker(null);
              setIsAddWorkerOpen(true);
            }}
            icon={<UserPlus className="w-4 h-4" />}
          >
            ADD WORKER
          </Button>
        </div>
      </div>

      {/* Workers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {workersPerf.map((perf) => {
          const profile = workers.find((w) => w.id === perf.workerId);
          const assignedLeads = dataStore.getLeads(perf.workerId);
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
                      <span className="flex items-center gap-1 font-mono font-medium text-[#172017]">
                        <Mail className="w-3 h-3 text-[#0BAA45]" /> {perf.email}
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

              {/* Performance & Quota Box */}
              <div className="p-4 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5] mb-4">
                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div className="p-2 bg-white rounded-lg border border-[#E5E9E5]/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B756D] block">
                      Assigned Leads
                    </span>
                    <span className="text-base font-extrabold text-[#172017]">
                      {assignedLeads.length}
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-[#E5E9E5]/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B756D] block">
                      Calls Today
                    </span>
                    <span className="text-base font-extrabold text-[#172017]">
                      {perf.callsToday} / {perf.dailyTarget}
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-[#E5E9E5]/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B756D] block">
                      Connected
                    </span>
                    <span className="text-base font-extrabold text-[#0BAA45]">
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
              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#E5E9E5]/60 text-xs gap-2">
                <button
                  type="button"
                  onClick={() => profile && handleEmailWorkerSheet(profile)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E9F9EF] hover:bg-[#d5f3e0] text-[#0BAA45] border border-[#16C763]/40 rounded-lg font-bold transition-all"
                  title="Send work assignment message and CSV lead sheet to this worker email"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Email Calling Sheet</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => profile && handleResetPassword(profile)}
                    className="inline-flex items-center gap-1 text-[#6B756D] hover:text-[#172017] font-medium"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Reset Pass</span>
                  </button>

                  <button
                    type="button"
                    onClick={onNavigateToPerformance}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-[#E9F9EF] text-[#172017] hover:text-[#0BAA45] border border-[#E5E9E5] rounded-lg font-bold transition-all"
                  >
                    <span>Stats</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
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

      {/* Email Dispatches Audit Modal */}
      <EmailDispatchModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        dispatches={emailDispatches}
        onRefresh={refreshData}
      />
    </div>
  );
};
