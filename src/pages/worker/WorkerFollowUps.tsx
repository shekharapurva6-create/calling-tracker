import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { dataStore, subscribeToStore } from '../../services/storage/dataStore';
import { FollowUp } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useTelephony } from '../../contexts/TelephonyContext';
import { Clock, Calendar, Phone, CheckCircle2, User } from 'lucide-react';

export const WorkerFollowUps: React.FC = () => {
  const { user } = useAuth();
  const { initiateCall } = useTelephony();
  const workerId = user?.id || 'usr_worker_rahul';

  const [followUps, setFollowUps] = useState<FollowUp[]>(() => dataStore.getFollowUps(workerId));

  const refreshData = () => {
    setFollowUps(dataStore.getFollowUps(workerId));
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeToStore(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, [workerId]);

  const handleCallFollowUp = (fup: FollowUp) => {
    const lead = dataStore.getLeadById(fup.leadId);
    if (lead) {
      initiateCall(lead, workerId);
    } else {
      initiateCall(
        {
          id: fup.leadId,
          clientName: fup.clientName || 'Client',
          businessName: fup.businessName,
          phoneNumber: fup.phoneNumber || '+91 99999 99999',
          priority: 'HIGH',
          status: 'FOLLOW-UP',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        workerId
      );
    }
  };

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
    <div className="space-y-4 max-w-2xl mx-auto pb-24 animate-in fade-in duration-200">
      <div className="pb-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#172017] tracking-tight">
          Today's Follow-ups ({followUps.length})
        </h1>
        <p className="text-xs text-[#6B756D]">
          Scheduled client callbacks and appointments
        </p>
      </div>

      {followUps.length === 0 ? (
        <div className="p-8 text-center bg-white border border-[#E5E9E5] rounded-2xl shadow-card">
          <Clock className="w-10 h-10 text-[#6B756D]/30 mx-auto mb-2" />
          <div className="text-base font-bold text-[#172017]">No follow-ups for today.</div>
          <p className="text-xs text-[#6B756D] mt-1">
            When completing calls, mark clients as "Follow-up" to schedule automatic callbacks.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {followUps.map((fup) => (
            <Card key={fup.id} className="p-4 space-y-3 hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#172017]">{fup.clientName}</h3>
                  {fup.businessName && (
                    <div className="text-xs text-[#6B756D] font-medium">{fup.businessName}</div>
                  )}
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                  {fup.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B756D]">
                <div className="flex items-center gap-1 font-mono text-[#172017] font-semibold">
                  <Phone className="w-3.5 h-3.5 text-[#0BAA45]" />
                  <span>{fup.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-1 text-[#172017] font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Scheduled: {formatDateTime(fup.followUpAt)}</span>
                </div>
              </div>

              {fup.note && (
                <div className="p-2.5 bg-[#F7F8F6] rounded-xl text-xs text-[#6B756D] border border-[#E5E9E5]/60 italic">
                  "{fup.note}"
                </div>
              )}

              {/* Direct Call Button (min 52px height) */}
              <button
                type="button"
                onClick={() => handleCallFollowUp(fup)}
                className="w-full h-[52px] min-h-[52px] bg-[#0BAA45] hover:bg-[#09933B] active:scale-[0.98] text-white font-extrabold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>CALL NOW</span>
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
