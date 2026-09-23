import {
  UserProfile,
  Lead,
  CallLog,
  FollowUp,
  WorkerPerformance,
  DailyTarget,
  LeadStatus,
  CallStatus,
} from '../../types';

const STORAGE_KEYS = {
  PROFILES: 'nexgenai_profiles_v1',
  LEADS: 'nexgenai_leads_v1',
  CALL_LOGS: 'nexgenai_call_logs_v1',
  FOLLOW_UPS: 'nexgenai_follow_ups_v1',
  TARGETS: 'nexgenai_daily_targets_v1',
  SETTINGS: 'nexgenai_settings_v1',
  CURRENT_USER: 'nexgenai_current_user_v1',
};

// Listeners for realtime reactive updates across components
type EventType = 'LEAD_UPDATED' | 'CALL_LOGGED' | 'TARGET_UPDATED' | 'WORKER_UPDATED' | 'FOLLOWUP_UPDATED';
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

const DEFAULT_LEADS: Lead[] = [
  // Rahul's Leads (10 leads)
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
    assignedWorkerId: 'usr_worker_rahul',
    assignedWorkerName: 'Rahul Kumar',
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
    status: 'CALLED',
    assignedWorkerId: 'usr_worker_rahul',
    assignedWorkerName: 'Rahul Kumar',
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
    status: 'CONNECTED',
    assignedWorkerId: 'usr_worker_rahul',
    assignedWorkerName: 'Rahul Kumar',
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
    notes: 'Follow up at 3:00 PM for software pricing.',
    status: 'FOLLOW-UP',
    assignedWorkerId: 'usr_worker_rahul',
    assignedWorkerName: 'Rahul Kumar',
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
    assignedWorkerId: 'usr_worker_rahul',
    assignedWorkerName: 'Rahul Kumar',
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
    assignedWorkerId: 'usr_worker_rahul',
    assignedWorkerName: 'Rahul Kumar',
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
    assignedWorkerId: 'usr_worker_rahul',
    assignedWorkerName: 'Rahul Kumar',
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
    assignedWorkerId: 'usr_worker_rahul',
    assignedWorkerName: 'Rahul Kumar',
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
    assignedWorkerId: 'usr_worker_rahul',
    assignedWorkerName: 'Rahul Kumar',
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
    assignedWorkerId: 'usr_worker_rahul',
    assignedWorkerName: 'Rahul Kumar',
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Aman's Leads (10 leads)
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
    assignedWorkerId: 'usr_worker_aman',
    assignedWorkerName: 'Aman Kumar',
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
    assignedWorkerId: 'usr_worker_aman',
    assignedWorkerName: 'Aman Kumar',
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
    status: 'CONNECTED',
    assignedWorkerId: 'usr_worker_aman',
    assignedWorkerName: 'Aman Kumar',
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
    assignedWorkerId: 'usr_worker_aman',
    assignedWorkerName: 'Aman Kumar',
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
    assignedWorkerId: 'usr_worker_aman',
    assignedWorkerName: 'Aman Kumar',
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
    status: 'FOLLOW-UP',
    assignedWorkerId: 'usr_worker_aman',
    assignedWorkerName: 'Aman Kumar',
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
    assignedWorkerId: 'usr_worker_aman',
    assignedWorkerName: 'Aman Kumar',
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
    assignedWorkerId: 'usr_worker_aman',
    assignedWorkerName: 'Aman Kumar',
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
    assignedWorkerId: 'usr_worker_aman',
    assignedWorkerName: 'Aman Kumar',
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
    assignedWorkerId: 'usr_worker_aman',
    assignedWorkerName: 'Aman Kumar',
    createdBy: 'usr_admin_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Generate realistic call logs for today to match the prompt's stats
// (Rahul: 12 calls today, 8 connected, 3 remaining / target 15)
// (Aman: 15 calls today, 11 connected, Target completed / target 15)
function generateInitialCallLogs(): CallLog[] {
  const logs: CallLog[] = [];
  const today = new Date().toISOString().split('T')[0];

  // Rahul Kumar calls (12 calls, 8 connected, 2 no answer, 1 busy, 1 failed)
  const rahulCalls = [
    { client: 'ABC Coaching', bus: 'ABC Coaching', phone: '+91 98234 11021', status: 'CONNECTED' as CallStatus, dur: 161, time: '10:42 AM', leadId: 'lead_1' },
    { client: 'Priya Sharma', bus: 'Apex Fitness Gym', phone: '+91 98112 33445', status: 'CONNECTED' as CallStatus, dur: 84, time: '10:55 AM', leadId: 'lead_2' },
    { client: 'Vikram Verma', bus: 'Royal Stay Hotel', phone: '+91 98456 77889', status: 'CONNECTED' as CallStatus, dur: 215, time: '11:15 AM', leadId: 'lead_3' },
    { client: 'Sunita Patel', bus: 'Modern Diagnostic Center', phone: '+91 98771 22334', status: 'CONNECTED' as CallStatus, dur: 140, time: '11:38 AM', leadId: 'lead_4' },
    { client: 'Amit Mishra', bus: 'Mishra Supermarket', phone: '+91 98334 55667', status: 'NO_ANSWER' as CallStatus, dur: 0, time: '12:05 PM', leadId: 'lead_5' },
    { client: 'Neha Gupta', bus: 'Bright Future Public School', phone: '+91 98667 88990', status: 'CONNECTED' as CallStatus, dur: 195, time: '12:30 PM', leadId: 'lead_6' },
    { client: 'Deepak Singh', bus: 'Singh Automobiles', phone: '+91 98223 44556', status: 'BUSY' as CallStatus, dur: 0, time: '01:10 PM', leadId: 'lead_7' },
    { client: 'Anjali Roy', bus: 'Roy Fashion Boutique', phone: '+91 98556 77889', status: 'CONNECTED' as CallStatus, dur: 110, time: '02:00 PM', leadId: 'lead_8' },
    { client: 'Sanjay Yadav', bus: 'Star Diagnostic Lab', phone: '+91 98119 88776', status: 'CONNECTED' as CallStatus, dur: 175, time: '02:45 PM', leadId: 'lead_9' },
    { client: 'Manoj Kumar', bus: 'Express Logistics Hub', phone: '+91 98443 22110', status: 'NO_ANSWER' as CallStatus, dur: 0, time: '03:15 PM', leadId: 'lead_10' },
    { client: 'Raj Kumar', bus: 'ABC Coaching', phone: '+91 98234 11021', status: 'CONNECTED' as CallStatus, dur: 130, time: '03:50 PM', leadId: 'lead_1' },
    { client: 'Deepak Singh', bus: 'Singh Automobiles', phone: '+91 98223 44556', status: 'FAILED' as CallStatus, dur: 0, time: '04:10 PM', leadId: 'lead_7' },
  ];

  rahulCalls.forEach((c, idx) => {
    logs.push({
      id: `log_rahul_${idx + 1}`,
      leadId: c.leadId,
      workerId: 'usr_worker_rahul',
      workerName: 'Rahul Kumar',
      clientName: c.client,
      businessName: c.bus,
      phoneNumber: c.phone,
      providerCallId: `sim_rahul_${idx + 1}`,
      status: c.status,
      startedAt: `${today}T${10 + Math.floor(idx / 2)}:${(idx * 7) % 60}:00.000Z`,
      answeredAt: c.status === 'CONNECTED' ? `${today}T${10 + Math.floor(idx / 2)}:${(idx * 7) % 60}:04.000Z` : undefined,
      endedAt: `${today}T${10 + Math.floor(idx / 2)}:${(idx * 7) % 60}:${c.dur % 60}.000Z`,
      durationSeconds: c.dur,
      createdAt: `${today}T${10 + Math.floor(idx / 2)}:${(idx * 7) % 60}:00.000Z`,
    });
  });

  // Aman Kumar calls (15 calls, 11 connected, 4 not connected)
  const amanCalls = [
    { client: 'XYZ Hotel', bus: 'XYZ Hotel', phone: '+91 97XXXXXX82', status: 'NO_ANSWER' as CallStatus, dur: 0, time: '10:31 AM', leadId: 'lead_13' },
    { client: 'Rajesh Khanna', bus: 'Khanna Sweet House', phone: '+91 97112 33445', status: 'CONNECTED' as CallStatus, dur: 145, time: '10:45 AM', leadId: 'lead_11' },
    { client: 'Pooja Mehra', bus: 'Mehra Dental Clinic', phone: '+91 97223 44556', status: 'CONNECTED' as CallStatus, dur: 190, time: '11:00 AM', leadId: 'lead_12' },
    { client: 'Arvind Swaminathan', bus: 'South Flavors Restaurant', phone: '+91 97334 55667', status: 'CONNECTED' as CallStatus, dur: 230, time: '11:20 AM', leadId: 'lead_13' },
    { client: 'Kavita Desai', bus: 'Sparkle Beauty Parlour', phone: '+91 97445 66778', status: 'CONNECTED' as CallStatus, dur: 95, time: '11:45 AM', leadId: 'lead_14' },
    { client: 'Ramesh Kulkarni', bus: 'Kulkarni Agro Traders', phone: '+91 97556 77889', status: 'BUSY' as CallStatus, dur: 0, time: '12:15 PM', leadId: 'lead_15' },
    { client: 'Farhan Akhtar', bus: 'Green View Resort', phone: '+91 97667 88990', status: 'CONNECTED' as CallStatus, dur: 180, time: '12:40 PM', leadId: 'lead_16' },
    { client: 'Sneha Reddy', bus: 'Reddy Electronics Showroom', phone: '+91 97778 99001', status: 'CONNECTED' as CallStatus, dur: 210, time: '01:30 PM', leadId: 'lead_17' },
    { client: 'Gurpreet Singh', bus: 'Singh Driving School', phone: '+91 97889 00112', status: 'CONNECTED' as CallStatus, dur: 120, time: '02:10 PM', leadId: 'lead_18' },
    { client: 'Meenakshi Sundaram', bus: 'Chennai Silk Palace', phone: '+91 97990 11223', status: 'CONNECTED' as CallStatus, dur: 160, time: '02:40 PM', leadId: 'lead_19' },
    { client: 'Tarun Sen', bus: 'Sen Hardware & Paints', phone: '+91 97001 22334', status: 'NO_ANSWER' as CallStatus, dur: 0, time: '03:00 PM', leadId: 'lead_20' },
    { client: 'Rajesh Khanna', bus: 'Khanna Sweet House', phone: '+91 97112 33445', status: 'CONNECTED' as CallStatus, dur: 140, time: '03:30 PM', leadId: 'lead_11' },
    { client: 'Pooja Mehra', bus: 'Mehra Dental Clinic', phone: '+91 97223 44556', status: 'BUSY' as CallStatus, dur: 0, time: '03:55 PM', leadId: 'lead_12' },
    { client: 'Farhan Akhtar', bus: 'Green View Resort', phone: '+91 97667 88990', status: 'CONNECTED' as CallStatus, dur: 175, time: '04:15 PM', leadId: 'lead_16' },
    { client: 'Sneha Reddy', bus: 'Reddy Electronics Showroom', phone: '+91 97778 99001', status: 'CONNECTED' as CallStatus, dur: 195, time: '04:40 PM', leadId: 'lead_17' },
  ];

  amanCalls.forEach((c, idx) => {
    logs.push({
      id: `log_aman_${idx + 1}`,
      leadId: c.leadId,
      workerId: 'usr_worker_aman',
      workerName: 'Aman Kumar',
      clientName: c.client,
      businessName: c.bus,
      phoneNumber: c.phone,
      providerCallId: `sim_aman_${idx + 1}`,
      status: c.status,
      startedAt: `${today}T${10 + Math.floor(idx / 2)}:${(idx * 8) % 60}:00.000Z`,
      answeredAt: c.status === 'CONNECTED' ? `${today}T${10 + Math.floor(idx / 2)}:${(idx * 8) % 60}:03.000Z` : undefined,
      endedAt: `${today}T${10 + Math.floor(idx / 2)}:${(idx * 8) % 60}:${c.dur % 60}.000Z`,
      durationSeconds: c.dur,
      createdAt: `${today}T${10 + Math.floor(idx / 2)}:${(idx * 8) % 60}:00.000Z`,
    });
  });

  return logs;
}

const DEFAULT_FOLLOW_UPS: FollowUp[] = [
  {
    id: 'fup_1',
    leadId: 'lead_4',
    clientName: 'Sunita Patel',
    businessName: 'Modern Diagnostic Center',
    phoneNumber: '+91 98771 22334',
    workerId: 'usr_worker_rahul',
    workerName: 'Rahul Kumar',
    followUpAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    note: 'Call to confirm telecaller package demo and price discount.',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fup_2',
    leadId: 'lead_16',
    clientName: 'Farhan Akhtar',
    businessName: 'Green View Resort',
    phoneNumber: '+91 97667 88990',
    workerId: 'usr_worker_aman',
    workerName: 'Aman Kumar',
    followUpAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    note: 'Follow up regarding customized caller dashboard for hospitality.',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export interface SystemSettings {
  companyName: string;
  defaultDailyTarget: number;
  timezone: string;
  telephonyProvider: 'MOCK' | 'PRODUCTION';
}

const DEFAULT_SETTINGS: SystemSettings = {
  companyName: 'NexGenAi',
  defaultDailyTarget: 15,
  timezone: 'Asia/Kolkata',
  telephonyProvider: 'MOCK',
};

// Data Store Class
class DataStore {
  private profiles: UserProfile[] = [];
  private leads: Lead[] = [];
  private callLogs: CallLog[] = [];
  private followUps: FollowUp[] = [];
  private targets: Record<string, number> = {};
  private settings: SystemSettings = DEFAULT_SETTINGS;

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
      this.callLogs = c ? JSON.parse(c) : generateInitialCallLogs();

      const f = localStorage.getItem(STORAGE_KEYS.FOLLOW_UPS);
      this.followUps = f ? JSON.parse(f) : DEFAULT_FOLLOW_UPS;

      const s = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      this.settings = s ? JSON.parse(s) : DEFAULT_SETTINGS;

      // Save defaults if clean
      if (!p) this.saveProfiles();
      if (!l) this.saveLeads();
      if (!c) this.saveCallLogs();
      if (!f) this.saveFollowUps();
      if (!s) this.saveSettings();
    } catch (err) {
      console.warn('Storage read error, using defaults:', err);
      this.profiles = DEFAULT_PROFILES;
      this.leads = DEFAULT_LEADS;
      this.callLogs = generateInitialCallLogs();
      this.followUps = DEFAULT_FOLLOW_UPS;
      this.settings = DEFAULT_SETTINGS;
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

  createLead(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: LeadStatus }): Lead {
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
    broadcast('LEAD_UPDATED', newLead);
    return newLead;
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

    if (updates.assignedWorkerId && updates.assignedWorkerId !== this.leads[idx].assignedWorkerId) {
      const worker = this.getProfileById(updates.assignedWorkerId);
      updates.assignedWorkerName = worker?.fullName;
    }

    this.leads[idx] = { ...this.leads[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveLeads();
    broadcast('LEAD_UPDATED', this.leads[idx]);
    return this.leads[idx];
  }

  assignLead(leadId: string, workerId: string): Lead {
    return this.updateLead(leadId, { assignedWorkerId: workerId });
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

    // Filter calls for this worker today (both created_at and started_at check)
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

    // Calls today across all workers
    const callsTodayList = this.callLogs.filter((c) => {
      const cDate = (c.startedAt || c.createdAt).split('T')[0];
      return cDate === today;
    });

    const callsToday = callsTodayList.length;
    const connectedToday = callsTodayList.filter((c) => c.status === 'CONNECTED').length;

    // Pending leads (NEW status or uncalled)
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
    this.loadFromStorage();
    broadcast('LEAD_UPDATED', null);
  }
}

export const dataStore = new DataStore();
