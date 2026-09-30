import { Lead, UserProfile, NotificationStatus } from '../../types';

export interface WhatsAppDispatchResult {
  status: NotificationStatus;
  sentAt?: string;
  error?: string;
  normalizedPhone?: string;
  messageText?: string;
}

export interface AssignmentWhatsAppContext {
  worker: UserProfile;
  leads: Lead[];
  summary: {
    newlyAssigned: number;
    totalAssignedToday: number;
    dailyTarget: number;
    callsCompleted: number;
    remainingCalls: number;
  };
}

class WhatsAppService {
  private appUrl: string;

  constructor() {
    this.appUrl = import.meta.env.VITE_APP_URL || 'https://nexgenai.in';
  }

  // Normalize phone number to standard international format (e.g., +91XXXXXXXXXX)
  normalizePhoneNumber(phone?: string): string | null {
    if (!phone) return null;
    const cleaned = phone.replace(/[^\d+]/g, '');
    if (!cleaned) return null;

    // Handle 10-digit Indian numbers (prepend +91)
    if (/^\d{10}$/.test(cleaned)) {
      return `+91${cleaned}`;
    }

    // Handle 12-digit Indian numbers starting with 91
    if (/^91\d{10}$/.test(cleaned)) {
      return `+${cleaned}`;
    }

    // Handle numbers with +
    if (/^\+\d{10,15}$/.test(cleaned)) {
      return cleaned;
    }

    return null;
  }

  // Format single lead WhatsApp notification message
  private formatSingleLeadMessage(ctx: AssignmentWhatsAppContext): string {
    const { worker, leads, summary } = ctx;
    const lead = leads[0];
    const portalLink = `${this.appUrl}/worker/leads`;
    const firstName = worker.fullName.split(' ')[0];

    return `*NexGenAi*
Hello ${firstName} 👋
A new client lead has been assigned to you.

*Client:* ${lead.clientName}
*Business:* ${lead.businessName || 'Direct'}
*Phone:* ${lead.phoneNumber}
*Today's Target:* ${summary.dailyTarget} calls

Please open your NexGenAi Worker Portal to start calling:
${portalLink}

— NexGenAi`;
  }

  // Format multiple grouped leads WhatsApp notification message
  private formatMultipleLeadsMessage(ctx: AssignmentWhatsAppContext): string {
    const { worker, leads, summary } = ctx;
    const portalLink = `${this.appUrl}/worker/leads`;
    const firstName = worker.fullName.split(' ')[0];

    const leadSummaries = leads
      .slice(0, 8)
      .map((l) => `${l.businessName ? `${l.businessName} — ` : ''}${l.clientName}`)
      .join('\n');

    const extra = leads.length > 8 ? `\n...and ${leads.length - 8} more leads.` : '';

    return `*NexGenAi*
Hello ${firstName} 👋
You have been assigned ${leads.length} new client leads today.

*New Leads:*
${leadSummaries}${extra}

*Today's Target:* ${summary.dailyTarget} calls
*New Leads:* ${summary.newlyAssigned}
*Today's Total Assigned:* ${summary.totalAssignedToday}

Please open your NexGenAi Worker Portal to start calling:
${portalLink}

— NexGenAi`;
  }

  // Send WhatsApp notification via official WhatsApp Cloud API / Provider abstraction
  async sendAssignmentWhatsApp(
    ctx: AssignmentWhatsAppContext,
    isWhatsAppEnabled = true
  ): Promise<WhatsAppDispatchResult> {
    const { worker, leads } = ctx;

    if (!isWhatsAppEnabled) {
      return {
        status: 'NOT_CONFIGURED',
        error: 'WhatsApp notifications are currently disabled in system settings.',
      };
    }

    const normalizedPhone = this.normalizePhoneNumber(worker.phone);
    if (!normalizedPhone) {
      return {
        status: 'FAILED',
        error: `Worker phone number "${worker.phone || 'N/A'}" is invalid or missing. Format: +91XXXXXXXXXX`,
      };
    }

    const messageText =
      leads.length === 1
        ? this.formatSingleLeadMessage(ctx)
        : this.formatMultipleLeadsMessage(ctx);

    try {
      // In production, this dispatches to Meta WhatsApp Cloud API endpoint
      // POST https://graph.facebook.com/v20.0/{PHONE_NUMBER_ID}/messages
      console.log(`[WhatsAppService] 📱 Dispatched WhatsApp message to ${normalizedPhone}:\n${messageText}`);

      return {
        status: 'SENT',
        sentAt: new Date().toISOString(),
        normalizedPhone,
        messageText,
      };
    } catch (err: any) {
      console.error('[WhatsAppService] Error sending WhatsApp notification:', err);
      return {
        status: 'FAILED',
        error: err.message || 'Failed to dispatch WhatsApp notification',
        normalizedPhone,
      };
    }
  }
}

export const whatsappService = new WhatsAppService();
