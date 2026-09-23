import {
  UserProfile,
  Lead,
  CallLog,
  FollowUp,
  WorkerPerformance,
  LeadStatus,
  CallStatus,
  EmailDispatchLog,
} from '../../types';

const STORAGE_KEYS = {
  PROFILES: 'nexgenai_profiles_v1',
  LEADS: 'nexgenai_leads_v1',
  CALL_LOGS: 'nexgenai_call_logs_v1',
  FOLLOW_UPS: 'nexgenai_follow_ups_v1',
  TARGETS: 'nexgenai_daily_targets_v1',
  SETTINGS: 'nexgenai_settings_v1',
  CURRENT_USER: 'nexgenai_current_user_v1',
  EMAIL_DISPATCHES: 'nexgenai_email_dispatches_v1',
};

// Listeners for realtime reactive updates across components
type EventType =
  | 'LEAD_UPDATED'
  | 'CALL_LOGGED'
  | 'TARGET_UPDATED'
  | 'WORKER_UPDATED'
  | 'FOLLOWUP_UPDATED'
  | 'EMAIL_DISPATCHED';

type EventListener = (event: { type: EventType; payload?: any }) => void;
const listeners = new Set<EventListener>();

export function subscribeToStore(listener: EventListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function broadcast(type: EventType, payload?: any) {
  listeners.forEach((l) => {
    try {
      l({ type, payload });
    } catch (e) {
      console.error('Error broadcasting store event:', e);
    }
  });
}

// Initial Demo Seed Data
const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'usr_admin_1',
    fullName: 'Admin (NexGenAi)',
    email: 'admin@nexgenai.in',
    phone: '+91 99000 00000',
    role: 'ADMIN',
    isActive: true,
    dailyTarget: 15,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'usr_worker_rahul',
    fullName: 'Rahul Kumar',
    email: 'rahul@nexgenai.in',
    phone: '+91 98765 43210',
    role: 'WORKER',
    isActive: true,
    dailyTarget: 15,
    createdAt: '2026-09-01T08:30:00.000Z',
    updatedAt: '2026-09-01T08:30:00.000Z',
  },
  {
    id: 'usr_worker_aman',
    fullName: 'Aman Kumar',
    email: 'aman@nexgenai.in',
    phone: '+91 98765 43211',
    role: 'WORKER',
    isActive: true,
    dailyTarget: 15,
    createdAt: '2026-09-01T08:30:00.000Z',
    updatedAt: '2026-09-01T08:30:00.000Z',
  },
];

