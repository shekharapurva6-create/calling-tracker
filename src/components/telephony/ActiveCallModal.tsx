import React from 'react';
import { Phone, PhoneOff, User, Building2 } from 'lucide-react';
import { useTelephony } from '../../contexts/TelephonyContext';
import { Button } from '../common/Button';

export const ActiveCallModal: React.FC = () => {
  const { activeSession, isCallModalOpen, currentCallDuration, endActiveCall } = useTelephony();

  if (!isCallModalOpen || !activeSession) return null;

  // Format seconds to MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusDisplay = () => {
    switch (activeSession.status) {
      case 'INITIATED':
        return { text: 'CALLING...', color: 'text-[#6B756D]', pulse: true };
      case 'RINGING':
        return { text: 'RINGING...', color: 'text-[#0BAA45]', pulse: true };
      case 'CONNECTED':
        return { text: 'CONNECTED', color: 'text-[#0BAA45]', pulse: false };
      case 'NO_ANSWER':
        return { text: 'NO ANSWER', color: 'text-[#6B756D]', pulse: false };
      case 'BUSY':
        return { text: 'BUSY', color: 'text-[#F59E0B]', pulse: false };
      case 'FAILED':
        return { text: 'FAILED', color: 'text-[#E53935]', pulse: false };
      default:
        return { text: activeSession.status, color: 'text-[#6B756D]', pulse: false };
    }
  };

  const statusInfo = getStatusDisplay();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172017]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-[#E5E9E5] overflow-hidden p-6 text-center animate-in zoom-in-95 duration-200">
        
        {/* Brand Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E9F9EF] rounded-full text-xs font-semibold text-[#0BAA45] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#0BAA45] animate-pulse"></span>
          NexGenAi Telephony
        </div>

        {/* Client Details */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#172017] tracking-tight">{activeSession.clientName}</h2>
          {activeSession.businessName && (
            <div className="flex items-center justify-center gap-1 text-sm text-[#6B756D] mt-1 font-medium">
              <Building2 className="w-4 h-4 text-[#6B756D]" />
              <span>{activeSession.businessName}</span>
            </div>
          )}
          <div className="text-base text-[#172017] font-semibold mt-2 tracking-wider font-mono">
            {activeSession.phoneNumber}
          </div>
        </div>

        {/* Call Animation / Icon */}
        <div className="my-8 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {activeSession.status === 'CONNECTED' && (
              <div className="absolute w-28 h-28 rounded-full bg-[#E9F9EF] animate-pulse-ring pointer-events-none" />
            )}
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                activeSession.status === 'CONNECTED'
                  ? 'bg-[#0BAA45] text-white shadow-call-glow'
                  : 'bg-[#E9F9EF] text-[#0BAA45]'
              }`}
            >
              <Phone className={`w-10 h-10 ${activeSession.status === 'CONNECTED' ? 'animate-bounce' : 'animate-pulse'}`} />
            </div>
          </div>

          {/* Status Text & Timer */}
          <div className="mt-6">
            <div className={`text-sm font-bold uppercase tracking-widest ${statusInfo.color} flex items-center justify-center gap-2`}>
              {activeSession.status === 'CONNECTED' && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#0BAA45] animate-ping" />
              )}
              {statusInfo.text}
            </div>

            {activeSession.status === 'CONNECTED' ? (
              <div className="text-3xl font-extrabold text-[#172017] mt-2 font-mono tracking-wider">
                {formatTime(currentCallDuration)}
              </div>
            ) : (
              <div className="text-xs text-[#6B756D] mt-2 font-medium">
                Connecting via NexGenAi telecaller network...
              </div>
            )}
          </div>
        </div>

        {/* End Call Button */}
        <div className="mt-6">
          <button
            onClick={endActiveCall}
            className="w-full h-14 min-h-[52px] bg-[#E53935] hover:bg-[#cc2e2a] active:scale-[0.98] text-white rounded-2xl font-bold text-base shadow-lg shadow-[#E53935]/25 flex items-center justify-center gap-3 transition-all cursor-pointer"
          >
            <PhoneOff className="w-5 h-5" />
            <span>END CALL</span>
          </button>
        </div>

        {/* Informative footer */}
        <p className="text-[11px] text-[#6B756D] mt-4 font-medium">
          Call duration and outcome are automatically tracked & saved.
        </p>
      </div>
    </div>
  );
};
