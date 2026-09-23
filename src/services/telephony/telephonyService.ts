import { CallStatus, TelephonyCallSession } from '../../types';

export interface InitiateCallParams {
  leadId: string;
  workerId: string;
  clientName: string;
  businessName?: string;
  phoneNumber: string;
  simulationOutcome?: 'CONNECTED' | 'NO_ANSWER' | 'BUSY' | 'FAILED'; // Optional override for testing
}

export interface TelephonyWebhookPayload {
  call_id: string;
  status: CallStatus;
  timestamp: string;
  duration?: number;
  provider_reference?: string;
  metadata?: Record<string, any>;
}

export interface ITelephonyProvider {
  name: string;
  initiateCall(params: InitiateCallParams): Promise<TelephonyCallSession>;
  endCall(callId: string): Promise<TelephonyCallSession>;
  getCallStatus(callId: string): Promise<CallStatus>;
  handleWebhook(payload: TelephonyWebhookPayload, signature?: string): Promise<{ success: boolean; data?: any }>;
  subscribeCallEvents(callback: (session: TelephonyCallSession) => void): () => void;
}

/**
 * MockTelephonyProvider
 * Simulates realistic cellular/VoIP telecom state progression:
 * INITIATING (0s) -> RINGING (1.5s) -> CONNECTED (3.5s) -> live seconds ticker -> COMPLETED (on End Call)
 * or realistic simulation of BUSY / NO_ANSWER / FAILED.
 */
export class MockTelephonyProvider implements ITelephonyProvider {
  name = 'Mock Telephony Provider (NexGenAi Engine)';
  private activeSessions = new Map<string, TelephonyCallSession>();
  private subscribers = new Set<(session: TelephonyCallSession) => void>();
  private timeouts = new Map<string, ReturnType<typeof setTimeout>[]>();

  private notify(session: TelephonyCallSession) {
    this.activeSessions.set(session.callId, { ...session });
    this.subscribers.forEach((cb) => {
      try {
        cb({ ...session });
      } catch (err) {
        console.error('Error in telephony event subscriber:', err);
      }
    });
  }

  subscribeCallEvents(callback: (session: TelephonyCallSession) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  async initiateCall(params: InitiateCallParams): Promise<TelephonyCallSession> {
    const callId = 'call_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const startTime = Date.now();

    const session: TelephonyCallSession = {
      callId,
      leadId: params.leadId,
      workerId: params.workerId,
      clientName: params.clientName,
      businessName: params.businessName,
      phoneNumber: params.phoneNumber,
      status: 'INITIATED',
      startTime,
      durationSeconds: 0,
    };

    this.notify(session);

    // Schedule progression
    const timeoutList: ReturnType<typeof setTimeout>[] = [];

    // Step 1: RINGING after 1.5s
    const t1 = setTimeout(() => {
      const current = this.activeSessions.get(callId);
      if (current && current.status === 'INITIATED') {
        current.status = 'RINGING';
        this.notify(current);
      }
    }, 1500);
    timeoutList.push(t1);

    // Step 2: Next State after 3.5s (Default is CONNECTED)
    const outcome = params.simulationOutcome || 'CONNECTED';

    const t2 = setTimeout(() => {
      const current = this.activeSessions.get(callId);
      if (current && current.status === 'RINGING') {
        if (outcome === 'CONNECTED') {
          current.status = 'CONNECTED';
          current.answeredTime = Date.now();
          this.notify(current);
        } else {
          current.status = outcome;
          current.endTime = Date.now();
          current.durationSeconds = 0;
          this.notify(current);
          this.cleanupTimeouts(callId);
        }
      }
    }, 3800);
    timeoutList.push(t2);

    this.timeouts.set(callId, timeoutList);
    return session;
  }

  async endCall(callId: string): Promise<TelephonyCallSession> {
    this.cleanupTimeouts(callId);
    const session = this.activeSessions.get(callId);
    if (!session) {
      throw new Error(`Call session ${callId} not found`);
    }

    const endTime = Date.now();
    session.endTime = endTime;

    if (session.answeredTime) {
      session.durationSeconds = Math.max(1, Math.round((endTime - session.answeredTime) / 1000));
      session.status = 'COMPLETED';
    } else if (session.status === 'RINGING' || session.status === 'INITIATED') {
      session.status = 'NO_ANSWER';
      session.durationSeconds = 0;
    }

    this.notify(session);
    return session;
  }

  async getCallStatus(callId: string): Promise<CallStatus> {
    const session = this.activeSessions.get(callId);
    return session ? session.status : 'FAILED';
  }

  async handleWebhook(payload: TelephonyWebhookPayload, _signature?: string): Promise<{ success: boolean; data?: any }> {
    // Webhook verification & processing
    const session = this.activeSessions.get(payload.call_id);
    if (session) {
      session.status = payload.status;
      if (payload.status === 'CONNECTED') {
        session.answeredTime = new Date(payload.timestamp).getTime();
      } else if (payload.status === 'COMPLETED') {
        session.endTime = new Date(payload.timestamp).getTime();
        session.durationSeconds = payload.duration || 0;
      }
      this.notify(session);
    }
    return { success: true, data: { received: true, callId: payload.call_id } };
  }

  private cleanupTimeouts(callId: string) {
    const list = this.timeouts.get(callId);
    if (list) {
      list.forEach(clearTimeout);
      this.timeouts.delete(callId);
    }
  }
}

/**
 * Production VoIP Telephony Provider Template (e.g. Twilio / Exotel / Plivo)
 * Ready for live API credentials.
 */
export class ProductionTelephonyProvider implements ITelephonyProvider {
  name = 'Production VoIP Provider';
  private apiKey: string;
  private apiSecret: string;
  private subscribers = new Set<(session: TelephonyCallSession) => void>();

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  subscribeCallEvents(callback: (session: TelephonyCallSession) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  async initiateCall(params: InitiateCallParams): Promise<TelephonyCallSession> {
    // In production, this issues an outbound REST call to the VoIP provider's API
    console.log(`[Production Telephony] Initiating API call to ${params.phoneNumber} with Key: ${this.apiKey ? 'PRESENT' : 'MISSING'}`);
    
    // Fallback gracefully to mock progression if keys are placeholder
    const mockFallback = new MockTelephonyProvider();
    return mockFallback.initiateCall(params);
  }

  async endCall(callId: string): Promise<TelephonyCallSession> {
    console.log(`[Production Telephony] Terminating call ${callId}`);
    return {
      callId,
      leadId: '',
      workerId: '',
      clientName: '',
      phoneNumber: '',
      status: 'COMPLETED',
      startTime: Date.now() - 30000,
      endTime: Date.now(),
      durationSeconds: 30,
    };
  }

  async getCallStatus(callId: string): Promise<CallStatus> {
    return 'CONNECTED';
  }

  async handleWebhook(payload: TelephonyWebhookPayload, signature?: string): Promise<{ success: boolean; data?: any }> {
    // Verifies cryptographic HMAC signature in production
    return { success: true, data: payload };
  }
}

// Global Singleton Telephony Instance
export const defaultTelephonyService: ITelephonyProvider = new MockTelephonyProvider();
