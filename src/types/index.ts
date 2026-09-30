export type UserRole = 'ADMIN' | 'WORKER';

export type LeadStatus =
  | 'NEW'
  | 'CALLED'
  | 'CONNECTED'
  | 'FOLLOW-UP'
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'CONVERTED';

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type CallStatus =
  | 'INITIATED'
  | 'RINGING'
  | 'CONNECTED'
  | 'COMPLETED'
  | 'NO_ANSWER'
  | 'BUSY'
  | 'FAILED';

export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  dailyTarget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  clientName: string;
  businessName?: string;
  phoneNumber: string;
  city?: string;
  businessType?: string;
  priority: LeadPriority;
  notes?: string;
  status: LeadStatus;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadAssignment {
  id: string;
  leadId: string;
  workerId: string;
  assignedBy?: string;
  assignedAt: string;
}

export interface CallLog {
  id: string;
  leadId: string;
  workerId: string;
  workerName?: string;
  clientName?: string;
  businessName?: string;
  phoneNumber: string;
  providerCallId?: string;
  status: CallStatus;
  startedAt: string;
  answeredAt?: string;
  endedAt?: string;
  durationSeconds: number;
  outcome?: LeadStatus;
  notes?: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  clientName?: string;
  businessName?: string;
  phoneNumber?: string;
  workerId: string;
  workerName?: string;
  followUpAt: string; // ISO string with date and time
  note?: string;
  status: FollowUpStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DailyTarget {
  id: string;
  workerId: string;
  targetDate: string; // YYYY-MM-DD
  targetCalls: number;
}

export interface WorkerPerformance {
  workerId: string;
  workerName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  dailyTarget: number;
  callsToday: number;
  connectedToday: number;
  noAnswerToday: number;
  busyToday: number;
  failedToday: number;
  remainingCalls: number;
  connectionRate: number; // percentage e.g. 66.7
  avgDurationSeconds: number;
  isTargetCompleted: boolean;
}

export interface CsvImportRow {
  client_name: string;
  business_name?: string;
  phone_number: string;
  city?: string;
  business_type?: string;
  priority?: string;
  notes?: string;
}

export interface CsvValidationResult {
  rowNumber: number;
  raw: Record<string, string>;
  isValid: boolean;
  errors: string[];
  parsedLead?: Partial<Lead>;
}

export interface TelephonyCallSession {
  callId: string;
  leadId: string;
  workerId: string;
  clientName: string;
  businessName?: string;
  phoneNumber: string;
  status: CallStatus;
  startTime: number;
  answeredTime?: number;
  endTime?: number;
  durationSeconds: number;
}

export interface EmailDispatchLog {
  id: string;
  workerId: string;
  workerName: string;
  workerEmail: string;
  subject: string;
  messageBody: string;
  leadsCount: number;
  leadNames: string[];
  csvFilename: string;
  csvContent: string;
  sentAt: string;
  status: 'DELIVERED' | 'SENT';
}

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'WHATSAPP';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'NOT_CONFIGURED';
export type NotificationType = 'LEAD_ASSIGNMENT' | 'FOLLOW_UP' | 'TARGET_REMINDER' | 'SYSTEM';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  sentAt?: string;
  errorMessage?: string;
  linkUrl?: string;
}

export interface AssignmentNotificationLog {
  id: string;
  batchId: string;
  workerId: string;
  workerName: string;
  workerEmail: string;
  workerPhone?: string;
  leadCount: number;
  leadIds: string[];
  leadNames: string[];
  emailStatus: NotificationStatus;
  whatsappStatus: NotificationStatus;
  inAppStatus: NotificationStatus;
  emailError?: string;
  whatsappError?: string;
  summary: {
    newlyAssigned: number;
    totalAssignedToday: number;
    dailyTarget: number;
    callsCompleted: number;
    remainingCalls: number;
  };
  createdAt: string;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  inAppEnabled: boolean;
  emailProvider?: 'RESEND' | 'SENDGRID' | 'SMTP' | 'MOCK';
  whatsappProvider?: 'META_CLOUD_API' | 'TWILIO' | 'MOCK';
}

