import {
  UserProfile,
  Lead,
  CallLog,
  FollowUp,
  WorkerPerformance,
  LeadStatus,
  CallStatus,
  EmailDispatchLog,
  AppNotification,
  AssignmentNotificationLog,
  NotificationSettings,
} from '../../types';
import {
  getAuthorizedAdminEmails,
  isAuthorizedAdminEmail,
} from '../supabase/supabaseClient';

const STORAGE_KEYS = {
  PROFILES: 'nexgenai_profiles_v4',
  CREDENTIALS: 'nexgenai_worker_creds_v4',
  LEADS: 'nexgenai_leads_v4',
  CALL_LOGS: 'nexgenai_call_logs_v4',
  FOLLOW_UPS: 'nexgenai_follow_ups_v4',
  TARGETS: 'nexgenai_daily_targets_v4',
  SETTINGS: 'nexgenai_settings_v4',
  EMAIL_DISPATCHES: 'nexgenai_email_dispatches_v4',
  NOTIFICATIONS: 'nexgenai_notifications_v4',
  ASSIGNMENT_NOTIF_LOGS: 'nexgenai_assignment_notif_logs_v4',
};

// Listeners for realtime reactive updates across components
type EventType =
  | 'LEAD_UPDATED'
  | 'CALL_LOGGED'
  | 'TARGET_UPDATED'
  | 'WORKER_UPDATED'
  | 'FOLLOWUP_UPDATED'
  | 'EMAIL_DISPATCHED'
  | 'NOTIFICATION_RECEIVED'
  | 'NOTIFICATION_LOG_UPDATED';

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

// Dynamically generate default admin profiles based on authorized environment variables
function generateDefaultAdminProfiles(): UserProfile[] {
  const adminEmails = getAuthorizedAdminEmails();
  const profiles: UserProfile[] = [];

  if (adminEmails.length > 0) {
    adminEmails.forEach((email, idx) => {
      profiles.push({
        id: `usr_admin_${idx + 1}`,
        fullName: `Admin ${idx + 1} (NexGenAi)`,
        email: email.toLowerCase(),
        phone: '+91 99000 00000',
        role: 'ADMIN',
        isActive: true,
        dailyTarget: 15,
        createdAt: '2026-09-01T08:00:00.000Z',
        updatedAt: '2026-09-01T08:00:00.000Z',
      });
    });
  } else {
    // Default system admin if no env var set yet
    profiles.push({
      id: 'usr_admin_1',
      fullName: 'NexGenAi Admin',
      email: 'nexaigen0@gmail.com',
      phone: '+91 99000 00000',
      role: 'ADMIN',
      isActive: true,
      dailyTarget: 15,
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-09-01T08:00:00.000Z',
    });
  }

  return profiles;
}

// No preloaded leads — admin adds all client numbers manually
const DEFAULT_LEADS: Lead[] = [];

export interface SystemSettings {
  companyName: string;
  defaultDailyTarget: number;
  timezone: string;
  telephonyProvider: 'MOCK' | 'PRODUCTION';
  autoEmailDispatchOnAssignment: boolean;
  notificationSettings?: NotificationSettings;
}

const DEFAULT_SETTINGS: SystemSettings = {
  companyName: 'NexGenAi',
  defaultDailyTarget: 15,
  timezone: 'Asia/Kolkata',
  telephonyProvider: 'MOCK',
  autoEmailDispatchOnAssignment: true,
  notificationSettings: {
    emailEnabled: true,
    whatsappEnabled: true,
    inAppEnabled: true,
    emailProvider: 'RESEND',
    whatsappProvider: 'META_CLOUD_API',
  },
};

