import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { UserProfile, Lead } from '../../types';
import { dataStore } from '../../services/storage/dataStore';
import { showToast } from '../common/Toast';

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

  // Update selected worker when lead changes
  React.useEffect(() => {
    if (lead) {
      setSelectedWorkerId(lead.assignedWorkerId || '');
    }
  }, [lead]);

  if (!lead) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      try {
        if (selectedWorkerId) {
          dataStore.assignLead(lead.id, selectedWorkerId);
          const worker = workers.find((w) => w.id === selectedWorkerId);
          showToast(`✓ Lead assigned to ${worker?.fullName || 'worker'}`, 'success');
        } else {
          dataStore.updateLead(lead.id, { assignedWorkerId: undefined, assignedWorkerName: undefined });
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Lead to Worker"
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
            <option value="">-- Unassigned --</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.fullName} ({w.email})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[#6B756D] mt-1.5">
            Once saved, this lead will be immediately accessible in the assigned worker's portal.
          </p>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E5E9E5]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving} loadingText="SAVING...">
            SAVE ASSIGNMENT
          </Button>
        </div>
      </form>
    </Modal>
  );
};
