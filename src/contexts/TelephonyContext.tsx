import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { TelephonyCallSession, CallStatus, Lead, LeadStatus } from '../types';
import { defaultTelephonyService } from '../services/telephony/telephonyService';
import { dataStore } from '../services/storage/dataStore';
import confetti from 'canvas-confetti';

interface TelephonyContextType {
  activeSession: TelephonyCallSession | null;
  isCallModalOpen: boolean;
  isOutcomeModalOpen: boolean;
  completedSession: TelephonyCallSession | null;
  currentCallDuration: number; // in seconds
  initiateCall: (lead: Lead, workerId: string, outcomeOverride?: 'CONNECTED' | 'NO_ANSWER' | 'BUSY' | 'FAILED') => Promise<void>;
  endActiveCall: () => Promise<void>;
  saveCallOutcome: (outcome: LeadStatus, note?: string, followUpDate?: string) => void;
  closeOutcomeModal: () => void;
}

const TelephonyContext = createContext<TelephonyContextType | undefined>(undefined);

export const TelephonyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSession, setActiveSession] = useState<TelephonyCallSession | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState<boolean>(false);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState<boolean>(false);
  const [completedSession, setCompletedSession] = useState<TelephonyCallSession | null>(null);
  const [currentCallDuration, setCurrentCallDuration] = useState<number>(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subscribe to telephony events
  useEffect(() => {
    const unsubscribe = defaultTelephonyService.subscribeCallEvents((session) => {
      if (activeSession && session.callId === activeSession.callId) {
        setActiveSession({ ...session });

        if (session.status === 'CONNECTED' && !timerRef.current) {
          // Start call duration ticker
          const startTimestamp = session.answeredTime || Date.now();
          timerRef.current = setInterval(() => {
            const elapsed = Math.max(1, Math.round((Date.now() - startTimestamp) / 1000));
            setCurrentCallDuration(elapsed);
          }, 1000);
        } else if (
          session.status === 'COMPLETED' ||
          session.status === 'NO_ANSWER' ||
          session.status === 'BUSY' ||
          session.status === 'FAILED'
        ) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      }
    });

    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeSession]);

  const initiateCall = async (
    lead: Lead,
    workerId: string,
    outcomeOverride?: 'CONNECTED' | 'NO_ANSWER' | 'BUSY' | 'FAILED'
  ) => {
    setCurrentCallDuration(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const session = await defaultTelephonyService.initiateCall({
      leadId: lead.id,
      workerId,
      clientName: lead.clientName,
      businessName: lead.businessName,
      phoneNumber: lead.phoneNumber,
      simulationOutcome: outcomeOverride || 'CONNECTED',
    });

    setActiveSession(session);
    setIsCallModalOpen(true);
  };

  const endActiveCall = async () => {
    if (!activeSession) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const finalSession = await defaultTelephonyService.endCall(activeSession.callId);
    
    // Auto record call log
    dataStore.recordCallLog({
      leadId: finalSession.leadId,
      workerId: finalSession.workerId,
      phoneNumber: finalSession.phoneNumber,
      clientName: finalSession.clientName,
      businessName: finalSession.businessName,
      providerCallId: finalSession.callId,
      status: finalSession.status,
      startedAt: new Date(finalSession.startTime).toISOString(),
      answeredAt: finalSession.answeredTime ? new Date(finalSession.answeredTime).toISOString() : undefined,
      endedAt: finalSession.endTime ? new Date(finalSession.endTime).toISOString() : new Date().toISOString(),
      durationSeconds: finalSession.durationSeconds || currentCallDuration || 0,
    });

    // Check if worker completed today's target
    const workerPerf = dataStore.getWorkerPerformance(finalSession.workerId);
    if (workerPerf.callsToday === workerPerf.dailyTarget) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    setCompletedSession(finalSession);
    setIsCallModalOpen(false);
    setIsOutcomeModalOpen(true);
    setActiveSession(null);
  };

  const saveCallOutcome = (outcome: LeadStatus, note?: string, followUpDate?: string) => {
    if (!completedSession) {
      setIsOutcomeModalOpen(false);
      return;
    }

    // If follow-up selected, create follow up record
    if (outcome === 'FOLLOW-UP' && followUpDate) {
      dataStore.createFollowUp({
        leadId: completedSession.leadId,
        workerId: completedSession.workerId,
        followUpAt: followUpDate,
        note: note || 'Follow-up requested after call.',
      });
    } else {
      // Update lead with note & status
      dataStore.updateLead(completedSession.leadId, {
        status: outcome,
        notes: note ? note : undefined,
      });
    }

    setIsOutcomeModalOpen(false);
    setCompletedSession(null);
  };

  const closeOutcomeModal = () => {
    setIsOutcomeModalOpen(false);
    setCompletedSession(null);
  };

  return (
    <TelephonyContext.Provider
      value={{
        activeSession,
        isCallModalOpen,
        isOutcomeModalOpen,
        completedSession,
        currentCallDuration,
        initiateCall,
        endActiveCall,
        saveCallOutcome,
        closeOutcomeModal,
      }}
    >
      {children}
    </TelephonyContext.Provider>
  );
};

export const useTelephony = () => {
  const context = useContext(TelephonyContext);
  if (!context) {
    throw new Error('useTelephony must be used within a TelephonyProvider');
  }
  return context;
};
