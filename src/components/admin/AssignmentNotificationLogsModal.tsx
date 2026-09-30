import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AssignmentNotificationLog } from '../../types';
import { dataStore } from '../../services/storage/dataStore';
import { notificationService } from '../../services/notifications/notificationService';
import { showToast } from '../common/Toast';
import {
  Mail,
  MessageSquare,
  Bell,
  RefreshCw,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';

interface AssignmentNotificationLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AssignmentNotificationLog[];
  onRefresh: () => void;
}

export const AssignmentNotificationLogsModal: React.FC<AssignmentNotificationLogsModalProps> = ({
  isOpen,
  onClose,
  logs,
  onRefresh,
}) => {
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AssignmentNotificationLog | null>(null);

  const handleRetry = async (logId: string, channel: 'EMAIL' | 'WHATSAPP') => {
    setRetryingLogId(`${logId}-${channel}`);
    try {
      await notificationService.retryNotification(logId, channel);
      showToast(`✓ Retried ${channel} notification successfully`, 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Retry failed', 'error');
    } finally {
      setRetryingLogId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lead Assignment Notifications & Logs"
      subtitle="Audit trail of automated Email, WhatsApp, and In-App delivery on lead assignment"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="py-12 text-center text-[#6B756D] bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
            <Bell className="w-8 h-8 text-[#6B756D]/60 mx-auto mb-2" />
            <div className="text-sm font-semibold">No assignment notifications logged yet.</div>
            <p className="text-xs text-[#6B756D] mt-1">
              Assign leads to workers to trigger automated Email & WhatsApp notifications.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {logs.map((log) => {
              const formattedDate = new Date(log.createdAt).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className="p-4 bg-white rounded-xl border border-[#E5E9E5] hover:border-[#0BAA45]/40 transition-all shadow-2xs space-y-3"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E9E5]/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#E9F9EF] text-[#0BAA45] flex items-center justify-center font-bold text-xs">
                        {log.leadCount}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#172017] flex items-center gap-1.5">
                          <span>{log.workerName}</span>
                          <span className="text-xs font-normal text-[#6B756D]">({log.workerEmail})</span>
                        </div>
                        <div className="text-[11px] text-[#6B756D] flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formattedDate}
                          </span>
                          <span>•</span>
                          <span>{log.leadCount} {log.leadCount === 1 ? 'lead' : 'leads'} assigned</span>
                        </div>
                      </div>
                    </div>

                    {/* Summary Badges */}
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B756D] bg-[#F7F8F6] px-2.5 py-1 rounded-lg border border-[#E5E9E5]">
                      <span>Today's Total: <strong className="text-[#172017]">{log.summary.totalAssignedToday}</strong></span>
                      <span>•</span>
                      <span>Target: <strong className="text-[#0BAA45]">{log.summary.dailyTarget}</strong></span>
                    </div>
                  </div>

                  {/* Channel Delivery Statuses */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {/* Email Channel */}
                    <div className="p-2.5 rounded-lg bg-[#F7F8F6] border border-[#E5E9E5] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#0BAA45]" />
                        <span className="font-semibold text-[#172017]">Email:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-[11px] ${
                            log.emailStatus === 'SENT'
                              ? 'text-[#0BAA45]'
                              : log.emailStatus === 'FAILED'
                              ? 'text-[#DC2626]'
                              : 'text-[#6B756D]'
                          }`}
                        >
                          {log.emailStatus === 'SENT' ? '✓ Sent' : log.emailStatus === 'FAILED' ? '⚠ Failed' : '— Off'}
                        </span>
                        {log.emailStatus === 'FAILED' && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            isLoading={retryingLogId === `${log.id}-EMAIL`}
                            onClick={() => handleRetry(log.id, 'EMAIL')}
                            className="text-[10px] h-6 px-1.5 py-0 text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2]"
                          >
                            <RefreshCw className="w-2.5 h-2.5 mr-0.5" /> Retry
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* WhatsApp Channel */}
                    <div className="p-2.5 rounded-lg bg-[#F7F8F6] border border-[#E5E9E5] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#0BAA45]" />
                        <span className="font-semibold text-[#172017]">WhatsApp:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-[11px] ${
                            log.whatsappStatus === 'SENT'
                              ? 'text-[#0BAA45]'
                              : log.whatsappStatus === 'NOT_CONFIGURED'
                              ? 'text-[#6B756D]'
                              : log.whatsappStatus === 'FAILED'
                              ? 'text-[#DC2626]'
                              : 'text-[#6B756D]'
                          }`}
                        >
                          {log.whatsappStatus === 'SENT'
                            ? '✓ Sent'
                            : log.whatsappStatus === 'NOT_CONFIGURED'
                            ? '— Off'
                            : log.whatsappStatus === 'FAILED'
                            ? '⚠ Failed'
                            : '— Off'}
                        </span>
                        {log.whatsappStatus === 'FAILED' && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            isLoading={retryingLogId === `${log.id}-WHATSAPP`}
                            onClick={() => handleRetry(log.id, 'WHATSAPP')}
                            className="text-[10px] h-6 px-1.5 py-0 text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2]"
                          >
                            <RefreshCw className="w-2.5 h-2.5 mr-0.5" /> Retry
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* In-App Channel */}
                    <div className="p-2.5 rounded-lg bg-[#F7F8F6] border border-[#E5E9E5] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-[#0BAA45]" />
                        <span className="font-semibold text-[#172017]">In-App:</span>
                      </div>
                      <span className="font-bold text-[11px] text-[#0BAA45]">✓ Sent</span>
                    </div>
                  </div>

                  {/* Assigned Leads Names Preview */}
                  <div className="text-[11px] text-[#6B756D] bg-[#F7F8F6]/50 p-2 rounded-lg border border-[#E5E9E5]/60 flex items-center justify-between">
                    <span className="truncate max-w-[80%]">
                      <strong>Leads:</strong> {log.leadNames.join(', ')}
                    </span>
                    <span className="text-[#0BAA45] font-mono font-bold text-[10px]">
                      Batch: {log.batchId.slice(0, 8)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-3 flex justify-end border-t border-[#E5E9E5]">
          <Button type="button" variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