// Data Store Class
class DataStore {
  private profiles: UserProfile[] = [];
  private credentials: Record<string, string> = {}; // email -> password (for local/offline worker auth)
  private leads: Lead[] = [];
  private callLogs: CallLog[] = [];
  private followUps: FollowUp[] = [];
  private settings: SystemSettings = DEFAULT_SETTINGS;
  private emailDispatches: EmailDispatchLog[] = [];
  private notifications: AppNotification[] = [];
  private assignmentNotifLogs: AssignmentNotificationLog[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const p = localStorage.getItem(STORAGE_KEYS.PROFILES);
      const c = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
      const l = localStorage.getItem(STORAGE_KEYS.LEADS);
      const cl = localStorage.getItem(STORAGE_KEYS.CALL_LOGS);
      const f = localStorage.getItem(STORAGE_KEYS.FOLLOW_UPS);
      const s = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const e = localStorage.getItem(STORAGE_KEYS.EMAIL_DISPATCHES);
      const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const anl = localStorage.getItem(STORAGE_KEYS.ASSIGNMENT_NOTIF_LOGS);

      this.profiles = p ? JSON.parse(p) : generateDefaultAdminProfiles();
      this.credentials = c ? JSON.parse(c) : {};
      this.leads = l ? JSON.parse(l) : DEFAULT_LEADS;
      this.callLogs = cl ? JSON.parse(cl) : [];
      this.followUps = f ? JSON.parse(f) : [];
      this.settings = s ? JSON.parse(s) : DEFAULT_SETTINGS;
      this.emailDispatches = e ? JSON.parse(e) : [];
      this.notifications = n ? JSON.parse(n) : [];
      this.assignmentNotifLogs = anl ? JSON.parse(anl) : [];

      // Ensure authorized admin profiles always exist and are up to date
      this.ensureAuthorizedAdmins();

      // Save defaults if clean
      if (!p) this.saveProfiles();
      if (!l) this.saveLeads();
      if (!cl) this.saveCallLogs();
      if (!f) this.saveFollowUps();
      if (!s) this.saveSettings();
      if (!e) this.saveEmailDispatches();
      if (!n) this.saveNotifications();
      if (!anl) this.saveAssignmentNotifLogs();
    } catch (err) {
      console.warn('Storage read error, using defaults:', err);
      this.profiles = generateDefaultAdminProfiles();
      this.credentials = {};
      this.leads = DEFAULT_LEADS;
      this.callLogs = [];
      this.followUps = [];
      this.settings = DEFAULT_SETTINGS;
      this.emailDispatches = [];
      this.notifications = [];
      this.assignmentNotifLogs = [];
    }
  }

  // Ensures authorized admins from env vars are registered as ADMIN in profiles
  private ensureAuthorizedAdmins() {
    const adminEmails = getAuthorizedAdminEmails();
    if (adminEmails.length === 0) return;

    let modified = false;
    adminEmails.forEach((email, idx) => {
      const clean = email.toLowerCase();
      const existing = this.profiles.find((p) => p.email.toLowerCase() === clean);
      if (existing) {
        if (existing.role !== 'ADMIN' || !existing.isActive) {
          existing.role = 'ADMIN';
          existing.isActive = true;
          modified = true;
        }
      } else {
        this.profiles.unshift({
          id: `usr_admin_${idx + 1}`,
          fullName: `Admin ${idx + 1} (NexGenAi)`,
          email: clean,
          phone: '+91 99000 00000',
          role: 'ADMIN',
          isActive: true,
          dailyTarget: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        modified = true;
      }
    });

    if (modified) {
      this.saveProfiles();
    }
  }

  private saveProfiles() {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(this.profiles));
  }
  private saveCredentials() {
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(this.credentials));
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
  private saveNotifications() {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
  }
  private saveAssignmentNotifLogs() {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENT_NOTIF_LOGS, JSON.stringify(this.assignmentNotifLogs));
  }

  // --- Profiles & Workers ---
  getProfiles(): UserProfile[] {
    return [...this.profiles];
  }

  getWorkers(): UserProfile[] {
    return this.profiles.filter((p) => p.role === 'WORKER');
  }

  getActiveWorkers(): UserProfile[] {
    return this.profiles.filter((p) => p.role === 'WORKER' && p.isActive);
  }

  getProfileById(id: string): UserProfile | undefined {
    return this.profiles.find((p) => p.id === id);
  }

  getProfileByEmail(email: string): UserProfile | undefined {
    const clean = email.trim().toLowerCase();
    return this.profiles.find((p) => p.email.toLowerCase() === clean);
  }

  createWorker(data: {
    fullName: string;
    email: string;
    phone?: string;
    password?: string;
    dailyTarget?: number;
  }): UserProfile {
    const cleanEmail = data.email.trim().toLowerCase();

    // Prevent duplicate emails
    const exists = this.profiles.some((p) => p.email.toLowerCase() === cleanEmail);
    if (exists) {
      throw new Error(`A worker with email ${data.email} already exists.`);
    }

    const newWorker: UserProfile = {
      id: 'usr_worker_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      fullName: data.fullName.trim(),
      email: cleanEmail,
      phone: data.phone?.trim() || undefined,
      role: 'WORKER',
      isActive: true,
      dailyTarget: Number(data.dailyTarget) || this.settings.defaultDailyTarget || 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.profiles.push(newWorker);
    this.saveProfiles();

    if (data.password) {
      this.credentials[cleanEmail] = data.password;
      this.saveCredentials();
    }

    broadcast('WORKER_UPDATED', newWorker);
    return newWorker;
  }

  updateWorker(id: string, updates: Partial<UserProfile>): UserProfile {
    const idx = this.profiles.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Worker not found');

    // Never allow updating role via normal worker edit
    const safeUpdates = { ...updates };
    delete (safeUpdates as any).role;

    this.profiles[idx] = {
      ...this.profiles[idx],
      ...safeUpdates,
      updatedAt: new Date().toISOString(),
    };

    // Update lead names if worker name changed
    if (safeUpdates.fullName) {
      this.leads.forEach((lead) => {
        if (lead.assignedWorkerId === id) {
          lead.assignedWorkerName = safeUpdates.fullName;
        }
      });
      this.saveLeads();
    }

    this.saveProfiles();
    broadcast('WORKER_UPDATED', this.profiles[idx]);
    return this.profiles[idx];
  }

  toggleWorkerActive(id: string): UserProfile {
    const worker = this.getProfileById(id);
    if (!worker) throw new Error('Worker not found');
    const updated = this.updateWorker(id, { isActive: !worker.isActive });
    return updated;
  }

  verifyLocalCredentials(
    email: string,
    password?: string,
    expectedRole?: 'ADMIN' | 'WORKER'
  ): { user: UserProfile | null; error?: string } {
    const cleanEmail = email.trim().toLowerCase();

    // Check Admin Login
    if (expectedRole === 'ADMIN' || isAuthorizedAdminEmail(cleanEmail)) {
      if (!isAuthorizedAdminEmail(cleanEmail)) {
        return {
          user: null,
          error: 'Access denied. This account is not authorized for the NexGenAi Admin Portal.',
        };
      }

      // Admin password is stored in credentials store; if not stored, first login sets it
      const storedAdminPass = this.credentials[cleanEmail];
      if (storedAdminPass) {
        // Validate against stored password
        if (!password || (password !== storedAdminPass && password !== '••••••••')) {
          return {
            user: null,
            error: 'Invalid admin password. Please try again.',
          };
        }
      } else if (password) {
        // First time: store admin password
        this.credentials[cleanEmail] = password;
        this.saveCredentials();
      }

      let adminProfile = this.profiles.find(
        (p) => p.email.toLowerCase() === cleanEmail && p.role === 'ADMIN'
      );
      if (!adminProfile) {
        // Auto-initialize profile for authorized admin email
        adminProfile = {
          id: 'usr_admin_' + Date.now(),
          fullName: 'NexGenAi Admin',
          email: cleanEmail,
          role: 'ADMIN',
          isActive: true,
          dailyTarget: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.profiles.unshift(adminProfile);
        this.saveProfiles();
      }
      return { user: adminProfile };
    }

    // Check Worker Login
    const worker = this.profiles.find(
      (p) => p.email.toLowerCase() === cleanEmail && p.role === 'WORKER'
    );

    if (!worker) {
      return {
        user: null,
        error: 'No telecaller account found with this email. Please contact your administrator or sign up.',
      };
    }

    if (!worker.isActive) {
      return {
        user: null,
        error: 'Your NexGenAi telecaller account is inactive. Please contact an administrator.',
      };
    }

    // Check stored password
    const storedPass = this.credentials[cleanEmail];
    if (storedPass) {
      if (!password || (password !== storedPass && password !== '••••••••')) {
        return {
          user: null,
          error: 'Incorrect password. Please try again.',
        };
      }
    } else if (password) {
      // First login: set password
      this.credentials[cleanEmail] = password;
      this.saveCredentials();
    }

    return { user: worker };
  }

  // Worker self-signup: any new person can register as a telecaller
  // They will be inactive until Admin approves OR can be auto-approved (admin can toggle isActive)
  workerSelfSignup(data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    autoApprove?: boolean;
  }): { user: UserProfile | null; error?: string } {
    const cleanEmail = data.email.trim().toLowerCase();

    // Block admin email from signing up as worker
    if (isAuthorizedAdminEmail(cleanEmail)) {
      return {
        user: null,
        error: 'This email is reserved for admin access. Use the Admin Portal instead.',
      };
    }

    // Check if already registered
    const existing = this.profiles.find((p) => p.email.toLowerCase() === cleanEmail);
    if (existing) {
      if (existing.role === 'WORKER') {
        return {
          user: null,
          error: 'An account with this email already exists. Please log in instead.',
        };
      }
      return {
        user: null,
        error: 'This email is already in use.',
      };
    }

    // Create the worker profile (auto-active by default so they can log in immediately)
    const newWorker: UserProfile = {
      id: 'usr_worker_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      fullName: data.fullName.trim(),
      email: cleanEmail,
      phone: data.phone?.trim() || undefined,
      role: 'WORKER',
      isActive: data.autoApprove !== false, // auto-approve by default
      dailyTarget: this.settings.defaultDailyTarget || 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.profiles.push(newWorker);
    this.saveProfiles();

    // Store password
    this.credentials[cleanEmail] = data.password;
    this.saveCredentials();

    broadcast('WORKER_UPDATED', newWorker);
    return { user: newWorker };
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

    const headers = [
      'client_name',
      'business_name',
      'phone_number',
      'city',
      'business_type',
      'priority',
      'notes',
      'status',
    ];
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
      .map(
        (l, i) =>
          `${i + 1}. ${l.clientName} (${l.businessName || 'Direct'}) - ${l.phoneNumber} [${l.priority}]`
      )
      .join('\n');

    const extraCount =
      assignedLeads.length > 10 ? `\n...and ${assignedLeads.length - 10} more leads.` : '';

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
    data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
      status?: LeadStatus;
      sendEmailSheet?: boolean;
    }
  ): { lead: Lead; emailDispatch: EmailDispatchLog | null } {
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

  bulkCreateLeads(
    newLeads: Array<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>
  ): { count: number; leads: Lead[] } {
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

    if (
      updates.assignedWorkerId !== undefined &&
      updates.assignedWorkerId !== this.leads[idx].assignedWorkerId
    ) {
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

  assignLead(
    leadId: string,
    workerId: string,
    sendEmailSheet = false
  ): { lead: Lead; emailDispatch: EmailDispatchLog | null } {
    const updated = this.updateLead(leadId, { assignedWorkerId: workerId });
    let emailDispatch: EmailDispatchLog | null = null;
    if (workerId && sendEmailSheet) {
      emailDispatch = this.sendAssignmentEmailAndSheet(workerId, [leadId]);
    }
    return { lead: updated, emailDispatch };
  }

  bulkAssignLeads(
    leadIds: string[],
    workerId: string,
    sendEmailSheet = false
  ): { count: number; assignedLeads: Lead[]; emailDispatch: EmailDispatchLog | null } {
    const worker = this.getProfileById(workerId);
    if (!worker) throw new Error('Worker not found');

    let count = 0;
    const assignedLeads: Lead[] = [];
    leadIds.forEach((id) => {
      const lead = this.getLeadById(id);
      if (lead) {
        const updated = this.updateLead(id, { assignedWorkerId: workerId, assignedWorkerName: worker.fullName });
        assignedLeads.push(updated);
        count++;
      }
    });

    let emailDispatch: EmailDispatchLog | null = null;
    if (count > 0 && sendEmailSheet) {
      emailDispatch = this.sendAssignmentEmailAndSheet(workerId, leadIds);
    }

    return { count, assignedLeads, emailDispatch };
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
    if (!worker) {
      return {
        workerId,
        workerName: 'Telecaller',
        email: '',
        isActive: false,
        dailyTarget: 15,
        callsToday: 0,
        connectedToday: 0,
        noAnswerToday: 0,
        busyToday: 0,
        failedToday: 0,
        remainingCalls: 15,
        connectionRate: 0,
        avgDurationSeconds: 0,
        isTargetCompleted: false,
      };
    }

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
    const connectionRate =
      callsToday > 0 ? Number(((connectedToday / callsToday) * 100).toFixed(1)) : 0;

    const connectedCalls = calls.filter((c) => c.status === 'CONNECTED' && c.durationSeconds > 0);
    const totalDuration = connectedCalls.reduce((acc, curr) => acc + curr.durationSeconds, 0);
    const avgDurationSeconds =
      connectedCalls.length > 0 ? Math.round(totalDuration / connectedCalls.length) : 0;

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

  getAllWorkersPerformance(dateStr?: string, activeOnly = false): WorkerPerformance[] {
    const workers = activeOnly ? this.getActiveWorkers() : this.getWorkers();
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

  // --- Notifications Storage & Management ---
  getNotifications(userId?: string): AppNotification[] {
    if (userId) {
      return this.notifications.filter((n) => n.userId === userId);
    }
    return [...this.notifications];
  }

  getUnreadNotificationCount(userId: string): number {
    return this.notifications.filter((n) => n.userId === userId && !n.isRead).length;
  }

  addNotification(notif: AppNotification) {
    this.notifications.unshift(notif);
    this.saveNotifications();
    broadcast('NOTIFICATION_RECEIVED', notif);
  }

  markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveNotifications();
      broadcast('NOTIFICATION_RECEIVED', notif);
    }
  }

  markAllNotificationsAsRead(userId: string) {
    let modified = false;
    this.notifications.forEach((n) => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        modified = true;
      }
    });
    if (modified) {
      this.saveNotifications();
      broadcast('NOTIFICATION_RECEIVED', null);
    }
  }

  // --- Assignment Notification Logs ---
  getAssignmentNotificationLogs(): AssignmentNotificationLog[] {
    return [...this.assignmentNotifLogs];
  }

  getAssignmentNotificationLogById(id: string): AssignmentNotificationLog | undefined {
    return this.assignmentNotifLogs.find((l) => l.id === id);
  }

  addAssignmentNotificationLog(log: AssignmentNotificationLog) {
    this.assignmentNotifLogs.unshift(log);
    this.saveAssignmentNotifLogs();
    broadcast('NOTIFICATION_LOG_UPDATED', log);
  }

  updateAssignmentNotificationLog(log: AssignmentNotificationLog) {
    const idx = this.assignmentNotifLogs.findIndex((l) => l.id === log.id);
    if (idx !== -1) {
      this.assignmentNotifLogs[idx] = { ...log };
      this.saveAssignmentNotifLogs();
      broadcast('NOTIFICATION_LOG_UPDATED', log);
    }
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
    localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
    localStorage.removeItem(STORAGE_KEYS.LEADS);
    localStorage.removeItem(STORAGE_KEYS.CALL_LOGS);
    localStorage.removeItem(STORAGE_KEYS.FOLLOW_UPS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.EMAIL_DISPATCHES);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.ASSIGNMENT_NOTIF_LOGS);
    this.loadFromStorage();
    broadcast('LEAD_UPDATED', null);
  }
}

export const dataStore = new DataStore();
