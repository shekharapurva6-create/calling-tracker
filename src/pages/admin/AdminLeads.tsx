import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LeadStatusBadge, PriorityBadge } from '../../components/common/Badge';
import { AddLeadModal } from '../../components/admin/AddLeadModal';
import { CsvImportModal } from '../../components/admin/CsvImportModal';
import { AssignWorkerModal } from '../../components/admin/AssignWorkerModal';
import { EmailDispatchModal } from '../../components/admin/EmailDispatchModal';
import { dataStore, subscribeToStore } from '../../services/storage/dataStore';
import { Lead, UserProfile, EmailDispatchLog } from '../../types';
import {
  Plus,
  Upload,
  Download,
  Search,
  UserCheck,
  UserX,
  Trash2,
  Filter,
  Mail,
  Send,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { showToast } from '../../components/common/Toast';

export const AdminLeads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>(() => dataStore.getLeads());
  const [workers, setWorkers] = useState<UserProfile[]>(() => dataStore.getWorkers());
  const [emailDispatches, setEmailDispatches] = useState<EmailDispatchLog[]>(() =>
    dataStore.getEmailDispatchLogs()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'ALL' | 'UNASSIGNED' | 'ASSIGNED' | 'CALLED' | 'FOLLOW-UP' | 'CONVERTED'
  >('ALL');

  // Modals state
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [assignModalLead, setAssignModalLead] = useState<Lead | null>(null);

  const refreshData = () => {
    setLeads(dataStore.getLeads());
    setWorkers(dataStore.getWorkers());
    setEmailDispatches(dataStore.getEmailDispatchLogs());
  };

  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, []);

  // Filter & Search Logic
  const filteredLeads = leads.filter((lead) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      lead.clientName.toLowerCase().includes(q) ||
      (lead.businessName && lead.businessName.toLowerCase().includes(q)) ||
      lead.phoneNumber.includes(q) ||
      (lead.city && lead.city.toLowerCase().includes(q)) ||
      (lead.assignedWorkerName && lead.assignedWorkerName.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'UNASSIGNED') return !lead.assignedWorkerId;
    if (activeFilter === 'ASSIGNED') return !!lead.assignedWorkerId;
    if (activeFilter === 'CALLED') return lead.status === 'CALLED' || lead.status === 'CONNECTED';
    if (activeFilter === 'FOLLOW-UP') return lead.status === 'FOLLOW-UP';
    if (activeFilter === 'CONVERTED') return lead.status === 'CONVERTED';

    return true;
  });

  const handleDeleteLead = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete lead "${name}"?`)) {
      dataStore.deleteLead(id);
      showToast('Lead deleted successfully', 'info');
      refreshData();
    }
  };

  const handleUnassignSingleLead = (lead: Lead) => {
    dataStore.unassignLead(lead.id);
    showToast(`Removed assignment for ${lead.clientName}`, 'info');
    refreshData();
  };

  const handleClearAllAssignments = () => {
    if (window.confirm('Remove worker assignments from ALL leads? This will make all leads unassigned.')) {
      const count = dataStore.clearAllAssignments();
      showToast(`✓ Cleared assignments from ${count} leads`, 'success');
      refreshData();
    }
  };

  const handleSendLeadSheet = (lead: Lead) => {
    if (!lead.assignedWorkerId) return;
    const worker = workers.find((w) => w.id === lead.assignedWorkerId);
    const dispatch = dataStore.sendAssignmentEmailAndSheet(lead.assignedWorkerId, [lead.id]);
    if (dispatch) {
      showToast(
        `📧 Dispatched assignment sheet to ${worker?.email || 'worker'}`,
        'success',
        'Email & Sheet Dispatched'
      );
      refreshData();
    }
  };

  const handleExportCsv = () => {
    if (filteredLeads.length === 0) {
      showToast('No leads to export', 'warning');
      return;
    }

    const headers = [
      'Client Name',
      'Business Name',
      'Phone Number',
      'City',
      'Business Type',
      'Priority',
      'Status',
      'Assigned Worker',
      'Notes',
      'Created At',
    ];

    const rows = filteredLeads.map((l) => [
      `"${l.clientName.replace(/"/g, '""')}"`,
      `"${(l.businessName || '').replace(/"/g, '""')}"`,
      `"${l.phoneNumber}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.businessType || '').replace(/"/g, '""')}"`,
      l.priority,
      l.status,
      `"${(l.assignedWorkerName || 'Unassigned').replace(/"/g, '""')}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      l.createdAt,
    ]);

    const csvString = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nexgenai_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Exported ${filteredLeads.length} leads to CSV`, 'success');
  };

  const filterOptions: Array<{ id: typeof activeFilter; label: string }> = [
    { id: 'ALL', label: 'All Leads' },
    { id: 'UNASSIGNED', label: 'Unassigned' },
    { id: 'ASSIGNED', label: 'Assigned' },
    { id: 'CALLED', label: 'Called' },
    { id: 'FOLLOW-UP', label: 'Follow-up' },
    { id: 'CONVERTED', label: 'Converted' },
  ];

  const assignedCount = leads.filter((l) => !!l.assignedWorkerId).length;
  const unassignedCount = leads.length - assignedCount;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E9E5]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172017] tracking-tight">Leads</h1>
          <p className="text-sm text-[#6B756D] mt-0.5">
            Manage telecaller leads database • <strong className="text-[#0BAA45]">{unassignedCount} Unassigned</strong>, {assignedCount} Assigned
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Automated Dispatches Viewer */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEmailModalOpen(true)}
            icon={<Mail className="w-3.5 h-3.5 text-[#0BAA45]" />}
          >
            Dispatched Emails & Sheets ({emailDispatches.length})
          </Button>

          {/* Clear / Unassign All */}
          {assignedCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearAllAssignments}
              icon={<UserX className="w-3.5 h-3.5 text-[#DC2626]" />}
              className="text-[#DC2626] hover:bg-[#FEE2E2]/50 border-[#FECACA]"
            >
              Clear Assignments
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsCsvImportOpen(true)}
            icon={<Upload className="w-3.5 h-3.5" />}
          >
            Import CSV
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsAddLeadOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            ADD LEAD
          </Button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <Card className="p-4 space-y-3.5">
        <div className="relative">
          <Search className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search leads by client name, business, phone number, city, or assigned worker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nexgen-input pl-10 h-10 text-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E5E9E5]/60">
          <span className="text-xs font-bold text-[#6B756D] mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setActiveFilter(opt.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeFilter === opt.id
                  ? 'bg-[#0BAA45] text-white shadow-2xs'
                  : 'bg-[#F7F8F6] text-[#6B756D] hover:text-[#172017] hover:bg-[#E9F9EF] border border-[#E5E9E5]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Leads Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F7F8F6] text-[#6B756D] font-bold border-b border-[#E5E9E5] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Business</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Assigned Worker</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9E5]">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6B756D]">
                    <div className="text-sm font-semibold">No leads found.</div>
                    <p className="text-xs mt-1">Try adjusting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#F7F8F6]/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#172017]">
                      {lead.clientName}
                    </td>
                    <td className="py-3 px-4 text-[#6B756D]">
                      {lead.businessName || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[#172017] font-semibold">
                      {lead.phoneNumber}
                    </td>
                    <td className="py-3 px-4 text-[#6B756D]">
                      {lead.city || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {lead.assignedWorkerName ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setAssignModalLead(lead)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E9F9EF] hover:bg-[#d5f3e0] text-[#0BAA45] rounded-lg text-xs font-bold transition-colors border border-[#16C763]/30"
                            title="Click to Reassign or Email Sheet"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{lead.assignedWorkerName}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendLeadSheet(lead)}
                            className="p-1 text-[#6B756D] hover:text-[#0BAA45] hover:bg-[#E9F9EF] rounded-md transition-colors"
                            title="Dispatched Email & Sheet"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAssignModalLead(lead)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F7F8F6] hover:bg-[#E9F9EF] text-[#6B756D] hover:text-[#0BAA45] rounded-lg text-xs font-medium transition-colors border border-[#E5E9E5]"
                        >
                          <span>+ Assign</span>
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={lead.priority} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <LeadStatusBadge status={lead.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setAssignModalLead(lead)}
                          className="p-1.5 text-[#6B756D] hover:text-[#0BAA45] hover:bg-[#E9F9EF] rounded-lg transition-colors"
                          title="Assign Lead"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        {lead.assignedWorkerId && (
                          <button
                            type="button"
                            onClick={() => handleUnassignSingleLead(lead)}
                            className="p-1.5 text-[#6B756D] hover:text-[#DC2626] hover:bg-[#FEE2E2]/50 rounded-lg transition-colors"
                            title="Unassign Worker"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteLead(lead.id, lead.clientName)}
                          className="p-1.5 text-[#6B756D] hover:text-[#E53935] hover:bg-[#FEE2E2]/50 rounded-lg transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals */}
      <AddLeadModal
        isOpen={isAddLeadOpen}
        onClose={() => setIsAddLeadOpen(false)}
        workers={workers}
        onLeadAdded={refreshData}
      />

      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onImportComplete={refreshData}
      />

      <AssignWorkerModal
        lead={assignModalLead}
        isOpen={!!assignModalLead}
        onClose={() => setAssignModalLead(null)}
        workers={workers}
        onAssigned={refreshData}
      />

      <EmailDispatchModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        dispatches={emailDispatches}
        onRefresh={refreshData}
      />
    </div>
  );
};
