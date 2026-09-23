import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { dataStore } from '../../services/storage/dataStore';
import { UserProfile } from '../../types';
import { showToast } from '../common/Toast';

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkerAdded: () => void;
  editingWorker?: UserProfile | null;
}

export const AddWorkerModal: React.FC<AddWorkerModalProps> = ({
  isOpen,
  onClose,
  onWorkerAdded,
  editingWorker,
}) => {
  const [fullName, setFullName] = useState(editingWorker?.fullName || '');
  const [email, setEmail] = useState(editingWorker?.email || '');
  const [phone, setPhone] = useState(editingWorker?.phone || '');
  const [password, setPassword] = useState('');
  const [dailyTarget, setDailyTarget] = useState<number>(editingWorker?.dailyTarget || 15);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (editingWorker) {
      setFullName(editingWorker.fullName);
      setEmail(editingWorker.email);
      setPhone(editingWorker.phone || '');
      setDailyTarget(editingWorker.dailyTarget || 15);
      setPassword('');
    } else {
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setDailyTarget(15);
    }
    setError(null);
  }, [editingWorker, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Worker Name is required');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('A valid email address is required');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      try {
        if (editingWorker) {
          dataStore.updateWorker(editingWorker.id, {
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim() || undefined,
            dailyTarget: Number(dailyTarget) || 15,
          });
          showToast('Worker details updated', 'success');
        } else {
          dataStore.createWorker({
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim() || undefined,
            dailyTarget: Number(dailyTarget) || 15,
          });
          showToast('Worker created successfully', 'success');
        }

        onWorkerAdded();
        onClose();
      } catch (err: any) {
        setError(err.message || 'Failed to save worker');
      } finally {
        setIsLoading(false);
      }
    }, 250);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingWorker ? 'Edit Telecaller Profile' : 'Add New Worker'}
      subtitle="Configure telecaller account access and daily call targets"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#172017] mb-1">
            Worker Full Name <span className="text-[#E53935]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Rahul Kumar"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="nexgen-input"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#172017] mb-1">
            Email Address <span className="text-[#E53935]">*</span>
          </label>
          <input
            type="email"
            required
            placeholder="e.g. rahul@nexgenai.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="nexgen-input"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#172017] mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="e.g. +91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="nexgen-input"
          />
        </div>

        {!editingWorker && (
          <div>
            <label className="block text-xs font-bold text-[#172017] mb-1">
              Temporary Password <span className="text-[#E53935]">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="nexgen-input"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#172017] mb-1">
            Daily Target (Calls / Day) <span className="text-[#E53935]">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={200}
            required
            value={dailyTarget}
            onChange={(e) => setDailyTarget(Number(e.target.value))}
            className="nexgen-input"
          />
          <span className="text-[11px] text-[#6B756D] mt-1 block">Default company quota is 15 calls.</span>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E5E9E5]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            loadingText={editingWorker ? 'SAVING...' : 'CREATING...'}
          >
            {editingWorker ? 'UPDATE WORKER' : 'CREATE WORKER'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
