import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TelephonyProvider } from './contexts/TelephonyContext';
import { Toaster } from './components/common/Toast';
import { ActiveCallModal } from './components/telephony/ActiveCallModal';
import { CallOutcomeModal } from './components/telephony/CallOutcomeModal';

// Auth Pages
import { AdminLogin } from './pages/auth/AdminLogin';
import { WorkerLogin } from './pages/auth/WorkerLogin';

// Admin Pages & Components
import { AdminSidebar, AdminTab } from './components/admin/AdminSidebar';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLeads } from './pages/admin/AdminLeads';
import { AdminWorkers } from './pages/admin/AdminWorkers';
import { AdminCalls } from './pages/admin/AdminCalls';
import { AdminPerformance } from './pages/admin/AdminPerformance';
import { AdminFollowUps } from './pages/admin/AdminFollowUps';
import { AdminSettings } from './pages/admin/AdminSettings';

// Worker Pages & Components
import { WorkerHeader } from './components/worker/WorkerHeader';
import { WorkerBottomNav, WorkerTab } from './components/worker/WorkerBottomNav';
import { WorkerDashboard } from './pages/worker/WorkerDashboard';
import { WorkerLeads } from './pages/worker/WorkerLeads';
import { WorkerCalls } from './pages/worker/WorkerCalls';
import { WorkerFollowUps } from './pages/worker/WorkerFollowUps';
import { WorkerProfile } from './pages/worker/WorkerProfile';
import { dataStore, subscribeToStore } from './services/storage/dataStore';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isWorker, isLoading } = useAuth();
  
  // Navigation states
  const [authView, setAuthView] = useState<'ADMIN_LOGIN' | 'WORKER_LOGIN'>('ADMIN_LOGIN');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [workerTab, setWorkerTab] = useState<WorkerTab>('dashboard');

  // Badge count for followups
  const [pendingFollowUpsCount, setPendingFollowUpsCount] = useState<number>(0);

  useEffect(() => {
    if (user?.role === 'WORKER') {
      const updateCount = () => {
        const list = dataStore.getFollowUps(user.id);
        setPendingFollowUpsCount(list.filter((f) => f.status === 'PENDING').length);
      };
      updateCount();
      const unsubscribe = subscribeToStore(updateCount);
      return () => unsubscribe();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8F6] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#0BAA45] text-white flex items-center justify-center font-black text-2xl animate-pulse mb-3">
          N
        </div>
        <div className="text-sm font-bold text-[#172017]">NexGenAi</div>
        <div className="text-xs text-[#6B756D] mt-1">Loading telecaller system...</div>
      </div>
    );
  }

  // Unauthenticated view
  if (!isAuthenticated) {
    if (authView === 'WORKER_LOGIN') {
      return (
        <WorkerLogin onNavigateToAdminLogin={() => setAuthView('ADMIN_LOGIN')} />
      );
    }
    return (
      <AdminLogin onNavigateToWorkerLogin={() => setAuthView('WORKER_LOGIN')} />
    );
  }

  // Admin Portal Layout
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#F7F8F6] flex flex-col md:flex-row">
        <AdminSidebar currentTab={adminTab} onSelectTab={(t) => setAdminTab(t)} />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
          <div className="max-w-7xl mx-auto">
            {adminTab === 'dashboard' && (
              <AdminDashboard
                onNavigateToLeads={() => setAdminTab('leads')}
                onNavigateToCalls={() => setAdminTab('calls')}
                onNavigateToWorkers={() => setAdminTab('workers')}
              />
            )}
            {adminTab === 'leads' && <AdminLeads />}
            {adminTab === 'workers' && (
              <AdminWorkers onNavigateToPerformance={() => setAdminTab('performance')} />
            )}
            {adminTab === 'calls' && <AdminCalls />}
            {adminTab === 'performance' && <AdminPerformance />}
            {adminTab === 'followups' && <AdminFollowUps />}
            {adminTab === 'settings' && <AdminSettings />}
          </div>
        </main>
      </div>
    );
  }

  // Worker Portal Layout
  if (isWorker) {
    return (
      <div className="min-h-screen bg-[#F7F8F6] flex flex-col">
        <WorkerHeader />

        <main className="flex-1 min-w-0 p-4 sm:p-6 overflow-y-auto">
          {workerTab === 'dashboard' && <WorkerDashboard />}
          {workerTab === 'leads' && <WorkerLeads />}
          {workerTab === 'calls' && <WorkerCalls />}
          {workerTab === 'followups' && <WorkerFollowUps />}
          {workerTab === 'profile' && <WorkerProfile />}
        </main>

        <WorkerBottomNav
          currentTab={workerTab}
          onSelectTab={(t) => setWorkerTab(t)}
          pendingFollowUpsCount={pendingFollowUpsCount}
        />
      </div>
    );
  }

  return null;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <TelephonyProvider>
        <AppContent />
        <ActiveCallModal />
        <CallOutcomeModal />
        <Toaster />
      </TelephonyProvider>
    </AuthProvider>
  );
};

export default App;
