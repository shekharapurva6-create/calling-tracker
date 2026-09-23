import React, { useState, useEffect } from 'react';
import { WorkerTargetCard } from '../../components/worker/WorkerTargetCard';
import { WorkerLeadCard } from '../../components/worker/WorkerLeadCard';
import { dataStore, subscribeToStore } from '../../services/storage/dataStore';
import { Lead, WorkerPerformance } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { PhoneCall, Sparkles, Filter, Search } from 'lucide-react';

export const WorkerDashboard: React.FC = () => {
  const { user } = useAuth();
  const workerId = user?.id || 'usr_worker_rahul';

  const [leads, setLeads] = useState<Lead[]>(() => dataStore.getLeads(workerId));
  const [performance, setPerformance] = useState<WorkerPerformance>(() =>
    dataStore.getWorkerPerformance(workerId)
  );
  const [searchQuery, setSearchQuery] = useState('');

  const refreshData = () => {
    setLeads(dataStore.getLeads(workerId));
    setPerformance(dataStore.getWorkerPerformance(workerId));
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeToStore(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, [workerId]);

  const filteredLeads = leads.filter((lead) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      lead.clientName.toLowerCase().includes(q) ||
      (lead.businessName && lead.businessName.toLowerCase().includes(q)) ||
      lead.phoneNumber.includes(q) ||
      (lead.city && lead.city.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-24 animate-in fade-in duration-200">
      
      {/* Target Progress Card */}
      <WorkerTargetCard performance={performance} />

      {/* Assigned Leads Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0BAA45]" />
            <h2 className="text-lg font-extrabold text-[#172017] tracking-tight">MY LEADS</h2>
            <span className="text-xs font-bold text-[#0BAA45] bg-[#E9F9EF] px-2.5 py-0.5 rounded-full">
              {leads.length} assigned
            </span>
          </div>
        </div>

        {/* Quick Search */}
        {leads.length > 3 && (
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search assigned leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nexgen-input pl-10 py-2 text-xs"
            />
          </div>
        )}

        {/* Lead Cards List */}
        {filteredLeads.length === 0 ? (
          <div className="p-8 text-center bg-white border border-[#E5E9E5] rounded-2xl shadow-card">
            <PhoneCall className="w-10 h-10 text-[#6B756D]/30 mx-auto mb-2" />
            <div className="text-base font-bold text-[#172017]">No leads assigned yet.</div>
            <p className="text-xs text-[#6B756D] mt-1">
              Your administrator will assign leads to your account shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredLeads.map((lead) => (
              <WorkerLeadCard key={lead.id} lead={lead} workerId={workerId} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
