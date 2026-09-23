import React, { useState } from 'react';
import { CheckCircle2, Calendar, Clock, Sparkles } from 'lucide-react';
import { useTelephony } from '../../contexts/TelephonyContext';
import { LeadStatus } from '../../types';
import { Button } from '../common/Button';
import { showToast } from '../common/Toast';

export const CallOutcomeModal: React.FC = () => {
  const { completedSession, isOutcomeModalOpen, saveCallOutcome, closeOutcomeModal } = useTelephony();

  const [selectedOutcome, setSelectedOutcome] = useState<LeadStatus>('INTERESTED');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOutcomeModalOpen || !completedSession) return null;

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      saveCallOutcome(
        selectedOutcome,
        notes.trim() || undefined,
        selectedOutcome === 'FOLLOW-UP' ? new Date(followUpDate).toISOString() : undefined
      );
      setIsSaving(false);
      showToast(
        selectedOutcome === 'FOLLOW-UP' ? 'Follow-up scheduled successfully' : 'Call outcome saved successfully',
        'success'
      );
    }, 300);
  };

  const outcomeOptions: Array<{ id: LeadStatus; label: string; desc: string; color: string; border: string }> = [
    {
      id: 'INTERESTED',
      label: 'Interested',
      desc: 'Client is keen to proceed with service',
      color: 'bg-[#E9F9EF] text-[#0BAA45]',
      border: 'border-[#16C763]',
    },
    {
      id: 'FOLLOW-UP',
      label: 'Follow-up',
      desc: 'Requested callback at specific time',
      color: 'bg-[#FFFBEB] text-[#B45309]',
      border: 'border-[#F59E0B]',
    },
    {
      id: 'NOT_INTERESTED',
      label: 'Not Interested',
      desc: 'Declined offer or not relevant',
      color: 'bg-[#FEE2E2] text-[#DC2626]',
      border: 'border-[#E53935]',
    },
    {
      id: 'CONVERTED',
      label: 'Converted',
      desc: 'Deal closed / onboarded successfully',
      color: 'bg-[#F3E8FF] text-[#7E22CE]',
      border: 'border-[#9333EA]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172017]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5E9E5] overflow-hidden p-6 animate-in zoom-in-95 duration-200">
        
        {/* Header Summary */}
        <div className="text-center pb-5 border-b border-[#E5E9E5]">
          <div className="w-12 h-12 rounded-full bg-[#E9F9EF] text-[#0BAA45] flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#172017]">Call Completed</h2>
          <p className="text-xs text-[#6B756D] mt-1 font-medium">
            With <span className="font-semibold text-[#172017]">{completedSession.clientName}</span>
            {completedSession.businessName ? ` (${completedSession.businessName})` : ''}
          </p>

          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-[#F7F8F6] rounded-lg border border-[#E5E9E5] text-xs font-semibold text-[#172017]">
            <Clock className="w-3.5 h-3.5 text-[#0BAA45]" />
            <span>Duration: {formatDuration(completedSession.durationSeconds)}</span>
          </div>
        </div>

        {/* Outcome Selector */}
        <div className="mt-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6B756D] mb-2.5">
            Select Lead Outcome
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {outcomeOptions.map((opt) => {
              const isSelected = selectedOutcome === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedOutcome(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? `${opt.color} ${opt.border} ring-2 ring-offset-1 ring-[#0BAA45]/30 font-bold shadow-sm`
                      : 'border-[#E5E9E5] bg-white text-[#172017] hover:bg-[#F7F8F6]'
                  }`}
                >
                  <div className="text-sm font-bold flex items-center justify-between">
                    <span>{opt.label}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  <div className="text-[11px] opacity-80 mt-1 leading-tight font-normal">
                    {opt.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Follow up Date/Time Input if FOLLOW-UP is selected */}
        {selectedOutcome === 'FOLLOW-UP' && (
          <div className="mt-4 p-3.5 bg-[#FFFBEB] rounded-xl border border-[#FDE68A] animate-in slide-in-from-top-2 duration-200">
            <label className="block text-xs font-bold text-[#B45309] mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Follow-up Date & Time
            </label>
            <input
              type="datetime-local"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#FDE68A] rounded-lg text-sm text-[#172017] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            />
          </div>
        )}

        {/* Call Notes */}
        <div className="mt-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6B756D] mb-1.5">
            Call Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Brief notes from this conversation..."
            className="w-full px-3 py-2 bg-white border border-[#E5E9E5] rounded-xl text-sm text-[#172017] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0BAA45]/30 focus:border-[#0BAA45] resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={closeOutcomeModal}
            className="w-1/3"
          >
            Skip
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            loadingText="SAVING..."
            className="w-2/3 h-11 text-sm font-bold"
            icon={<Sparkles className="w-4 h-4" />}
          >
            SAVE OUTCOME
          </Button>
        </div>

      </div>
    </div>
  );
};
