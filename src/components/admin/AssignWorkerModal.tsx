import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { UserProfile, Lead, AssignmentNotificationLog } from '../../types';
import { dataStore } from '../../services/storage/dataStore';
import { notificationService } from '../../services/notifications/notificationService';
import { showToast } from '../common/Toast';
import { Mail, MessageSquare, Bell, CheckCircle2, AlertTriangle, UserX, RefreshCw } from 'lucide-react';

interface AssignWorkerModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  workers: UserProfile[];
  onAssigned: () => void;
}

export const AssignWorkerModal: React.FC<AssignWorkerModalProps> = ({
  lead,
  isOpen,
  onClose,
  workers,
  onAssigned,
}) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(lead?.assignedWorkerId || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastNotificationLog, setLastNotificationLog] = useState<AssignmentNotificationLog | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  React.useEffect(() => {
    if (lead) {
      setSelectedWorkerId(lead.assignedWorkerId || '');
      setLastNotificationLog(null);
    }
  }, [lead, isOpen]);

  if (!lead) return null;

  // Only allow assigning to active workers
  const activeWorkers = workers.filter((w) => w.isActive);
  const selectedWorker = workers.find((w) => w.id === selectedWorkerId);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return; // Prevent duplicate click
    setIsSaving(true);
    setLastNotificationLog(null);

    try {
      if (selectedWorkerId) {
        // 1. Store lead assignment in database first
        const result = dataStore.assignLead(lead.id, selectedWorkerId, false);
        const workerName = selectedWorker?.fullName || 'telecaller';

        // 2. Trigger notification service
        if (selectedWorker) {
          const notifLog = await notificationService.notifyLeadAssignment({
            worker: selectedWorker,
            leads: [result.lead],
          });
          setLastNotificationLog(notifLog);

          const emailBadge = notifLog.emailStatus === 'SENT' ? '📧 Email: Sent' : '📧 Email: Failed';
          const waBadge =
            notifLog.whatsappStatus === 'SENT'
              ? '📱 WhatsApp: Sent'
              : notifLog.whatsappStatus === 'NOT_CONFIGURED'
              ? '📱 WhatsApp: Off'
              : '📱 WhatsApp: Failed';

          showToast(
            `✓ Assigned to ${workerName} • ${emailBadge} | ${waBadge}`,
            'success',
            'Lead Assignment & Notification'
          );
        } else {
          showToast(`✓ Lead assigned to ${workerName}`, 'success');
        }
      } else {
        dataStore.unassignLead(lead.id);
        showToast('Lead marked as unassigned', 'info');
      }

      onAssigned();
      // Keep modal open briefly if there are notification details, or close after a brief delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      showToast(err.message || 'Failed to assign lead', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnassign = () => {
    dataStore.unassignLead(lead.id);
    showToast(`Removed assignment for ${lead.clientName}`, 'info');
    onAssigned();
    onClose();
  };

  const handleRetry = async (channel: 'EMAIL' | 'WHATSAPP') => {
    if (!lastNotificationLog) return;
    setIsRetrying(true);
    try {
      const updatedLog = await notificationService.retryNotification(lastNotificationLog.id, channel);
      setLastNotificationLog(updatedLog);
      showToast(`Notification retry completed for ${channel}`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Retry failed', 'error');
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Lead to Telecaller"
      subtitle={`Assigning ${lead.clientName} (${lead.businessName || lead.phoneNumber})`}
      maxWidth="sm"
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6B756D] mb-1.5">
            Select Active Telecaller / Worker
          </label>
          <select
            value={selectedWorkerId}
            onChange={(e) => setSelectedWorkerId(e.target.value)}
            disabled={isSaving}
            className="nexgen-input"
          >
            <option value="">-- Unassigned (Remove Worker) --</option>
            {/* If lead is currently assigned to an inactive worker, show them as well */}
            {selectedWorker && !selectedWorker.isActive && (
              <option value={selectedWorker.id}>
                {selectedWorker.fullName} ({selectedWorker.email}) [Inactive]
              </option>
            )}
            {activeWorkers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.fullName} ({w.email})
              </option>
            ))}
          </select>
        </div>

        {/* Worker Notification Info Box */}
        {selectedWorker && selectedWorker.isActive && (
          <div className="p-3.5 bg-[#E9F9EF] rounded-xl border border-[#16C763]/40 space-y-2 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#0BAA45] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" /> Automated Notification Channels
              </span>
              <span className="text-[10px] font-bold bg-white text-[#0BAA45] px-2 py-0.5 rounded-full border border-[#16C763]/30">
                1 Lead
              </span>
            </div>

            <div className="space-y-1.5 pt-1 text-[#172017]">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#0BAA45]" />
                <span>
                  <strong>Email:</strong> {selectedWorker.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#0BAA45]" />
                <span>
                  <strong>WhatsApp:</strong> {selectedWorker.phone || 'Not configured'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-[#0BAA45]" />
                <span>
                  <strong>In-App:</strong> Worker Portal header & alert
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Live Notification Delivery Status (Post-Assignment) */}
        {lastNotificationLog && (
          <div className="p-3 bg-white rounded-xl border border-[#E5E9E5] space-y-2 text-xs">
            <div className="font-bold text-[#172017] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0BAA45]" />
              <span>Assignment Delivery Status:</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-[#F7F8F6] border border-[#E5E9E5] flex items-center justify-between">
                <span>📧 Email:</span>
                <span
                  className={`font-bold ${
                    lastNotificationLog.emailStatus === 'SENT'
                      ? 'text-[#0BAA45]'
                      : 'text-[#DC2626]'
                  }`}
                >
                  {lastNotificationLog.emailStatus === 'SENT' ? '✓ Sent' : '⚠ Failed'}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[#F7F8F6] border border-[#E5E9E5] flex items-center justify-between">
                <span>📱 WhatsApp:</span>
                <span
                  className={`font-bold ${
                    lastNotificationLog.whatsappStatus === 'SENT'
                      ? 'text-[#0BAA45]'
                      : lastNotificationLog.whatsappStatus === 'NOT_CONFIGURED'
                      ? 'text-[#6B756D]'
                      : 'text-[#DC2626]'
                  }`}
                >
                  {lastNotificationLog.whatsappStatus === 'SENT'
                    ? '✓ Sent'
                    : lastNotificationLog.whatsappStatus === 'NOT_CONFIGURED'
                    ? '— Off'
                    : '⚠ Failed'}
                </span>
              </div>
            </div>

            {/* Retry Button if any failed */}
            {(lastNotificationLog.emailStatus === 'FAILED' ||
              lastNotificationLog.whatsappStatus === 'FAILED') && (
              <div className="flex items-center gap-2 pt-1 border-t border-[#E5E9E5]">
                {lastNotificationLog.emailStatus === 'FAILED' && (
                  <button
                    type="button"
                    disabled={isRetrying}
                    onClick={() => handleRetry('EMAIL')}
                    className="text-[10px] font-bold text-[#DC2626] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry Email
                  </button>
                )}
                {lastNotificationLog.whatsappStatus === 'FAILED' && (
                  <button
                    type="button"
                    disabled={isRetrying}
                    onClick={() => handleRetry('WHATSAPP')}
                    className="text-[10px] font-bold text-[#DC2626] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry WhatsApp
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="pt-3 flex items-center justify-between border-t border-[#E5E9E5]">
          {lead.assignedWorkerId ? (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleUnassign}
              className="text-xs font-bold text-[#DC2626] hover:text-[#991B1B] flex items-center gap-1"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Unassign</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              loadingText="ASSIGNING..."
            >
              {lastNotificationLog ? 'ASSIGNED ✓' : 'ASSIGN & NOTIFY'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
