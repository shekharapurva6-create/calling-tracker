import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { UserProfile, Lead } from '../../types';
import { dataStore } from '../../services/storage/dataStore';
import { showToast } from '../common/Toast';
import { Mail, FileSpreadsheet, CheckCircle2, UserX } from 'lucide-react';

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
  const [sendEmailSheet, setSendEmailSheet] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (lead) {
      setSelectedWorkerId(lead.assignedWorkerId || '');
    }
  }, [lead]);

  if (!lead) return null;

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      try {
        if (selectedWorkerId) {
          const result = dataStore.assignLead(lead.id, selectedWorkerId, sendEmailSheet);
          const workerName = selectedWorker?.fullName || 'worker';
          const workerEmail = selectedWorker?.email || '';

          if (result.emailDispatch) {
            showToast(
              `✓ Assigned to ${workerName} & sent sheet to ${workerEmail}`,
              'success',
              'Assignment & Email Dispatched'
            );
          } else {
            showToast(`✓ Lead assigned to ${workerName}`, 'success');
          }
        } else {
          dataStore.unassignLead(lead.id);
          showToast('Lead marked as unassigned', 'info');
        }
        onAssigned();
        onClose();
      } catch (err: any) {
        showToast(err.message || 'Failed to assign lead', 'error');
      } finally {
        setIsSaving(false);
      }
    }, 250);
  };

  const handleUnassign = () => {
    dataStore.unassignLead(lead.id);
    showToast(`Removed assignment for ${lead.clientName}`, 'info');
    onAssigned();
    onClose();
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
            Select Telecaller / Worker
          </label>
          <select
            value={selectedWorkerId}
            onChange={(e) => setSelectedWorkerId(e.target.value)}
            className="nexgen-input"
          >
            <option value="">-- Unassigned (Remove Worker) --</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.fullName} ({w.email})
              </option>
            ))}
          </select>
        </div>

        {/* Automated Email & Sheet Dispatch Indicator */}
        {selectedWorker && (
          <div className="p-3 bg-[#E9F9EF] rounded-xl border border-[#16C763]/40 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0BAA45]">
              <Mail className="w-4 h-4" />
              <span>Automated Worker Notification</span>
            </div>

            <p className="text-[11px] text-[#172017] leading-relaxed">
              When saved, a work assignment message with an attached <strong>.CSV lead sheet</strong> will be sent automatically to <strong className="font-mono text-[#0BAA45]">{selectedWorker.email}</strong>.
            </p>

            <label className="flex items-center gap-2 text-xs text-[#172017] font-semibold cursor-pointer pt-1 border-t border-[#16C763]/20">
              <input
                type="checkbox"
                checked={sendEmailSheet}
                onChange={(e) => setSendEmailSheet(e.target.checked)}
                className="w-4 h-4 text-[#0BAA45] rounded border-[#16C763] focus:ring-[#0BAA45]"
              />
              <span>Send notification email & lead sheet now</span>
            </label>
          </div>
        )}

        <div className="pt-3 flex items-center justify-between border-t border-[#E5E9E5]">
          {lead.assignedWorkerId ? (
            <button
              type="button"
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
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving} loadingText="SAVING...">
              SAVE ASSIGNMENT
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
