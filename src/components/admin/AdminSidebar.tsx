import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users2,
  UserCheck,
  PhoneCall,
  TrendingUp,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export type AdminTab =
  | 'dashboard'
  | 'leads'
  | 'workers'
  | 'calls'
  | 'performance'
  | 'followups'
  | 'settings';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'leads', label: 'Leads', icon: <Users2 className="w-4 h-4" /> },
    { id: 'workers', label: 'Workers', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'calls', label: 'Call History', icon: <PhoneCall className="w-4 h-4" /> },
    { id: 'performance', label: 'Performance', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'followups', label: 'Follow-ups', icon: <Clock className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleNavClick = (tab: AdminTab) => {
    onSelectTab(tab);
    setIsMobileOpen(false);
  };

  const adminInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AD';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E5E9E5]">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#E5E9E5] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0BAA45] flex items-center justify-center text-white font-black text-lg shadow-sm">
            N
          </div>
          <div>
            <div className="text-base font-extrabold text-[#172017] tracking-tight">NexGenAi</div>
            <div className="text-[11px] font-semibold text-[#0BAA45] flex items-center gap-1 uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" /> Admin Portal
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1.5 text-[#6B756D] hover:bg-[#F7F8F6] rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#E9F9EF] text-[#0BAA45] shadow-xs'
                  : 'text-[#6B756D] hover:text-[#172017] hover:bg-[#F7F8F6]'
              }`}
            >
              <span className={`shrink-0 ${isActive ? 'text-[#0BAA45]' : 'text-[#6B756D]'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-3.5 border-t border-[#E5E9E5] bg-white">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-[#F7F8F6] border border-[#E5E9E5]/60 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#E9F9EF] text-[#0BAA45] font-bold flex items-center justify-center text-xs">
            {adminInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[#172017] truncate">{user?.fullName || 'Admin'}</div>
            <div className="text-[11px] text-[#6B756D] truncate">{user?.email || 'admin@nexgenai.in'}</div>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-[#E53935] hover:bg-[#FEE2E2]/50 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Header */}
      <div className="md:hidden bg-white border-b border-[#E5E9E5] px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0BAA45] flex items-center justify-center text-white font-black text-sm">
            N
          </div>
          <span className="font-extrabold text-[#172017] text-base">NexGenAi</span>
          <span className="text-xs font-bold text-[#0BAA45] bg-[#E9F9EF] px-2 py-0.5 rounded-md">ADMIN</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-[#172017] hover:bg-[#F7F8F6] rounded-xl"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#172017]/40 backdrop-blur-xs"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-[260px] max-w-[80vw] h-full bg-white z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar (approx 230px wide) */}
      <aside className="hidden md:block w-[230px] shrink-0 h-screen sticky top-0 z-20">
        {sidebarContent}
      </aside>
    </>
  );
};
