import React from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../services/storage/dataStore';
import {
  User,
  Mail,
  Phone,
  Target,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';

export const WorkerProfile: React.FC = () => {
  const { user, logout, quickLogin } = useAuth();
  const workerId = user?.id || 'usr_worker_rahul';
  const perf = dataStore.getWorkerPerformance(workerId);

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-24 animate-in fade-in duration-200">
      <div className="pb-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#172017] tracking-tight">
          My Profile
        </h1>
        <p className="text-xs text-[#6B756D]">Telecaller account details and performance statistics</p>
      </div>

      {/* Profile Card */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0BAA45] text-white font-extrabold text-2xl flex items-center justify-center shadow-sm">
            {user?.fullName.split(' ').map((n) => n[0]).join('') || 'W'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#172017]">{user?.fullName}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E9F9EF] text-[#0BAA45] border border-[#16C763]/30">
                Active Telecaller
              </span>
            </div>
            <div className="text-xs text-[#6B756D] font-medium mt-0.5">NexGenAi Workforce</div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-[#E5E9E5] text-xs">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-[#6B756D] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#0BAA45]" /> Email Address
            </span>
            <span className="font-semibold text-[#172017]">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-[#6B756D] flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#0BAA45]" /> Contact Phone
            </span>
            <span className="font-semibold text-[#172017] font-mono">{user?.phone || '+91 98765 43210'}</span>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-[#6B756D] flex items-center gap-2">
              <Target className="w-4 h-4 text-[#0BAA45]" /> Configured Daily Target
            </span>
            <span className="font-bold text-[#0BAA45]">{perf.dailyTarget} Calls / Day</span>
          </div>
        </div>
      </Card>

      {/* Today's Stats Summary */}
      <Card className="p-5">
        <h3 className="text-sm font-bold text-[#172017] mb-3">Today's Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
            <div className="text-[11px] text-[#6B756D] font-semibold">Calls Made</div>
            <div className="text-xl font-bold text-[#172017] mt-0.5">{perf.callsToday}</div>
          </div>
          <div className="p-3 bg-[#E9F9EF] rounded-xl border border-[#16C763]/40">
            <div className="text-[11px] text-[#0BAA45] font-semibold">Connected</div>
            <div className="text-xl font-bold text-[#0BAA45] mt-0.5">{perf.connectedToday}</div>
          </div>
          <div className="p-3 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
            <div className="text-[11px] text-[#6B756D] font-semibold">Remaining</div>
            <div className="text-xl font-bold text-[#F59E0B] mt-0.5">{perf.remainingCalls}</div>
          </div>
          <div className="p-3 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
            <div className="text-[11px] text-[#6B756D] font-semibold">Success Rate</div>
            <div className="text-xl font-bold text-[#172017] mt-0.5">{perf.connectionRate}%</div>
          </div>
        </div>
      </Card>

      {/* Quick Switch for Reviewers */}
      <Card className="p-5 bg-[#F7F8F6] border-[#E5E9E5]">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#6B756D] flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#0BAA45]" />
            <span>Switch Portal / Account</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => quickLogin('usr_admin_1')}
            className="p-2.5 bg-white hover:bg-[#E9F9EF] text-[#172017] hover:text-[#0BAA45] border border-[#E5E9E5] rounded-xl text-xs font-bold transition-all text-center"
          >
            🛡️ Admin
          </button>
          <button
            onClick={() => quickLogin('usr_worker_rahul')}
            className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border ${
              user?.id === 'usr_worker_rahul'
                ? 'bg-[#E9F9EF] text-[#0BAA45] border-[#16C763]'
                : 'bg-white hover:bg-[#E9F9EF] text-[#172017] border-[#E5E9E5]'
            }`}
          >
            👤 Rahul
          </button>
          <button
            onClick={() => quickLogin('usr_worker_aman')}
            className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border ${
              user?.id === 'usr_worker_aman'
                ? 'bg-[#E9F9EF] text-[#0BAA45] border-[#16C763]'
                : 'bg-white hover:bg-[#E9F9EF] text-[#172017] border-[#E5E9E5]'
            }`}
          >
            👤 Aman
          </button>
        </div>
      </Card>

      {/* Logout Button */}
      <Button
        type="button"
        variant="danger"
        size="lg"
        onClick={logout}
        className="w-full h-12 font-bold"
        icon={<LogOut className="w-4 h-4" />}
      >
        LOGOUT
      </Button>
    </div>
  );
};
