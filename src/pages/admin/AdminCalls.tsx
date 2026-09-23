import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CallStatusBadge } from '../../components/common/Badge';
import { dataStore, subscribeToStore } from '../../services/storage/dataStore';
import { CallLog, CallStatus, UserProfile } from '../../types';
import { Search, Download, Filter, PhoneCall, Calendar } from 'lucide-react';
import { showToast } from '../../components/common/Toast';

export const AdminCalls: React.FC = () => {
  const [callLogs, setCallLogs] = useState<CallLog[]>(() => dataStore.getCallLogs());
  const [workers, setWorkers] = useState<UserProfile[]>(() => dataStore.getWorkers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDateRange, setSelectedDateRange] = useState<'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'ALL'>('TODAY');

  const refreshData = () => {
    setCallLogs(dataStore.getCallLogs());
    setWorkers(dataStore.getWorkers());
  };

  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, []);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '-';
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '-';
    }
  };

  // Filter Logic
  const filteredCalls = callLogs.filter((log) => {
    // Search query
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (log.clientName && log.clientName.toLowerCase().includes(q)) ||
      (log.businessName && log.businessName.toLowerCase().includes(q)) ||
      log.phoneNumber.includes(q) ||
      (log.workerName && log.workerName.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    // Worker filter
    if (selectedWorkerId !== 'ALL' && log.workerId !== selectedWorkerId) return false;

    // Status filter
    if (selectedStatus !== 'ALL' && log.status !== selectedStatus) return false;

    // Date range filter
    const logDate = (log.startedAt || log.createdAt).split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    if (selectedDateRange === 'TODAY') {
      if (logDate !== today) return false;
    } else if (selectedDateRange === 'YESTERDAY') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yesterdayStr = y.toISOString().split('T')[0];
      if (logDate !== yesterdayStr) return false;
    } else if (selectedDateRange === 'THIS_WEEK') {
      const now = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      const callDateObj = new Date(log.startedAt || log.createdAt);
      if (callDateObj < weekAgo) return false;
    }

    return true;
  });

  const handleExportCsv = () => {
    if (filteredCalls.length === 0) {
      showToast('No call logs to export', 'warning');
      return;
    }

    const headers = [
      'Worker',
      'Client',
      'Business',
      'Phone Number',
      'Status',
      'Duration (Seconds)',
      'Duration (Formatted)',
      'Date',
      'Time',
      'Call ID',
    ];

    const rows = filteredCalls.map((c) => [
      `"${(c.workerName || '').replace(/"/g, '""')}"`,
      `"${(c.clientName || '').replace(/"/g, '""')}"`,
      `"${(c.businessName || '').replace(/"/g, '""')}"`,
      `"${c.phoneNumber}"`,
      c.status,
      c.durationSeconds,
      formatDuration(c.durationSeconds),
      formatDate(c.startedAt || c.createdAt),
      formatTime(c.startedAt || c.createdAt),
      c.id,
    ]);

    const csvString = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nexgenai_call_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Exported ${filteredCalls.length} call logs to CSV`, 'success');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E9E5]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172017] tracking-tight">
            Call History
          </h1>
          <p className="text-sm text-[#6B756D] mt-0.5">
            Complete automated audit log of every outbound telecaller call ({callLogs.length} total)
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          icon={<Download className="w-3.5 h-3.5" />}
        >
          Export CSV
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="p-4 space-y-3.5">
        <div className="relative">
          <Search className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search client, business, phone or worker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nexgen-input pl-10 h-10 text-sm"
          />
        </div>

        {/* Filter Selectors Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-[#E5E9E5]/60">
          <div>
            <label className="block text-[11px] font-bold text-[#6B756D] uppercase tracking-wider mb-1">
              Filter by Worker
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="nexgen-input py-2 text-xs"
            >
              <option value="ALL">All Workers</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#6B756D] uppercase tracking-wider mb-1">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="nexgen-input py-2 text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONNECTED">Connected</option>
              <option value="NO_ANSWER">No Answer</option>
              <option value="BUSY">Busy</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#6B756D] uppercase tracking-wider mb-1">
              Date Range
            </label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value as any)}
              className="nexgen-input py-2 text-xs"
            >
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="ALL">All Time</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Call History Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F7F8F6] text-[#6B756D] font-bold border-b border-[#E5E9E5] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Worker</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9E5]">
              {filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B756D]">
                    <div className="text-sm font-semibold">No calls found.</div>
                    <p className="text-xs mt-1">Try changing search query or date range filters.</p>
                  </td>
                </tr>
              ) : (
                filteredCalls.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F7F8F6]/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#172017]">{log.clientName || 'Client'}</div>
                      {log.businessName && (
                        <div className="text-[11px] text-[#6B756D]">{log.businessName}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#172017]">
                      {log.workerName || 'Worker'}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[#172017]">
                      {log.phoneNumber}
                    </td>
                    <td className="py-3 px-4">
                      <CallStatusBadge status={log.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-[#6B756D]">
                      {formatDate(log.startedAt || log.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-[#6B756D]">
                      {formatTime(log.startedAt || log.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-xs text-[#172017]">
                      {formatDuration(log.durationSeconds)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
