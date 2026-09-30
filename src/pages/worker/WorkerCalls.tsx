import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { CallStatusBadge } from '../../components/common/Badge';
import { dataStore, subscribeToStore } from '../../services/storage/dataStore';
import { CallLog } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { PhoneCall } from 'lucide-react';

export const WorkerCalls: React.FC = () => {
  const { user, currentWorkerId } = useAuth();
  const workerId = currentWorkerId || user?.id || '';

  const [calls, setCalls] = useState<CallLog[]>(() =>
    workerId ? dataStore.getCallLogs(workerId) : []
  );

  const refreshData = () => {
    if (!workerId) return;
    setCalls(dataStore.getCallLogs(workerId));
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeToStore(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, [workerId]);

  if (!workerId) {
    return null;
  }

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '-';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } catch {
      return '-';
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-24 animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172017] tracking-tight">
            My Call History
          </h1>
          <p className="text-xs text-[#6B756D]">
            Automated telecom logs for your account ({calls.length} calls recorded)
          </p>
        </div>
      </div>

      {calls.length === 0 ? (
        <div className="p-8 text-center bg-white border border-[#E5E9E5] rounded-2xl shadow-card">
          <PhoneCall className="w-10 h-10 text-[#6B756D]/30 mx-auto mb-2" />
          <div className="text-base font-bold text-[#172017]">No calls recorded yet today.</div>
          <p className="text-xs text-[#6B756D] mt-1">
            Click "CALL NOW" on any assigned lead to begin your first call.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {calls.map((call) => (
            <Card key={call.id} className="p-4 flex items-center justify-between gap-3 hover:shadow-card-hover transition-all">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#172017] truncate">
                    {call.clientName || 'Client'}
                  </h3>
                  {call.businessName && (
                    <span className="text-[11px] text-[#6B756D] truncate">
                      • {call.businessName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-[#6B756D] font-mono">
                  <span>{call.phoneNumber}</span>
                  <span>•</span>
                  <span>{formatDate(call.startedAt || call.createdAt)}</span>
                  <span>{formatTime(call.startedAt || call.createdAt)}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <CallStatusBadge status={call.status} size="sm" />
                <span className="text-xs font-mono font-bold text-[#172017]">
                  {formatDuration(call.durationSeconds)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
