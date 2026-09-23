import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Lead } from '../../types';
import { LeadStatusBadge, PriorityBadge } from '../common/Badge';
import { Phone, MapPin, Building2, User, ChevronDown } from 'lucide-react';
import { useTelephony } from '../../contexts/TelephonyContext';

interface WorkerLeadCardProps {
  lead: Lead;
  workerId: string;
}

export const WorkerLeadCard: React.FC<WorkerLeadCardProps> = ({ lead, workerId }) => {
  const { initiateCall } = useTelephony();
  const [isCalling, setIsCalling] = useState(false);
  const [showSimOptions, setShowSimOptions] = useState(false);

  const handleCall = async (outcomeOverride?: 'CONNECTED' | 'NO_ANSWER' | 'BUSY' | 'FAILED') => {
    setIsCalling(true);
    try {
      await initiateCall(lead, workerId, outcomeOverride);
    } catch (e) {
      console.error('Call failed', e);
    } finally {
      setIsCalling(false);
      setShowSimOptions(false);
    }
  };

  return (
    <Card className="p-4 sm:p-5 bg-white border border-[#E5E9E5] rounded-2xl shadow-card transition-all hover:shadow-card-hover">
      {/* Top Details & Badges */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div>
          {lead.businessName && (
            <h3 className="text-base sm:text-lg font-extrabold text-[#172017] leading-snug">
              {lead.businessName}
            </h3>
          )}
          <div className="flex items-center gap-1.5 text-sm font-semibold text-[#172017] mt-0.5">
            <User className="w-3.5 h-3.5 text-[#6B756D]" />
            <span>{lead.clientName}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <PriorityBadge priority={lead.priority} size="sm" />
          <LeadStatusBadge status={lead.status} size="sm" />
        </div>
      </div>

      {/* Meta info: City and Phone */}
      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#6B756D] mb-4 font-medium">
        {lead.city && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#0BAA45]" />
            <span>{lead.city}</span>
          </div>
        )}
        <div className="flex items-center gap-1 font-mono text-[#172017] font-semibold text-xs sm:text-sm">
          <Phone className="w-3.5 h-3.5 text-[#6B756D]" />
          <span>{lead.phoneNumber}</span>
        </div>
      </div>

      {/* Notes (if any) */}
      {lead.notes && (
        <div className="p-2.5 bg-[#F7F8F6] rounded-xl text-xs text-[#6B756D] mb-4 border border-[#E5E9E5]/60 italic">
          "{lead.notes}"
        </div>
      )}

      {/* Primary Action: CALL NOW Button (min 52px height) */}
      <div className="space-y-1.5">
        <button
          type="button"
          disabled={isCalling}
          onClick={() => handleCall('CONNECTED')}
          className="w-full h-[54px] min-h-[52px] bg-[#0BAA45] hover:bg-[#09933B] active:scale-[0.98] text-white font-extrabold text-base rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 select-none"
        >
          <Phone className="w-5 h-5 fill-current animate-pulse" />
          <span>{isCalling ? 'CONNECTING...' : 'CALL NOW'}</span>
        </button>

        {/* Telephony Simulator Edge-cases Dropdown for thorough testing */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setShowSimOptions(!showSimOptions)}
            className="text-[11px] text-[#6B756D] hover:text-[#0BAA45] inline-flex items-center gap-1 font-medium transition-colors"
          >
            <span>Simulate other telephony outcomes</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showSimOptions ? 'rotate-180' : ''}`} />
          </button>

          {showSimOptions && (
            <div className="mt-2 p-2 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl grid grid-cols-3 gap-1.5 text-xs animate-in zoom-in-95">
              <button
                type="button"
                onClick={() => handleCall('NO_ANSWER')}
                className="px-2 py-1.5 bg-white hover:bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB] rounded-lg font-bold text-[11px]"
              >
                No Answer
              </button>
              <button
                type="button"
                onClick={() => handleCall('BUSY')}
                className="px-2 py-1.5 bg-white hover:bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] rounded-lg font-bold text-[11px]"
              >
                Busy
              </button>
              <button
                type="button"
                onClick={() => handleCall('FAILED')}
                className="px-2 py-1.5 bg-white hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] rounded-lg font-bold text-[11px]"
              >
                Failed
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
