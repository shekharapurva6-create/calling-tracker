import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AddWorkerModal } from '../../components/admin/AddWorkerModal';
import { EmailDispatchModal } from '../../components/admin/EmailDispatchModal';
import { Modal } from '../../components/common/Modal';
import { CallStatusBadge } from '../../components/common/Badge';
import { dataStore, subscribeToStore } from '../../services/storage/dataStore';
import { UserProfile, WorkerPerformance, EmailDispatchLog, Lead, CallLog, FollowUp } from '../../types';
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
  Users2,
  Clock,
  Search,
} from 'lucide-react';
import { showToast } from '../../components/common/Toast';

export const AdminWorkers: React.FC<{ onNavigateToPerformance?: () => void }> = ({
  onNavigateToPerformance,
}) => {
  const [workers, setWorkers] = useState<UserProfile[]>(() => dataStore.getWorkers());
  const [workersPerf, setWorkersPerf] = useState<WorkerPerformance[]>(() =>
    dataStore.getAllWorkersPerformance()
  );
  const [emailDispatches, setEmailDispatches] = useState<EmailDispatchLog[]>(() =>
    dataStore.getEmailDispatchLogs()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modals state
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<UserProfile | null>(null);
  const [viewingWorkerId, setViewingWorkerId] = useState<string | null>(null);

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
      showToast(
        `No leads are currently assigned to ${worker.fullName}. Assign leads first!`,
        'warning'
      );
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

  const filteredWorkersPerf = workersPerf.filter((perf) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      perf.workerName.toLowerCase().includes(q) ||
      perf.email.toLowerCase().includes(q) ||
      (perf.phone && perf.phone.includes(q));

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') return perf.isActive;
    if (statusFilter === 'INACTIVE') return !perf.isActive;
    return true;
  });

  const selectedWorkerProfile = viewingWorkerId
    ? workers.find((w) => w.id === viewingWorkerId)
    : null;
  const selectedWorkerPerf = viewingWorkerId
    ? workersPerf.find((p) => p.workerId === viewingWorkerId)
    : null;
  const selectedWorkerLeads: Lead[] = viewingWorkerId
    ? dataStore.getLeads(viewingWorkerId)
    : [];
  const selectedWorkerCalls: CallLog[] = viewingWorkerId
    ? dataStore.getCallLogs(viewingWorkerId).slice(0, 10)
    : [];
  const selectedWorkerFollowUps: FollowUp[] = viewingWorkerId
    ? dataStore.getFollowUps(viewingWorkerId)
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E9E5]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172017] tracking-tight">
            Workers
          </h1>
          <p className="text-sm text-[#6B756D] mt-0.5">
            Manage telecaller workforce, automated email sheets, and daily quotas ({workers.length}{' '}
            workers)
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

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search workers by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nexgen-input pl-10 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-[#172017] text-white'
                : 'bg-white text-[#6B756D] border border-[#E5E9E5]'
            }`}
          >
            All ({workers.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              statusFilter === 'ACTIVE'
                ? 'bg-[#0BAA45] text-white'
                : 'bg-white text-[#6B756D] border border-[#E5E9E5]'
            }`}
          >
            Active ({workers.filter((w) => w.isActive).length})
          </button>
          <button
            onClick={() => setStatusFilter('INACTIVE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              statusFilter === 'INACTIVE'
                ? 'bg-[#DC2626] text-white'
                : 'bg-white text-[#6B756D] border border-[#E5E9E5]'
            }`}
          >
            Inactive ({workers.filter((w) => !w.isActive).length})
          </button>
        </div>
      </div>

      {/* Workers Cards Grid */}
      {filteredWorkersPerf.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#E5E9E5] rounded-2xl shadow-card">
          <Users2 className="w-12 h-12 text-[#6B756D]/30 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#172017]">No telecallers found</h3>
          <p className="text-xs text-[#6B756D] mt-1 mb-4">
            Click "ADD WORKER" to register a new telecaller in the system.
          </p>
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
            ADD WORKER NOW
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredWorkersPerf.map((perf) => {
            const profile = workers.find((w) => w.id === perf.workerId);
            const assignedLeads = dataStore.getLeads(perf.workerId);
            const percentage = Math.min(
              100,
              Math.round((perf.callsToday / (perf.dailyTarget || 15)) * 100)
            );
            const isCompleted = perf.callsToday >= perf.dailyTarget;

            return (
              <Card key={perf.workerId} className="p-5 relative overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#E9F9EF] text-[#0BAA45] font-extrabold text-base flex items-center justify-center shadow-xs">
                      {perf.workerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
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
                      <div className="text-xs text-[#6B756D] flex flex-wrap items-center gap-3 mt-1">
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
                          : 'text-[#0BAA45] hover:bg-[#E9F9EF]'
                      }`}
                      title={perf.isActive ? 'Deactivate Worker' : 'Reactivate Worker'}
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
                        {perf.remainingCalls} {perf.remainingCalls === 1 ? 'call' : 'calls'}{' '}
                        remaining
                      </span>
                    )}
                    <span className="text-[#6B756D] font-normal">
                      Conn. Rate: {perf.connectionRate}%
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#E5E9E5]/60 text-xs gap-2">
                  <button
                    type="button"
                    onClick={() => profile && handleEmailWorkerSheet(profile)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E9F9EF] hover:bg-[#d5f3e0] text-[#0BAA45] border border-[#16C763]/40 rounded-lg font-bold transition-all cursor-pointer"
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
                      onClick={() => setViewingWorkerId(perf.workerId)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-[#E9F9EF] text-[#172017] hover:text-[#0BAA45] border border-[#E5E9E5] rounded-lg font-bold transition-all"
                    >
                      <span>View Worker</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

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

      {/* View Worker Details Modal */}
      {selectedWorkerProfile && selectedWorkerPerf && (
        <Modal
          isOpen={!!viewingWorkerId}
          onClose={() => setViewingWorkerId(null)}
          title={`Worker Details: ${selectedWorkerProfile.fullName}`}
          subtitle="Comprehensive performance, assigned leads, and activity records"
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs sm:text-sm">
            {/* Worker Summary Header */}
            <div className="p-4 bg-[#F7F8F6] rounded-2xl border border-[#E5E9E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#172017]">
                    {selectedWorkerProfile.fullName}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      selectedWorkerProfile.isActive
                        ? 'bg-[#E9F9EF] text-[#0BAA45] border border-[#16C763]/30'
                        : 'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]'
                    }`}
                  >
                    {selectedWorkerProfile.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-xs text-[#6B756D] mt-1 flex flex-wrap gap-3 font-mono">
                  <span>{selectedWorkerProfile.email}</span>
                  {selectedWorkerProfile.phone && <span>• {selectedWorkerProfile.phone}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleToggleActive(selectedWorkerProfile);
                    setViewingWorkerId(null);
                  }}
                >
                  {selectedWorkerProfile.isActive ? 'Deactivate Worker' : 'Reactivate Worker'}
                </Button>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-white border border-[#E5E9E5] rounded-xl">
                <div className="text-[11px] text-[#6B756D] font-bold">Daily Target</div>
                <div className="text-lg font-extrabold text-[#172017] mt-0.5">
                  {selectedWorkerPerf.dailyTarget} Calls
                </div>
              </div>
              <div className="p-3 bg-white border border-[#E5E9E5] rounded-xl">
                <div className="text-[11px] text-[#6B756D] font-bold">Calls Today</div>
                <div className="text-lg font-extrabold text-[#172017] mt-0.5">
                  {selectedWorkerPerf.callsToday}
                </div>
              </div>
              <div className="p-3 bg-[#E9F9EF] border border-[#16C763]/40 rounded-xl">
                <div className="text-[11px] text-[#0BAA45] font-bold">Connected</div>
                <div className="text-lg font-extrabold text-[#0BAA45] mt-0.5">
                  {selectedWorkerPerf.connectedToday}
                </div>
              </div>
              <div className="p-3 bg-white border border-[#E5E9E5] rounded-xl">
                <div className="text-[11px] text-[#6B756D] font-bold">Connection Rate</div>
                <div className="text-lg font-extrabold text-[#172017] mt-0.5">
                  {selectedWorkerPerf.connectionRate}%
                </div>
              </div>
            </div>

            {/* Assigned Leads Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#172017] mb-2">
                Assigned Leads ({selectedWorkerLeads.length})
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5 border border-[#E5E9E5] rounded-xl p-2 bg-white">
                {selectedWorkerLeads.length === 0 ? (
                  <p className="text-xs text-[#6B756D] p-3 text-center">No leads assigned.</p>
                ) : (
                  selectedWorkerLeads.map((l) => (
                    <div
                      key={l.id}
                      className="p-2 bg-[#F7F8F6] rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#172017]">{l.clientName}</span>
                        {l.businessName && (
                          <span className="text-[#6B756D] ml-1">({l.businessName})</span>
                        )}
                        <span className="font-mono text-[#6B756D] ml-2">{l.phoneNumber}</span>
                      </div>
                      <span className="font-bold text-[#0BAA45] bg-[#E9F9EF] px-2 py-0.5 rounded text-[10px]">
                        {l.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Calls Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#172017] mb-2">
                Recent Calls ({selectedWorkerCalls.length})
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5 border border-[#E5E9E5] rounded-xl p-2 bg-white">
                {selectedWorkerCalls.length === 0 ? (
                  <p className="text-xs text-[#6B756D] p-3 text-center">No calls recorded today.</p>
                ) : (
                  selectedWorkerCalls.map((c) => (
                    <div
                      key={c.id}
                      className="p-2 bg-[#F7F8F6] rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#172017]">{c.clientName || 'Client'}</span>
                        <span className="font-mono text-[#6B756D] ml-2">{c.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CallStatusBadge status={c.status} size="sm" />
                        <span className="font-mono font-bold text-[11px]">
                          {c.durationSeconds}s
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setViewingWorkerId(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
