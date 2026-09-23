import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { MetricCard } from '../../components/admin/MetricCard';
import { dataStore, subscribeToStore } from '../../services/storage/dataStore';
import { WorkerPerformance } from '../../types';
import {
  PhoneCall,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminPerformance: React.FC = () => {
  const [workersPerf, setWorkersPerf] = useState<WorkerPerformance[]>(() =>
    dataStore.getAllWorkersPerformance()
  );

  const refreshData = () => {
    setWorkersPerf(dataStore.getAllWorkersPerformance());
  };

  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, []);

  // Aggregated KPIs
  const totalCalls = workersPerf.reduce((acc, curr) => acc + curr.callsToday, 0);
  const totalConnected = workersPerf.reduce((acc, curr) => acc + curr.connectedToday, 0);
  const totalNoAnswer = workersPerf.reduce((acc, curr) => acc + curr.noAnswerToday, 0);
  const totalBusy = workersPerf.reduce((acc, curr) => acc + curr.busyToday, 0);
  const totalFailed = workersPerf.reduce((acc, curr) => acc + curr.failedToday, 0);
  const totalNotConnected = totalNoAnswer + totalBusy + totalFailed;

  const overallConnectionRate =
    totalCalls > 0 ? Number(((totalConnected / totalCalls) * 100).toFixed(1)) : 0;

  const validDurations = workersPerf
    .filter((w) => w.avgDurationSeconds > 0)
    .map((w) => w.avgDurationSeconds);
  const avgDuration =
    validDurations.length > 0
      ? Math.round(validDurations.reduce((a, b) => a + b, 0) / validDurations.length)
      : 0;

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder}s`;
  };

  // Data for Bar Chart: Calls vs Connected per worker
  const barChartData = workersPerf.map((w) => ({
    name: w.workerName.split(' ')[0],
    Calls: w.callsToday,
    Connected: w.connectedToday,
    Target: w.dailyTarget,
  }));

  // Data for Pie Chart: Call Outcomes Breakdown
  const pieChartData = [
    { name: 'Connected', value: totalConnected || 1, color: '#0BAA45' },
    { name: 'No Answer', value: totalNoAnswer || 0, color: '#9CA3AF' },
    { name: 'Busy', value: totalBusy || 0, color: '#F59E0B' },
    { name: 'Failed', value: totalFailed || 0, color: '#E53935' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-[#E5E9E5]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172017] tracking-tight">
          Team Performance
        </h1>
        <p className="text-sm text-[#6B756D] mt-0.5">
          Real-time calling metrics, quota completion, and connection efficiency
        </p>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <MetricCard
          label="Total Calls"
          value={totalCalls}
          icon={<PhoneCall className="w-5 h-5" />}
          accentColor="#0BAA45"
        />
        <MetricCard
          label="Connected"
          value={totalConnected}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="#16C763"
        />
        <MetricCard
          label="Connection Rate"
          value={`${overallConnectionRate}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="#0BAA45"
        />
        <MetricCard
          label="Avg Call Duration"
          value={formatDuration(avgDuration)}
          icon={<Clock className="w-5 h-5" />}
          accentColor="#172017"
        />
      </div>

      {/* Two Clean Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Worker Calls vs Connected */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#172017]">Daily Calls vs Target</h3>
            <p className="text-xs text-[#6B756D]">Calls attempted and connected by each worker today</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#6B756D" fontSize={12} tickLine={false} />
                <YAxis stroke="#6B756D" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E5E9E5',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Calls" fill="#172017" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="Connected" fill="#0BAA45" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Call Status Distribution */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#172017]">Connected vs Not Connected</h3>
            <p className="text-xs text-[#6B756D]">Telecom connection outcome distribution</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} calls`, name]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E5E9E5',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Worker Comparison Table */}
      <div>
        <div className="mb-3">
          <h2 className="text-lg font-bold text-[#172017] tracking-tight">Worker Comparison Table</h2>
          <p className="text-xs text-[#6B756D]">Detailed breakdown of worker efficiency and daily quota status</p>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7F8F6] text-[#6B756D] font-bold border-b border-[#E5E9E5] text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Worker</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Calls</th>
                  <th className="py-3 px-4">Connected</th>
                  <th className="py-3 px-4">Remaining</th>
                  <th className="py-3 px-4">Connection Rate</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9E5]">
                {workersPerf.map((w) => {
                  const isCompleted = w.callsToday >= w.dailyTarget;
                  return (
                    <tr key={w.workerId} className="hover:bg-[#F7F8F6]/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#172017]">
                        {w.workerName}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#6B756D]">
                        {w.dailyTarget}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#172017]">
                        {w.callsToday}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#0BAA45]">
                        {w.connectedToday}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#6B756D]">
                        {w.remainingCalls}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#172017]">
                        {w.connectionRate}%
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#E9F9EF] text-[#0BAA45] rounded-lg text-xs font-bold border border-[#16C763]/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Target Done</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFFBEB] text-[#B45309] rounded-lg text-xs font-bold border border-[#FDE68A]">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>In Progress</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
