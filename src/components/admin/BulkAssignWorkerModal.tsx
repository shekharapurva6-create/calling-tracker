import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { UserProfile, Lead, AssignmentNotificationLog } from '../../types';
import { dataStore } from '../../services/storage/dataStore';
import { notificationService } from '../../services/notifications/notificationService';
import { showToast } from '../common/Toast';
import {
  Mail,
  MessageSquare,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Users2,
  RefreshCw,
} from 'lucide-react';

interface BulkAssignWorkerModalProps {
  selectedLeads: Lead[];
  isOpen: boolean;
  onClose: () => void;
  workers: UserProfile[];
  onAssigned: () => void;
}

export const BulkAssignWorkerModal: React.FC<BulkAssignWorkerModalProps> = ({
  selectedLeads,
  isOpen,
  onClose,
  workers,
  onAssigned,
}) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [notificationLog, setNotificationLog] = useState<AssignmentNotificationLog | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  React.useEffect(() => {
    setSelectedWorkerId('');
    setNotificationLog(null);
  }, [isOpen]);

  if (selectedLeads.length === 0) return null;

  const activeWorkers = workers.filter((w) => w.isActive);
  const selectedWorker = workers.find((w) => w.id === selectedWorkerId);

  const handleBulkAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      showToast('Please select a telecaller for assignment', 'warning');
      return;
    }
    if (isSaving) return; // Prevent duplicate execution

    setIsSaving(true);
    setNotificationLog(null);

    try {
      const leadIds = selectedLeads.map((l) => l.id);
      const worker = selectedWorker;
      if (!worker) throw new Error('Selected worker not found');

      // 1. Store bulk assignment in database first
      const result = dataStore.bulkAssignLeads(leadIds, worker.id, false);

      // 2. Trigger grouped assignment notification (1 grouped Email + 1 grouped WhatsApp + 1 In-App)
      const notifLog = await notificationService.notifyLeadAssignment({
        worker,
        leads: result.assignedLeads,
      });

      setNotificationLog(notifLog);

      const emailStatus = notifLog.emailStatus === 'SENT' ? '📧 Email: Sent' : '📧 Email: Failed';
      const waStatus =
        notifLog.whatsappStatus === 'SENT'
          ? '📱 WhatsApp: Sent'
          : notifLog.whatsappStatus === 'NOT_CONFIGURED'
          ? '📱 WhatsApp: Off'
          : '📱 WhatsApp: Failed';

      showToast(
        `✓ ${result.count} leads assigned to ${worker.fullName} • ${emailStatus} | ${waStatus}`,
        'success',
        'Bulk Assignment Successful'
      );

      onAssigned();

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      showToast(err.message || 'Failed to bulk assign leads', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = async (channel: 'EMAIL' | 'WHATSAPP') => {
    if (!notificationLog) return;
    setIsRetrying(true);
    try {
      const updated = await notificationService.retryNotification(notificationLog.id, channel);
      setNotificationLog(updated);
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
      title="Bulk Assign Leads"
      subtitle={`Assigning ${selectedLeads.length} selected leads to a telecaller`}
      maxWidth="md"
    >
      <form onSubmit={handleBulkAssign} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6B756D] mb-1.5">
            Select Telecaller / Worker <span className="text-[#E53935]">*</span>
          </label>
          <select
            value={selectedWorkerId}
            onChange={(e) => setSelectedWorkerId(e.target.value)}
            disabled={isSaving}
            required
            className="nexgen-input"
          >
            <option value="">-- Choose active telecaller --</option>
            {activeWorkers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.fullName} ({w.email}) • Target: {w.dailyTarget || 15} calls/day
              </option>
            ))}
          </select>
        </div>

        {/* Selected Leads Preview */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-[#172017] mb-1.5">
            <span>Selected Leads Preview ({selectedLeads.length})</span>
            <span className="text-[#0BAA45] font-semibold text-[11px]">Grouped into 1 message</span>
          </div>

          <div className="max-h-36 overflow-y-auto divide-y divide-[#E5E9E5] border border-[#E5E9E5] rounded-xl p-2 bg-[#F7F8F6]">
            {selectedLeads.map((l, i) => (
              <div key={l.id} className="py-1.5 px-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#172017] truncate max-w-[200px]">
                  {i + 1}. {l.clientName} {l.businessName && `(${l.businessName})`}
                </span>
                <span className="font-mono text-[#6B756D] text-[11px]">{l.phoneNumber}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Worker Notification Channel Info */}
        {selectedWorker && (
          <div className="p-3.5 bg-[#E9F9EF] rounded-xl border border-[#16C763]/40 space-y-2 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#0BAA45] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" /> Grouped Notification Channels
              </span>
              <span className="text-[10px] font-bold bg-white text-[#0BAA45] px-2 py-0.5 rounded-full border border-[#16C763]/30">
                {selectedLeads.length} Leads
              </span>
            </div>

            <div className="space-y-1.5 pt-1 text-[#172017]">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#0BAA45]" />
                <span>
                  <strong>1 Grouped Email:</strong> {selectedWorker.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#0BAA45]" />
                <span>
                  <strong>1 Grouped WhatsApp:</strong> {selectedWorker.phone || 'Not configured'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-[#0BAA45]" />
                <span>
                  <strong>1 In-App Notification:</strong> Worker Portal alert
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Live Delivery Status Feedback */}
        {notificationLog && (
          <div className="p-3 bg-white rounded-xl border border-[#E5E9E5] space-y-2 text-xs">
            <div className="font-bold text-[#172017] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0BAA45]" />
              <span>Bulk Assignment Delivery Status:</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-[#F7F8F6] border border-[#E5E9E5] flex items-center justify-between">
                <span>📧 Email:</span>
                <span
                  className={`font-bold ${
                    notificationLog.emailStatus === 'SENT' ? 'text-[#0BAA45]' : 'text-[#DC2626]'
                  }`}
                >
                  {notificationLog.emailStatus === 'SENT' ? '✓ Sent' : '⚠ Failed'}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[#F7F8F6] border border-[#E5E9E5] flex items-center justify-between">
                <span>📱 WhatsApp:</span>
                <span
                  className={`font-bold ${
                    notificationLog.whatsappStatus === 'SENT'
                      ? 'text-[#0BAA45]'
                      : notificationLog.whatsappStatus === 'NOT_CONFIGURED'
                      ? 'text-[#6B756D]'
                      : 'text-[#DC2626]'
                  }`}
                >
                  {notificationLog.whatsappStatus === 'SENT'
                    ? '✓ Sent'
                    : notificationLog.whatsappStatus === 'NOT_CONFIGURED'
                    ? '— Off'
                    : '⚠ Failed'}
                </span>
              </div>
            </div>

            {/* Retry Controls if any failed */}
            {(notificationLog.emailStatus === 'FAILED' ||
              notificationLog.whatsappStatus === 'FAILED') && (
              <div className="flex items-center gap-2 pt-1 border-t border-[#E5E9E5]">
                {notificationLog.emailStatus === 'FAILED' && (
                  <button
                    type="button"
                    disabled={isRetrying}
                    onClick={() => handleRetry('EMAIL')}
                    className="text-[10px] font-bold text-[#DC2626] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry Email
                  </button>
                )}
                {notificationLog.whatsappStatus === 'FAILED' && (
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

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5E9E5]">
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
            {notificationLog ? 'ASSIGNED ✓' : `ASSIGN ${selectedLeads.length} LEADS & NOTIFY`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
