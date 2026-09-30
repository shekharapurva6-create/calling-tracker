import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore, subscribeToStore } from '../../services/storage/dataStore';
import { AppNotification } from '../../types';
import { LogOut, Bell, Check, Clock, PhoneCall, Sparkles, ChevronRight } from 'lucide-react';

export const WorkerHeader: React.FC<{ onNavigateToTab?: (tab: string) => void }> = ({
  onNavigateToTab,
}) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const workerId = user?.id || '';

  const refreshNotifs = () => {
    if (!workerId) return;
    setNotifications(dataStore.getNotifications(workerId));
  };

  useEffect(() => {
    refreshNotifs();
    const unsubscribe = subscribeToStore((event) => {
      if (
        event.type === 'NOTIFICATION_RECEIVED' ||
        event.type === 'LEAD_UPDATED' ||
        event.type === 'TARGET_UPDATED'
      ) {
        refreshNotifs();
      }
    });
    return () => unsubscribe();
  }, [workerId]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fullName = user?.fullName || 'Worker';
  const firstName = fullName.split(' ')[0] || 'Worker';
  const initial = firstName[0]?.toUpperCase() || 'W';

  const handleMarkAllRead = () => {
    if (!workerId) return;
    dataStore.markAllNotificationsAsRead(workerId);
    refreshNotifs();
  };

  const handleNotifClick = (notif: AppNotification) => {
    dataStore.markNotificationAsRead(notif.id);
    refreshNotifs();
    setIsOpen(false);
    if (notif.linkUrl && onNavigateToTab) {
      if (notif.linkUrl.includes('leads')) onNavigateToTab('leads');
      else if (notif.linkUrl.includes('calls')) onNavigateToTab('calls');
      else if (notif.linkUrl.includes('followup')) onNavigateToTab('followups');
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHour = Math.round(diffMin / 60);
      if (diffHour < 24) return `${diffHour}h ago`;
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <header className="bg-white border-b border-[#E5E9E5] sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand & Dynamic Greeting */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0BAA45] flex items-center justify-center text-white font-extrabold text-base shadow-sm shrink-0">
            {initial}
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

        {/* Right Actions: Notification Bell + Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notification Bell with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`relative p-2 rounded-xl transition-all ${
                isOpen
                  ? 'bg-[#E9F9EF] text-[#0BAA45]'
                  : 'text-[#6B756D] hover:text-[#172017] hover:bg-[#F7F8F6]'
              }`}
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-[#E53935] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E5E9E5] shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Popover Header */}
                <div className="p-3.5 bg-[#F7F8F6] border-b border-[#E5E9E5] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#0BAA45]" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#172017]">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-[#0BAA45] text-white px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-[#0BAA45] hover:text-[#09933B] flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                {/* Popover List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-[#E5E9E5]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-[#6B756D]">
                      <Bell className="w-8 h-8 text-[#6B756D]/30 mx-auto mb-2" />
                      <div className="text-xs font-bold text-[#172017]">No notifications yet</div>
                      <p className="text-[11px] text-[#6B756D] mt-0.5">
                        You will receive alerts here when new leads are assigned.
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => handleNotifClick(n)}
                        className={`w-full text-left p-3.5 hover:bg-[#F7F8F6] transition-colors flex items-start gap-3 ${
                          !n.isRead ? 'bg-[#E9F9EF]/40' : 'bg-white'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                            n.type === 'LEAD_ASSIGNMENT'
                              ? 'bg-[#E9F9EF] text-[#0BAA45]'
                              : n.type === 'FOLLOW_UP'
                              ? 'bg-[#FEF3C7] text-[#D97706]'
                              : 'bg-[#F3F4F6] text-[#4B5563]'
                          }`}
                        >
                          {n.type === 'LEAD_ASSIGNMENT' ? (
                            <PhoneCall className="w-4 h-4" />
                          ) : n.type === 'FOLLOW_UP' ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span
                              className={`text-xs font-bold truncate ${
                                !n.isRead ? 'text-[#172017]' : 'text-[#6B756D]'
                              }`}
                            >
                              {n.title}
                            </span>
                            <span className="text-[10px] text-[#6B756D] font-mono shrink-0">
                              {formatTime(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-[#6B756D] line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                        </div>

                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-[#0BAA45] mt-1.5 shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>

                {/* Popover Footer */}
                {notifications.length > 0 && (
                  <div className="p-2.5 bg-[#F7F8F6] border-t border-[#E5E9E5] text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        if (onNavigateToTab) onNavigateToTab('leads');
                      }}
                      className="text-xs font-bold text-[#0BAA45] hover:text-[#09933B] flex items-center justify-center gap-1 w-full py-1"
                    >
                      <span>View Assigned Leads</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => logout()}
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
