import {
  Lead,
  UserProfile,
  AssignmentNotificationLog,
  AppNotification,
  NotificationStatus,
} from '../../types';
import { emailService } from './emailService';
import { whatsappService } from './whatsappService';
import { dataStore } from '../storage/dataStore';
import { isSupabaseConfigured, supabase } from '../supabase/supabaseClient';

export interface NotifyLeadAssignmentParams {
  worker: UserProfile;
  leads: Lead[];
  adminId?: string;
}

class NotificationService {
  async notifyLeadAssignment({
    worker,
    leads,
  }: NotifyLeadAssignmentParams): Promise<AssignmentNotificationLog> {
    if (leads.length === 0) {
      throw new Error('No leads provided for notification.');
    }

    const batchId = 'batch_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const settings = dataStore.getSettings();
    const notifSettings = settings.notificationSettings || {
      emailEnabled: true,
      whatsappEnabled: true,
      inAppEnabled: true,
    };

    // Calculate dynamic stats
    const perf = dataStore.getWorkerPerformance(worker.id);
    const workerAssignedLeads = dataStore.getLeads(worker.id);

    const summary = {
      newlyAssigned: leads.length,
      totalAssignedToday: workerAssignedLeads.length,
      dailyTarget: worker.dailyTarget || settings.defaultDailyTarget || 15,
      callsCompleted: perf.callsToday,
      remainingCalls: Math.max(0, (worker.dailyTarget || 15) - perf.callsToday),
    };

    const ctx = {
      worker,
      leads,
      summary,
    };

    // 1. In-App Notification
    let inAppStatus: NotificationStatus = 'PENDING';
    if (notifSettings.inAppEnabled !== false) {
      const inAppNotif: AppNotification = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        userId: worker.id,
        type: 'LEAD_ASSIGNMENT',
        title: leads.length === 1 ? 'New Lead Assigned' : `${leads.length} New Leads Assigned`,
        message:
          leads.length === 1
            ? `New lead "${leads[0].clientName}" (${leads[0].businessName || leads[0].phoneNumber}) has been assigned to you.`
            : `${leads.length} new client leads have been assigned to your telecaller queue today.`,
        channel: 'IN_APP',
        status: 'SENT',
        isRead: false,
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        linkUrl: 'worker/leads',
        metadata: {
          batchId,
          leadCount: leads.length,
          leadIds: leads.map((l) => l.id),
        },
      };

      dataStore.addNotification(inAppNotif);
      inAppStatus = 'SENT';

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('notifications').insert({
            id: inAppNotif.id,
            user_id: worker.id,
            type: inAppNotif.type,
            title: inAppNotif.title,
            message: inAppNotif.message,
            channel: inAppNotif.channel,
            status: inAppNotif.status,
            is_read: false,
            metadata: inAppNotif.metadata,
            created_at: inAppNotif.createdAt,
          });
        } catch (e) {
          console.warn('Supabase in-app notification sync error:', e);
        }
      }
    }

    // 2. Email Notification (Grouped into ONE email if multiple leads)
    let emailStatus: NotificationStatus = 'PENDING';
    let emailError: string | undefined;

    if (notifSettings.emailEnabled !== false) {
      const emailRes = await emailService.sendAssignmentEmail(ctx);
      emailStatus = emailRes.status;
      emailError = emailRes.error;
    } else {
      emailStatus = 'NOT_CONFIGURED';
      emailError = 'Email notifications disabled in settings';
    }

    // 3. WhatsApp Notification (Grouped into ONE WhatsApp message if multiple leads)
    let whatsappStatus: NotificationStatus = 'PENDING';
    let whatsappError: string | undefined;

    if (notifSettings.whatsappEnabled !== false) {
      const waRes = await whatsappService.sendAssignmentWhatsApp(ctx, true);
      whatsappStatus = waRes.status;
      whatsappError = waRes.error;
    } else {
      whatsappStatus = 'NOT_CONFIGURED';
      whatsappError = 'WhatsApp notifications disabled in settings';
    }

    // 4. Create and record AssignmentNotificationLog
    const log: AssignmentNotificationLog = {
      id: 'notif_log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      batchId,
      workerId: worker.id,
      workerName: worker.fullName,
      workerEmail: worker.email,
      workerPhone: worker.phone,
      leadCount: leads.length,
      leadIds: leads.map((l) => l.id),
      leadNames: leads.map((l) => l.clientName),
      emailStatus,
      whatsappStatus,
      inAppStatus,
      emailError,
      whatsappError,
      summary,
      createdAt: new Date().toISOString(),
    };

    dataStore.addAssignmentNotificationLog(log);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('assignment_notification_logs').insert({
          id: log.id,
          batch_id: log.batchId,
          worker_id: log.workerId,
          lead_count: log.leadCount,
          lead_ids: log.leadIds,
          email_status: log.emailStatus,
          whatsapp_status: log.whatsappStatus,
          in_app_status: log.inAppStatus,
          email_error: log.emailError || null,
          whatsapp_error: log.whatsappError || null,
          metadata: { summary: log.summary, leadNames: log.leadNames },
          created_at: log.createdAt,
        });
      } catch (e) {
        console.warn('Supabase notification log sync error:', e);
      }
    }

    return log;
  }

  // Retry failed notification without modifying lead assignments
  async retryNotification(
    logId: string,
    channel: 'EMAIL' | 'WHATSAPP'
  ): Promise<AssignmentNotificationLog> {
    const log = dataStore.getAssignmentNotificationLogById(logId);
    if (!log) {
      throw new Error('Notification log not found.');
    }

    const worker = dataStore.getProfileById(log.workerId);
    if (!worker) {
      throw new Error('Worker profile not found.');
    }

    const leads = log.leadIds
      .map((id) => dataStore.getLeadById(id))
      .filter((l): l is Lead => !!l);

    const ctx = {
      worker,
      leads: leads.length > 0 ? leads : [{ id: 'mock', clientName: 'Assigned Client', phoneNumber: '+91 98000 00000', priority: 'HIGH' as const, status: 'NEW' as const, createdAt: '', updatedAt: '' }],
      summary: log.summary,
    };

    if (channel === 'EMAIL') {
      const emailRes = await emailService.sendAssignmentEmail(ctx);
      log.emailStatus = emailRes.status;
      log.emailError = emailRes.error;
    } else if (channel === 'WHATSAPP') {
      const waRes = await whatsappService.sendAssignmentWhatsApp(ctx, true);
      log.whatsappStatus = waRes.status;
      log.whatsappError = waRes.error;
    }

    dataStore.updateAssignmentNotificationLog(log);
    return log;
  }
}

export const notificationService = new NotificationService();
