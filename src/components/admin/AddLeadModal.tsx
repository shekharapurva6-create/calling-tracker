import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { dataStore } from '../../services/storage/dataStore';
import { LeadPriority, UserProfile } from '../../types';
import { showToast } from '../common/Toast';
import { supabase, isSupabaseConfigured } from '../../services/supabase/supabaseClient';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  workers: UserProfile[];
  onLeadAdded: () => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  workers,
  onLeadAdded,
}) => {
  const [clientName, setClientName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [assignedWorkerId, setAssignedWorkerId] = useState('');
  const [priority, setPriority] = useState<LeadPriority>('MEDIUM');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setClientName('');
    setBusinessName('');
    setPhoneNumber('');
    setCity('');
    setBusinessType('');
    setAssignedWorkerId('');
    setPriority('MEDIUM');
    setNotes('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!clientName.trim()) {
      setError('Client Name is required.');
      return;
    }

    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone) {
      setError('Phone Number is required.');
      return;
    }

    // Basic format check (allow +91, dashes, spaces, 10-14 digits)
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits).');
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      try {
        const result = dataStore.createLead({
          clientName: clientName.trim(),
          businessName: businessName.trim() || undefined,
          phoneNumber: cleanPhone,
          city: city.trim() || undefined,
          businessType: businessType.trim() || undefined,
          assignedWorkerId: assignedWorkerId || undefined,
          priority,
          notes: notes.trim() || undefined,
          status: 'NEW',
          sendEmailSheet: true,
        });

        // CRITICAL FIX: Also insert the lead into Supabase.
        // The Worker Dashboard queries Supabase directly, so the lead
        // must exist in Supabase for the worker to see it.
        if (isSupabaseConfigured()) {
          try {
            const { error: supaErr } = await supabase.from('leads').upsert({
              id: result.lead.id,
              client_name: result.lead.clientName,
              business_name: result.lead.businessName || null,
              phone_number: result.lead.phoneNumber,
              city: result.lead.city || null,
              business_type: result.lead.businessType || null,
              priority: result.lead.priority,
              notes: result.lead.notes || null,
              status: result.lead.status,
              assigned_worker_id: result.lead.assignedWorkerId || null,
              created_at: result.lead.createdAt,
              updated_at: result.lead.updatedAt,
            });
            if (supaErr) {
              console.error('Supabase lead insert error:', supaErr);
            }
          } catch (e) {
            console.warn('Could not insert lead into Supabase:', e);
          }
        }

        if (result.emailDispatch) {
          const selectedWorker = workers.find((w) => w.id === assignedWorkerId);
          showToast(
            `✓ Lead added & sent sheet to ${selectedWorker?.email || 'worker'}`,
            'success',
            'Lead & Email Dispatched'
          );
        } else {
          showToast('Lead added successfully', 'success');
        }

        onLeadAdded();
        handleClose();
      } catch (err: any) {
        setError(err.message || 'Failed to add lead. Check for duplicates.');
      } finally {
        setIsLoading(false);
      }
    }, 250);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Lead"
      subtitle="Enter client and business details to register or assign a lead"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Client & Business */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-[#172017] mb-1">
              Client Name <span className="text-[#E53935]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Raj Kumar"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="nexgen-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172017] mb-1">
              Business Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. ABC Coaching"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="nexgen-input"
            />
          </div>
        </div>

        {/* Phone & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-[#172017] mb-1">
              Phone Number <span className="text-[#E53935]">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. +91 98234 11021"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="nexgen-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172017] mb-1">
              City
            </label>
            <input
              type="text"
              placeholder="e.g. Saharsa, Patna, Delhi"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="nexgen-input"
            />
          </div>
        </div>

        {/* Business Type & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-[#172017] mb-1">
              Business Type
            </label>
            <input
              type="text"
              placeholder="e.g. Education, Retail, Gym"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="nexgen-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172017] mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as LeadPriority)}
              className="nexgen-input"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        {/* Assign Worker */}
        <div>
          <label className="block text-xs font-bold text-[#172017] mb-1">
            Assign Worker (Optional)
          </label>
          <select
            value={assignedWorkerId}
            onChange={(e) => setAssignedWorkerId(e.target.value)}
            className="nexgen-input"
          >
            <option value="">-- Leave Unassigned --</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.fullName} ({w.email})
              </option>
            ))}
          </select>
          {assignedWorkerId && (
            <div className="mt-2 p-2.5 bg-[#E9F9EF] rounded-xl border border-[#16C763]/30 text-[11px] text-[#0BAA45] font-semibold flex items-center gap-1.5">
              <span>📧 Automated notification email & CSV lead sheet will be sent to the assigned worker's inbox.</span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-[#172017] mb-1">
            Notes (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Context or inquiry details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="nexgen-input resize-none"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E5E9E5]">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            loadingText="ADDING..."
          >
            ADD LEAD
          </Button>
        </div>
      </form>
    </Modal>
  );
};
