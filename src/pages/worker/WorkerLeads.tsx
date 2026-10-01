import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WorkerLeadCard } from '../../components/worker/WorkerLeadCard';
import { Card } from '../../components/common/Card';
import { dataStore, subscribeToStore } from '../../services/storage/dataStore';
import { Lead } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Search, PhoneCall } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../services/supabase/supabaseClient';

// Maps a Supabase leads row to our Lead type
function mapSupabaseLead(row: any): Lead {
  return {
    id: row.id,
    clientName: row.client_name,
    businessName: row.business_name ?? undefined,
    phoneNumber: row.phone_number,
    city: row.city ?? undefined,
    businessType: row.business_type ?? undefined,
    priority: row.priority ?? 'MEDIUM',
    notes: row.notes ?? undefined,
    status: row.status ?? 'NEW',
    assignedWorkerId: row.assigned_worker_id ?? undefined,
    assignedWorkerName: undefined,
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const WorkerLeads: React.FC = () => {
  const { user, currentWorkerId, isLoading: authLoading } = useAuth();
  const workerId = currentWorkerId || user?.id || '';

  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [leadsLoading, setLeadsLoading] = useState(true);

  const workerIdRef = useRef(workerId);
  useEffect(() => { workerIdRef.current = workerId; }, [workerId]);

  /**
   * CORE FIX: Fetch leads using the correct source.
   * Same dual-mode approach as WorkerDashboard.
   */
  const fetchLeads = useCallback(async () => {
    const wid = workerIdRef.current;
    if (!wid) {
      setLeads([]);
      setLeadsLoading(false);
      return;
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('assigned_worker_id', wid)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Supabase leads fetch error:', error);
          setLeads(dataStore.getLeads(wid));
        } else {
          setLeads((data ?? []).map(mapSupabaseLead));
        }
      } catch (e) {
        console.error('Unexpected leads fetch error:', e);
        setLeads(dataStore.getLeads(wid));
      }
    } else {
      setLeads(dataStore.getLeads(wid));
    }

    setLeadsLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!workerId) {
      setLeads([]);
      setLeadsLoading(false);
      return;
    }
    setLeadsLoading(true);
    fetchLeads();
  }, [workerId, authLoading, fetchLeads]);

  useEffect(() => {
    if (!workerId) return;
    const unsubscribe = subscribeToStore(() => {
      fetchLeads();
    });
    return () => unsubscribe();
  }, [workerId, fetchLeads]);

  // Supabase Realtime subscription for live updates
  useEffect(() => {
    if (!workerId || !isSupabaseConfigured()) return;

    const channel = supabase
      .channel(`worker-leads-list-${workerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `assigned_worker_id=eq.${workerId}`,
        },
        () => {
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workerId, fetchLeads]);

  if (authLoading || !workerId) {
    return null;
  }

  const filteredLeads = leads.filter((lead) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      lead.clientName.toLowerCase().includes(q) ||
      (lead.businessName && lead.businessName.toLowerCase().includes(q)) ||
      lead.phoneNumber.includes(q) ||
      (lead.city && lead.city.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (statusFilter !== 'ALL' && lead.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && lead.priority !== priorityFilter) return false;

    return true;
  });

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#172017] tracking-tight">
          Assigned Leads ({leads.length})
        </h1>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3.5 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by client, business, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nexgen-input pl-10 py-2 text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="nexgen-input py-1.5 text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CALLED">Called</option>
            <option value="CONNECTED">Connected</option>
            <option value="FOLLOW-UP">Follow-up</option>
            <option value="INTERESTED">Interested</option>
            <option value="CONVERTED">Converted</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="nexgen-input py-1.5 text-xs"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </Card>

      {/* Leads List */}
      {leadsLoading ? (
        <div className="p-8 text-center bg-white border border-[#E5E9E5] rounded-2xl shadow-card">
          <div className="text-sm font-bold text-[#6B756D]">Loading your assigned leads...</div>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-8 text-center bg-white border border-[#E5E9E5] rounded-2xl shadow-card">
          <PhoneCall className="w-10 h-10 text-[#6B756D]/30 mx-auto mb-2" />
          <div className="text-base font-bold text-[#172017]">No leads matching filters</div>
          <p className="text-xs text-[#6B756D] mt-1">Try resetting the status or priority filters.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredLeads.map((lead) => (
            <WorkerLeadCard key={lead.id} lead={lead} workerId={workerId} />
          ))}
        </div>
      )}
    </div>
  );
};
