import React, { useState, useEffect } from 'react';
import { MetricCard } from '../../components/admin/MetricCard';
import { TeamPerformanceList } from '../../components/admin/TeamPerformanceList';
import { Card } from '../../components/common/Card';
import { CallStatusBadge } from '../../components/common/Badge';
import { dataStore, subscribeToStore } from '../../services/storage/dataStore';
import { CallLog, WorkerPerformance } from '../../types';
import { Users2, PhoneCall, CheckCircle2, Clock, Calendar, ArrowRight } from 'lucide-react';

interface AdminDashboardProps {
  onNavigateToLeads: () => void;
  onNavigateToCalls: () => void;
  onNavigateToWorkers: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToLeads,
  onNavigateToCalls,
  onNavigateToWorkers,
}) => {
  const [metrics, setMetrics] = useState(() => dataStore.getAdminDashboardMetrics());
  const [workersPerf, setWorkersPerf] = useState<WorkerPerformance[]>(() =>
    dataStore.getAllWorkersPerformance()
  );
  const [recentCalls, setRecentCalls] = useState<CallLog[]>(() =>
    dataStore.getCallLogs().slice(0, 7)
  );

  const refreshData = () => {
    setMetrics(dataStore.getAdminDashboardMetrics());
    setWorkersPerf(dataStore.getAllWorkersPerformance());
    setRecentCalls(dataStore.getCallLogs().slice(0, 7));
  };

  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

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
      return '10:42 AM';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-[#E5E9E5]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172017] tracking-tight">
            {getGreeting()} 👋
          </h1>
          <p className="text-sm text-[#6B756D] mt-0.5 font-medium">
            Manage your telecalling team and leads.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#E5E9E5] rounded-xl text-xs font-bold text-[#172017] shadow-xs self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-[#0BAA45]" />
          <span>{todayFormatted}</span>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <MetricCard
          label="Total Leads"
          value={metrics.totalLeads}
          icon={<Users2 className="w-5 h-5" />}
          accentColor="#0BAA45"
        />
        <MetricCard
          label="Calls Today"
          value={metrics.callsToday}
          icon={<PhoneCall className="w-5 h-5" />}
          accentColor="#0BAA45"
        />
        <MetricCard
          label="Connected"
          value={metrics.connectedToday}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="#16C763"
        />
        <MetricCard
          label="Pending Calls"
          value={metrics.pendingCalls}
          icon={<Clock className="w-5 h-5" />}
          accentColor="#F59E0B"
        />
      </div>

      {/* Team Performance Section */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-lg font-bold text-[#172017] tracking-tight">
              Today's Team Performance
            </h2>
            <p className="text-xs text-[#6B756D]">Real-time daily quota and target tracking</p>
          </div>

          <button
            onClick={onNavigateToWorkers}
            className="text-xs font-bold text-[#0BAA45] hover:text-[#09933B] flex items-center gap-1 transition-colors"
          >
            <span>Manage Workers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <TeamPerformanceList
          workers={workersPerf}
          onViewWorker={onNavigateToWorkers}
        />
      </div>

      {/* Recent Calls Section */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-lg font-bold text-[#172017] tracking-tight">Recent Calls</h2>
            <p className="text-xs text-[#6B756D]">Latest live telecaller activity across all workers</p>
          </div>

          <button
            onClick={onNavigateToCalls}
            className="text-xs font-bold text-[#0BAA45] hover:text-[#09933B] flex items-center gap-1 transition-colors"
          >
            <span>View All Calls</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7F8F6] text-[#6B756D] font-bold border-b border-[#E5E9E5] text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Worker</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9E5]">
                {recentCalls.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#6B756D]">
                      No calls recorded yet today.
                    </td>
                  </tr>
                ) : (
                  recentCalls.map((call) => (
                    <tr key={call.id} className="hover:bg-[#F7F8F6]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#172017]">
                        {call.workerName || 'Telecaller'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#172017]">{call.clientName || 'Client'}</div>
                        {call.businessName && (
                          <div className="text-[11px] text-[#6B756D]">{call.businessName}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-[#172017]">
                        {call.phoneNumber}
                      </td>
                      <td className="py-3 px-4">
                        <CallStatusBadge status={call.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-xs text-[#6B756D]">
                        {formatTime(call.startedAt || call.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-xs text-[#172017]">
                        {formatDuration(call.durationSeconds)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
