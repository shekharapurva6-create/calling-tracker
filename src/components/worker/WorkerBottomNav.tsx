import React from 'react';
import { LayoutDashboard, Users2, PhoneCall, Clock, User } from 'lucide-react';

export type WorkerTab = 'dashboard' | 'leads' | 'calls' | 'followups' | 'profile';

interface WorkerBottomNavProps {
  currentTab: WorkerTab;
  onSelectTab: (tab: WorkerTab) => void;
  pendingFollowUpsCount?: number;
}

export const WorkerBottomNav: React.FC<WorkerBottomNavProps> = ({
  currentTab,
  onSelectTab,
  pendingFollowUpsCount = 0,
}) => {
  const tabs: Array<{ id: WorkerTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'leads', label: 'Leads', icon: <Users2 className="w-5 h-5" /> },
    { id: 'calls', label: 'Calls', icon: <PhoneCall className="w-5 h-5" /> },
    {
      id: 'followups',
      label: 'Follow-ups',
      icon: <Clock className="w-5 h-5" />,
      badge: pendingFollowUpsCount > 0 ? pendingFollowUpsCount : undefined,
    },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E9E5] px-2 py-1.5 shadow-lg md:max-w-md md:mx-auto md:bottom-3 md:rounded-2xl md:border">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 py-1.5 px-2 flex flex-col items-center justify-center rounded-xl transition-all relative ${
                isActive
                  ? 'text-[#0BAA45] font-bold scale-105'
                  : 'text-[#6B756D] hover:text-[#172017] font-medium'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-[#F59E0B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#0BAA45] mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
