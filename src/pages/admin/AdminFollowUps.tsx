import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { dataStore, subscribeToStore } from '../../services/storage/dataStore';
import { FollowUp } from '../../types';
import { Clock, Calendar, Phone, CheckCircle2, UserCheck } from 'lucide-react';

export const AdminFollowUps: React.FC = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>(() => dataStore.getFollowUps());

  const refreshData = () => {
    setFollowUps(dataStore.getFollowUps());
  };

  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, []);

  const formatDateTime = (isoString: string) => {
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-[#E5E9E5]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172017] tracking-tight">
          Follow-ups
        </h1>
        <p className="text-sm text-[#6B756D] mt-0.5">
          Track scheduled client callbacks and follow-up requests ({followUps.length} total)
        </p>
      </div>

      {/* Follow-ups List */}
      <div className="space-y-3">
        {followUps.length === 0 ? (
          <Card className="p-12 text-center text-[#6B756D]">
            <Clock className="w-10 h-10 text-[#6B756D]/40 mx-auto mb-2" />
            <div className="text-sm font-bold text-[#172017]">No follow-ups scheduled</div>
            <p className="text-xs mt-1">Workers create follow-ups when clients request callbacks.</p>
          </Card>
        ) : (
          followUps.map((fup) => (
            <Card key={fup.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#172017]">{fup.clientName}</h3>
                  {fup.businessName && (
                    <span className="text-xs font-semibold text-[#6B756D] bg-[#F7F8F6] px-2 py-0.5 rounded-md border border-[#E5E9E5]">
                      {fup.businessName}
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                    {fup.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B756D]">
                  <div className="flex items-center gap-1 font-mono text-[#172017] font-semibold">
                    <Phone className="w-3.5 h-3.5 text-[#6B756D]" />
                    <span>{fup.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-[#0BAA45]">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Assigned: {fup.workerName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#172017] font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-[#0BAA45]" />
                    <span>Scheduled for: {formatDateTime(fup.followUpAt)}</span>
                  </div>
                </div>

                {fup.note && (
                  <p className="text-xs text-[#4B5563] bg-[#F7F8F6] p-2.5 rounded-xl border border-[#E5E9E5]/60 italic">
                    "{fup.note}"
                  </p>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
