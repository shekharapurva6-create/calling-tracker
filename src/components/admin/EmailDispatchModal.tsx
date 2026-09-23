import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { EmailDispatchLog } from '../../types';
import { Mail, FileSpreadsheet, Download, CheckCircle2, Send, Clock, Trash2 } from 'lucide-react';
import { showToast } from '../common/Toast';
import { dataStore } from '../../services/storage/dataStore';

interface EmailDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispatches: EmailDispatchLog[];
  onRefresh: () => void;
}

export const EmailDispatchModal: React.FC<EmailDispatchModalProps> = ({
  isOpen,
  onClose,
  dispatches,
  onRefresh,
}) => {
  const [selectedDispatch, setSelectedDispatch] = useState<EmailDispatchLog | null>(null);

  React.useEffect(() => {
    if (dispatches.length > 0 && !selectedDispatch) {
      setSelectedDispatch(dispatches[0]);
    } else if (dispatches.length === 0) {
      setSelectedDispatch(null);
    }
  }, [dispatches, selectedDispatch]);

  const handleDownloadCsv = (dispatch: EmailDispatchLog) => {
    const blob = new Blob([dispatch.csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', dispatch.csvFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Downloaded ${dispatch.csvFilename}`, 'success');
  };

  const handleResend = (dispatch: EmailDispatchLog) => {
    showToast(`📧 Re-sent assignment message & sheet to ${dispatch.workerEmail}`, 'success');
  };

  const handleDelete = (id: string) => {
    dataStore.deleteEmailDispatchLog(id);
    showToast('Log removed', 'info');
    onRefresh();
    if (selectedDispatch?.id === id) {
      setSelectedDispatch(null);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Automated Worker Email & Sheet Dispatches"
      subtitle="Audit trail of automated emails and CSV lead sheets sent to telecallers upon work assignment"
      maxWidth="xl"
    >
      {dispatches.length === 0 ? (
        <div className="p-12 text-center text-[#6B756D]">
          <div className="w-12 h-12 rounded-2xl bg-[#E9F9EF] text-[#0BAA45] flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-[#172017]">No Automated Dispatches Yet</h4>
          <p className="text-xs text-[#6B756D] mt-1 max-w-sm mx-auto">
            Whenever you assign a lead or batch of leads to a telecaller, an automated assignment message and CSV calling sheet are automatically dispatched to the worker's email ID.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[380px]">
          {/* Dispatch List */}
          <div className="md:col-span-1 border-r border-[#E5E9E5] pr-3 space-y-2 max-h-[420px] overflow-y-auto">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B756D] mb-1">
              Sent Notifications ({dispatches.length})
            </div>
            {dispatches.map((d) => {
              const isSelected = selectedDispatch?.id === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDispatch(d)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#E9F9EF] border-[#16C763] shadow-xs'
                      : 'bg-white border-[#E5E9E5] hover:bg-[#F7F8F6]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#172017]">
                    <span className="truncate">{d.workerName}</span>
                    <span className="text-[10px] text-[#0BAA45] bg-[#E9F9EF] px-1.5 py-0.5 rounded font-bold border border-[#16C763]/30">
                      {d.leadsCount} {d.leadsCount === 1 ? 'Lead' : 'Leads'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6B756D] truncate mt-0.5 font-mono">
                    {d.workerEmail}
                  </div>
                  <div className="text-[10px] text-[#9CA3AF] mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(d.sentAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dispatch Detail Preview */}
          <div className="md:col-span-2 pl-1 space-y-3.5 flex flex-col justify-between">
            {selectedDispatch ? (
              <div className="space-y-3">
                {/* Header Banner */}
                <div className="p-3.5 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#6B756D]">To:</span>
                        <span className="text-xs font-bold text-[#172017]">
                          {selectedDispatch.workerName} &lt;{selectedDispatch.workerEmail}&gt;
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#0BAA45] mt-1">
                        {selectedDispatch.subject}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E9F9EF] text-[#0BAA45] border border-[#16C763]/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Sent & Delivered
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B756D] mb-1">
                    Dispatched Email Message
                  </label>
                  <div className="p-3 bg-white border border-[#E5E9E5] rounded-xl text-xs text-[#172017] font-mono whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                    {selectedDispatch.messageBody}
                  </div>
                </div>

                {/* Attached Lead Sheet File */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B756D] mb-1">
                    Attached Lead Sheet (.CSV)
                  </label>
                  <div className="p-3 bg-[#E9F9EF]/60 border border-[#16C763]/40 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="w-5 h-5 text-[#0BAA45]" />
                      <div>
                        <div className="text-xs font-bold text-[#172017]">
                          {selectedDispatch.csvFilename}
                        </div>
                        <div className="text-[11px] text-[#6B756D]">
                          {selectedDispatch.leadsCount} assigned lead records formatted
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadCsv(selectedDispatch)}
                      className="px-2.5 py-1.5 bg-white hover:bg-[#E9F9EF] text-[#0BAA45] border border-[#16C763]/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Sheet</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between border-t border-[#E5E9E5]">
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedDispatch.id)}
                    className="text-xs text-[#DC2626] hover:text-[#991B1B] font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Log</span>
                  </button>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleResend(selectedDispatch)}
                    icon={<Send className="w-3.5 h-3.5" />}
                  >
                    Re-send to {selectedDispatch.workerEmail}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-[#6B756D] text-xs">
                Select a dispatched notification from the left list to view details.
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