// Initial leads (Unassigned by default so admin can assign and test automatic email & sheet dispatch)
const DEFAULT_LEADS: Lead[] = [
  {
    id: 'lead_1',
    clientName: 'Raj Kumar',
    businessName: 'ABC Coaching Institute',
    phoneNumber: '+91 98234 11021',
    city: 'Saharsa',
    businessType: 'Education',
    priority: 'HIGH',
    notes: 'Inquiring about telecaller automation software.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_2',
    clientName: 'Priya Sharma',
    businessName: 'Apex Fitness Gym',
    phoneNumber: '+91 98112 33445',
    city: 'Patna',
    businessType: 'Health & Fitness',
    priority: 'MEDIUM',
    notes: 'Interested in gym member renewal calling.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_3',
    clientName: 'Vikram Verma',
    businessName: 'Royal Stay Hotel',
    phoneNumber: '+91 98456 77889',
    city: 'Muzaffarpur',
    businessType: 'Hospitality',
    priority: 'HIGH',
    notes: 'Wants bulk booking inquiries handled.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_4',
    clientName: 'Sunita Patel',
    businessName: 'Modern Diagnostic Center',
    phoneNumber: '+91 98771 22334',
    city: 'Darbhanga',
    businessType: 'Healthcare',
    priority: 'URGENT',
    notes: 'Follow up for telecaller software pricing.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_5',
    clientName: 'Amit Mishra',
    businessName: 'Mishra Supermarket',
    phoneNumber: '+91 98334 55667',
    city: 'Gaya',
    businessType: 'Retail',
    priority: 'LOW',
    notes: 'General store inventory management inquiry.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_6',
    clientName: 'Neha Gupta',
    businessName: 'Bright Future Public School',
    phoneNumber: '+91 98667 88990',
    city: 'Bhagalpur',
    businessType: 'Education',
    priority: 'HIGH',
    notes: 'School admission leads telecalling.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_7',
    clientName: 'Deepak Singh',
    businessName: 'Singh Automobiles & Spares',
    phoneNumber: '+91 98223 44556',
    city: 'Purnia',
    businessType: 'Automotive',
    priority: 'MEDIUM',
    notes: 'Vehicle servicing reminders.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_8',
    clientName: 'Anjali Roy',
    businessName: 'Roy Fashion Boutique',
    phoneNumber: '+91 98556 77889',
    city: 'Ranchi',
    businessType: 'Retail',
    priority: 'LOW',
    notes: 'Festival discount campaign calls.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_9',
    clientName: 'Sanjay Yadav',
    businessName: 'Star Diagnostic Lab',
    phoneNumber: '+91 98119 88776',
    city: 'Arrah',
    businessType: 'Healthcare',
    priority: 'HIGH',
    notes: 'Pathology test booking confirmation.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_10',
    clientName: 'Manoj Kumar',
    businessName: 'Express Logistics Hub',
    phoneNumber: '+91 98443 22110',
    city: 'Begusarai',
    businessType: 'Logistics',
    priority: 'MEDIUM',
    notes: 'Fleet booking verification.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_11',
    clientName: 'Rajesh Khanna',
    businessName: 'Khanna Sweet House',
    phoneNumber: '+91 97112 33445',
    city: 'Delhi',
    businessType: 'Food & Beverage',
    priority: 'HIGH',
    notes: 'Catering inquiries setup.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_12',
    clientName: 'Pooja Mehra',
    businessName: 'Mehra Dental Clinic',
    phoneNumber: '+91 97223 44556',
    city: 'Noida',
    businessType: 'Healthcare',
    priority: 'MEDIUM',
    notes: 'Dental appointment schedule software.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_13',
    clientName: 'Arvind Swaminathan',
    businessName: 'South Flavors Restaurant',
    phoneNumber: '+91 97334 55667',
    city: 'Bengaluru',
    businessType: 'Hospitality',
    priority: 'HIGH',
    notes: 'Table reservation follow up system.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_14',
    clientName: 'Kavita Desai',
    businessName: 'Sparkle Beauty Parlour',
    phoneNumber: '+91 97445 66778',
    city: 'Ahmedabad',
    businessType: 'Personal Care',
    priority: 'LOW',
    notes: 'Bridal package queries.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_15',
    clientName: 'Ramesh Kulkarni',
    businessName: 'Kulkarni Agro Traders',
    phoneNumber: '+91 97556 77889',
    city: 'Pune',
    businessType: 'Agriculture',
    priority: 'MEDIUM',
    notes: 'Wholesale fertilizer buyer leads.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_16',
    clientName: 'Farhan Akhtar',
    businessName: 'Green View Resort',
    phoneNumber: '+91 97667 88990',
    city: 'Jaipur',
    businessType: 'Hospitality',
    priority: 'HIGH',
    notes: 'Weekend getaway packages.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_17',
    clientName: 'Sneha Reddy',
    businessName: 'Reddy Electronics Showroom',
    phoneNumber: '+91 97778 99001',
    city: 'Hyderabad',
    businessType: 'Retail',
    priority: 'URGENT',
    notes: 'Diwali electronics offers promo calls.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_18',
    clientName: 'Gurpreet Singh',
    businessName: 'Singh Driving School',
    phoneNumber: '+91 97889 00112',
    city: 'Chandigarh',
    businessType: 'Services',
    priority: 'MEDIUM',
    notes: 'Driver training inquiry.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_19',
    clientName: 'Meenakshi Sundaram',
    businessName: 'Chennai Silk Palace',
    phoneNumber: '+91 97990 11223',
    city: 'Chennai',
    businessType: 'Textile',
    priority: 'HIGH',
    notes: 'Wedding saree customer outreach.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_20',
    clientName: 'Tarun Sen',
    businessName: 'Sen Hardware & Paints',
    phoneNumber: '+91 97001 22334',
    city: 'Kolkata',
    businessType: 'Wholesale',
    priority: 'LOW',
    notes: 'Bulk paint dealer inquiries.',
    status: 'NEW',
    assignedWorkerId: undefined,
    assignedWorkerName: undefined,
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export interface SystemSettings {
  companyName: string;
  defaultDailyTarget: number;
  timezone: string;
  telephonyProvider: 'MOCK' | 'PRODUCTION';
  autoEmailDispatchOnAssignment: boolean;
}

const DEFAULT_SETTINGS: SystemSettings = {
  companyName: 'NexGenAi',
  defaultDailyTarget: 15,
  timezone: 'Asia/Kolkata',
  telephonyProvider: 'MOCK',
  autoEmailDispatchOnAssignment: true,
};

// Data Store Class
class DataStore {
  private profiles: UserProfile[] = [];
  private leads: Lead[] = [];
  private callLogs: CallLog[] = [];
  private followUps: FollowUp[] = [];
  private settings: SystemSettings = DEFAULT_SETTINGS;
  private emailDispatches: EmailDispatchLog[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const p = localStorage.getItem(STORAGE_KEYS.PROFILES);
      this.profiles = p ? JSON.parse(p) : DEFAULT_PROFILES;

      const l = localStorage.getItem(STORAGE_KEYS.LEADS);
      this.leads = l ? JSON.parse(l) : DEFAULT_LEADS;

      const c = localStorage.getItem(STORAGE_KEYS.CALL_LOGS);
      this.callLogs = c ? JSON.parse(c) : [];

      const f = localStorage.getItem(STORAGE_KEYS.FOLLOW_UPS);
      this.followUps = f ? JSON.parse(f) : [];

      const s = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      this.settings = s ? JSON.parse(s) : DEFAULT_SETTINGS;

      const e = localStorage.getItem(STORAGE_KEYS.EMAIL_DISPATCHES);
      this.emailDispatches = e ? JSON.parse(e) : [];

      // Save defaults if clean
      if (!p) this.saveProfiles();
      if (!l) this.saveLeads();
      if (!c) this.saveCallLogs();
      if (!f) this.saveFollowUps();
      if (!s) this.saveSettings();
      if (!e) this.saveEmailDispatches();
    } catch (err) {
      console.warn('Storage read error, using defaults:', err);
      this.profiles = DEFAULT_PROFILES;
      this.leads = DEFAULT_LEADS;
      this.callLogs = [];
      this.followUps = [];
      this.settings = DEFAULT_SETTINGS;
      this.emailDispatches = [];
    }
  }

  private saveProfiles() {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(this.profiles));
  }
  private saveLeads() {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(this.leads));
  }
  private saveCallLogs() {
    localStorage.setItem(STORAGE_KEYS.CALL_LOGS, JSON.stringify(this.callLogs));
  }
  private saveFollowUps() {
    localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(this.followUps));
  }
  private saveSettings() {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
  }
  private saveEmailDispatches() {
    localStorage.setItem(STORAGE_KEYS.EMAIL_DISPATCHES, JSON.stringify(this.emailDispatches));
  }

  // --- Profiles & Workers ---
  getProfiles(): UserProfile[] {
    return [...this.profiles];
  }

  getWorkers(): UserProfile[] {
    return this.profiles.filter((p) => p.role === 'WORKER');
  }

  getProfileById(id: string): UserProfile | undefined {
    return this.profiles.find((p) => p.id === id);
  }

  createWorker(data: { fullName: string; email: string; phone?: string; dailyTarget?: number }): UserProfile {
    const newWorker: UserProfile = {
      id: 'usr_worker_' + Date.now(),
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim(),
      role: 'WORKER',
      isActive: true,
      dailyTarget: data.dailyTarget || this.settings.defaultDailyTarget || 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.profiles.push(newWorker);
    this.saveProfiles();
    broadcast('WORKER_UPDATED', newWorker);
    return newWorker;
  }

  updateWorker(id: string, updates: Partial<UserProfile>): UserProfile {
    const idx = this.profiles.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Worker not found');
    this.profiles[idx] = { ...this.profiles[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveProfiles();
    broadcast('WORKER_UPDATED', this.profiles[idx]);
    return this.profiles[idx];
  }

  toggleWorkerActive(id: string): UserProfile {
    const worker = this.getProfileById(id);
    if (!worker) throw new Error('Worker not found');
    return this.updateWorker(id, { isActive: !worker.isActive });
  }

  // --- Automated Email & Sheet Dispatch ---
  sendAssignmentEmailAndSheet(workerId: string, leadIds: string[]): EmailDispatchLog | null {
    const worker = this.getProfileById(workerId);
    if (!worker || !worker.email) return null;

    const assignedLeads = this.leads.filter((l) => leadIds.includes(l.id));
    if (assignedLeads.length === 0) return null;

    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const headers = ['client_name', 'business_name', 'phone_number', 'city', 'business_type', 'priority', 'notes', 'status'];
    const rows = assignedLeads.map((l) => [
      `"${l.clientName.replace(/"/g, '""')}"`,
      `"${(l.businessName || '').replace(/"/g, '""')}"`,
      `"${l.phoneNumber}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.businessType || '').replace(/"/g, '""')}"`,
      l.priority,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      l.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const safeWorkerName = worker.fullName.toLowerCase().replace(/\s+/g, '_');
    const csvFilename = `nexgenai_assigned_leads_${safeWorkerName}_${Date.now()}.csv`;

    const leadSummaryList = assignedLeads
      .slice(0, 10)
      .map((l, i) => `${i + 1}. ${l.clientName} (${l.businessName || 'Direct'}) - ${l.phoneNumber} [${l.priority}]`)
      .join('\n');

    const extraCount = assignedLeads.length > 10 ? `\n...and ${assignedLeads.length - 10} more leads.` : '';

    const subject = `[NexGenAi] New Lead Assignment & Calling Sheet (${assignedLeads.length} Leads) - ${dateStr}`;
    const messageBody = `Hello ${worker.fullName},

You have been assigned ${assignedLeads.length} new lead(s) for outbound calling by NexGenAi management.

Please find your telecaller lead sheet attached below:
Attached File: ${csvFilename}

Assigned Leads Summary:
----------------------------------------
${leadSummaryList}${extraCount}

Instructions:
1. Open your NexGenAi Worker Portal: https://nexgenai.in/worker/login
2. Click "CALL NOW" on each assigned lead to initiate tracked calling.
3. Keep track of your daily quota target (${worker.dailyTarget || 15} calls/day).

Best regards,
NexGenAi Telecaller Operations Team`;

    const dispatchLog: EmailDispatchLog = {
      id: 'disp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      workerId: worker.id,
      workerName: worker.fullName,
      workerEmail: worker.email,
      subject,
      messageBody,
      leadsCount: assignedLeads.length,
      leadNames: assignedLeads.map((l) => l.clientName),
      csvFilename,
      csvContent,
      sentAt: new Date().toISOString(),
      status: 'DELIVERED',
    };

    this.emailDispatches.unshift(dispatchLog);
    this.saveEmailDispatches();
    broadcast('EMAIL_DISPATCHED', dispatchLog);

    return dispatchLog;
  }

  getEmailDispatchLogs(): EmailDispatchLog[] {
    return [...this.emailDispatches];
  }

  deleteEmailDispatchLog(id: string) {
    this.emailDispatches = this.emailDispatches.filter((d) => d.id !== id);
    this.saveEmailDispatches();
    broadcast('EMAIL_DISPATCHED', { deletedId: id });
  }

  // --- Leads ---
  getLeads(filterByWorkerId?: string): Lead[] {
    if (filterByWorkerId) {
      return this.leads.filter((l) => l.assignedWorkerId === filterByWorkerId);
    }
    return [...this.leads];
  }

  getLeadById(id: string): Lead | undefined {
    return this.leads.find((l) => l.id === id);
  }

  createLead(
    data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: LeadStatus; sendEmailSheet?: boolean }
  ): { lead: Lead; emailDispatch: EmailDispatchLog | null } {
    // Duplicate phone check
    const normalizedPhone = data.phoneNumber.replace(/[\s-]/g, '');
    const exists = this.leads.some((l) => l.phoneNumber.replace(/[\s-]/g, '') === normalizedPhone);
    if (exists) {
      throw new Error(`A lead with phone number ${data.phoneNumber} already exists.`);
    }

    let assignedWorkerName: string | undefined;
    if (data.assignedWorkerId) {
      const worker = this.getProfileById(data.assignedWorkerId);
      assignedWorkerName = worker?.fullName;
    }

    const newLead: Lead = {
      ...data,
      id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      status: data.status || 'NEW',
      assignedWorkerName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.leads.unshift(newLead);
    this.saveLeads();

    let emailDispatch: EmailDispatchLog | null = null;
    if (newLead.assignedWorkerId && (data.sendEmailSheet ?? true)) {
      emailDispatch = this.sendAssignmentEmailAndSheet(newLead.assignedWorkerId, [newLead.id]);
    }

    broadcast('LEAD_UPDATED', newLead);
    return { lead: newLead, emailDispatch };
  }

  bulkCreateLeads(newLeads: Array<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>): { count: number; leads: Lead[] } {
    const created: Lead[] = [];
    newLeads.forEach((l) => {
      const lead: Lead = {
        ...l,
        id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.leads.unshift(lead);
      created.push(lead);
    });
    this.saveLeads();
    broadcast('LEAD_UPDATED', created);
    return { count: created.length, leads: created };
  }

  updateLead(id: string, updates: Partial<Lead>): Lead {
    const idx = this.leads.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error('Lead not found');

    if (updates.assignedWorkerId !== undefined && updates.assignedWorkerId !== this.leads[idx].assignedWorkerId) {
      if (updates.assignedWorkerId) {
        const worker = this.getProfileById(updates.assignedWorkerId);
        updates.assignedWorkerName = worker?.fullName;
      } else {
        updates.assignedWorkerName = undefined;
      }
    }

    this.leads[idx] = { ...this.leads[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveLeads();
    broadcast('LEAD_UPDATED', this.leads[idx]);
    return this.leads[idx];
  }

  assignLead(leadId: string, workerId: string, sendEmailSheet = true): { lead: Lead; emailDispatch: EmailDispatchLog | null } {
    const updated = this.updateLead(leadId, { assignedWorkerId: workerId });
    let emailDispatch: EmailDispatchLog | null = null;
    if (workerId && sendEmailSheet) {
      emailDispatch = this.sendAssignmentEmailAndSheet(workerId, [leadId]);
    }
    return { lead: updated, emailDispatch };
  }

  bulkAssignLeads(leadIds: string[], workerId: string, sendEmailSheet = true): { count: number; emailDispatch: EmailDispatchLog | null } {
    const worker = this.getProfileById(workerId);
    if (!worker) throw new Error('Worker not found');

    let count = 0;
    leadIds.forEach((id) => {
      const lead = this.getLeadById(id);
      if (lead) {
        this.updateLead(id, { assignedWorkerId: workerId, assignedWorkerName: worker.fullName });
        count++;
      }
    });

    let emailDispatch: EmailDispatchLog | null = null;
    if (count > 0 && sendEmailSheet) {
      emailDispatch = this.sendAssignmentEmailAndSheet(workerId, leadIds);
    }

    return { count, emailDispatch };
  }

  unassignLead(leadId: string): Lead {
    return this.updateLead(leadId, { assignedWorkerId: undefined, assignedWorkerName: undefined });
  }

  clearAllAssignments(): number {
    let count = 0;
    this.leads.forEach((l) => {
      if (l.assignedWorkerId) {
        l.assignedWorkerId = undefined;
        l.assignedWorkerName = undefined;
        l.updatedAt = new Date().toISOString();
        count++;
      }
    });
    this.saveLeads();
    broadcast('LEAD_UPDATED', null);
    return count;
  }

  deleteLead(id: string): void {
    this.leads = this.leads.filter((l) => l.id !== id);
    this.saveLeads();
    broadcast('LEAD_UPDATED', { deletedId: id });
  }

  // --- Call Logs ---
  getCallLogs(filterByWorkerId?: string): CallLog[] {
    if (filterByWorkerId) {
      return this.callLogs.filter((c) => c.workerId === filterByWorkerId);
    }
    return [...this.callLogs];
  }

  recordCallLog(log: Omit<CallLog, 'id' | 'createdAt'>): CallLog {
    const worker = this.getProfileById(log.workerId);
    const newLog: CallLog = {
      ...log,
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      workerName: worker?.fullName || log.workerName,
      createdAt: new Date().toISOString(),
    };

    this.callLogs.unshift(newLog);
    this.saveCallLogs();

    // Update lead status based on outcome
    if (log.leadId) {
      let nextStatus: LeadStatus = 'CALLED';
      if (log.status === 'CONNECTED') nextStatus = 'CONNECTED';
      if (log.outcome) nextStatus = log.outcome;

      const lead = this.getLeadById(log.leadId);
      if (lead) {
        this.updateLead(log.leadId, { status: nextStatus });
      }
    }

    broadcast('CALL_LOGGED', newLog);
    return newLog;
  }

  // --- Follow Ups ---
  getFollowUps(filterByWorkerId?: string): FollowUp[] {
    if (filterByWorkerId) {
      return this.followUps.filter((f) => f.workerId === filterByWorkerId);
    }
    return [...this.followUps];
  }

  createFollowUp(data: {
    leadId: string;
    workerId: string;
    followUpAt: string;
    note?: string;
  }): FollowUp {
    const lead = this.getLeadById(data.leadId);
    const worker = this.getProfileById(data.workerId);

    const newFollowUp: FollowUp = {
      id: 'fup_' + Date.now(),
      leadId: data.leadId,
      clientName: lead?.clientName,
      businessName: lead?.businessName,
      phoneNumber: lead?.phoneNumber,
      workerId: data.workerId,
      workerName: worker?.fullName,
      followUpAt: data.followUpAt,
      note: data.note,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.followUps.unshift(newFollowUp);
    this.saveFollowUps();

    if (lead) {
      this.updateLead(data.leadId, { status: 'FOLLOW-UP' });
    }

    broadcast('FOLLOWUP_UPDATED', newFollowUp);
    return newFollowUp;
  }

  // --- Performance & Metrics Aggregation ---
  getWorkerPerformance(workerId: string, dateStr?: string): WorkerPerformance {
    const worker = this.getProfileById(workerId);
    if (!worker) throw new Error('Worker not found');

    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const dailyTarget = worker.dailyTarget || this.settings.defaultDailyTarget || 15;

    const calls = this.callLogs.filter((c) => {
      const callDate = (c.startedAt || c.createdAt).split('T')[0];
      return c.workerId === workerId && callDate === targetDate;
    });

    const callsToday = calls.length;
    const connectedToday = calls.filter((c) => c.status === 'CONNECTED').length;
    const noAnswerToday = calls.filter((c) => c.status === 'NO_ANSWER').length;
    const busyToday = calls.filter((c) => c.status === 'BUSY').length;
    const failedToday = calls.filter((c) => c.status === 'FAILED').length;
    const remainingCalls = Math.max(0, dailyTarget - callsToday);
    const connectionRate = callsToday > 0 ? Number(((connectedToday / callsToday) * 100).toFixed(1)) : 0;

    const connectedCalls = calls.filter((c) => c.status === 'CONNECTED' && c.durationSeconds > 0);
    const totalDuration = connectedCalls.reduce((acc, curr) => acc + curr.durationSeconds, 0);
    const avgDurationSeconds = connectedCalls.length > 0 ? Math.round(totalDuration / connectedCalls.length) : 0;

    return {
      workerId: worker.id,
      workerName: worker.fullName,
      email: worker.email,
      phone: worker.phone,
      isActive: worker.isActive,
      dailyTarget,
      callsToday,
      connectedToday,
      noAnswerToday,
      busyToday,
      failedToday,
      remainingCalls,
      connectionRate,
      avgDurationSeconds,
      isTargetCompleted: callsToday >= dailyTarget,
    };
  }

  getAllWorkersPerformance(dateStr?: string): WorkerPerformance[] {
    const workers = this.getWorkers();
    return workers.map((w) => this.getWorkerPerformance(w.id, dateStr));
  }

  getAdminDashboardMetrics() {
    const today = new Date().toISOString().split('T')[0];
    const totalLeads = this.leads.length;

    const callsTodayList = this.callLogs.filter((c) => {
      const cDate = (c.startedAt || c.createdAt).split('T')[0];
      return cDate === today;
    });

    const callsToday = callsTodayList.length;
    const connectedToday = callsTodayList.filter((c) => c.status === 'CONNECTED').length;
    const pendingCalls = this.leads.filter((l) => l.status === 'NEW').length;

    return {
      totalLeads,
      callsToday,
      connectedToday,
      pendingCalls,
    };
  }

  // --- System Settings ---
  getSettings(): SystemSettings {
    return { ...this.settings };
  }

  updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
    broadcast('TARGET_UPDATED', this.settings);
    return this.settings;
  }

  resetToDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.PROFILES);
    localStorage.removeItem(STORAGE_KEYS.LEADS);
    localStorage.removeItem(STORAGE_KEYS.CALL_LOGS);
    localStorage.removeItem(STORAGE_KEYS.FOLLOW_UPS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.EMAIL_DISPATCHES);
    this.loadFromStorage();
    broadcast('LEAD_UPDATED', null);
  }
}

export const dataStore = new DataStore();
