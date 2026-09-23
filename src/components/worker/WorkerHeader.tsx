import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, ArrowRightLeft, Shield } from 'lucide-react';

export const WorkerHeader: React.FC = () => {
  const { user, logout, quickLogin } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.fullName.split(' ')[0] || 'Worker';

  return (
    <header className="bg-white border-b border-[#E5E9E5] sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand & Greeting */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0BAA45] flex items-center justify-center text-white font-extrabold text-base shadow-sm shrink-0">
            {firstName[0]}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-bold text-[#172017] leading-tight">
                {getGreeting()}, {firstName} 👋
              </h1>
            </div>
            <p className="text-xs text-[#0BAA45] font-semibold">NexGenAi Telecaller</p>
          </div>
        </div>

        {/* Quick Demo Switcher & Logout */}
        <div className="flex items-center gap-2">
          {/* Admin Switcher for fast testing */}
          <button
            onClick={() => quickLogin('usr_admin_1')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F8F6] hover:bg-[#E9F9EF] text-[#172017] hover:text-[#0BAA45] border border-[#E5E9E5] rounded-xl text-xs font-bold transition-all"
            title="Switch to Admin Panel"
          >
            <Shield className="w-3.5 h-3.5 text-[#0BAA45]" />
            <span>Admin</span>
          </button>

          <button
            onClick={logout}
            className="p-2 text-[#6B756D] hover:text-[#E53935] hover:bg-[#FEE2E2]/50 rounded-xl transition-colors"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
