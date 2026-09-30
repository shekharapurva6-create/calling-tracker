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

  // Sync with URL hash / path
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const path = window.location.pathname.toLowerCase();
      const target = hash || path;

      if (!isAuthenticated) {
        if (target.includes('worker')) {
          setAuthView('WORKER_LOGIN');
        } else if (target.includes('admin')) {
          setAuthView('ADMIN_LOGIN');
        }
      } else if (isAdmin) {
        if (target.includes('leads')) setAdminTab('leads');
        else if (target.includes('workers')) setAdminTab('workers');
        else if (target.includes('calls')) setAdminTab('calls');
        else if (target.includes('performance')) setAdminTab('performance');
        else if (target.includes('followup')) setAdminTab('followups');
        else if (target.includes('settings')) setAdminTab('settings');
        else setAdminTab('dashboard');
      } else if (isWorker) {
        // Strict guard: if worker tries to enter admin URL, keep them in worker portal
        if (target.includes('admin')) {
          window.location.hash = 'worker/dashboard';
          setWorkerTab('dashboard');
          return;
        }
        if (target.includes('leads')) setWorkerTab('leads');
        else if (target.includes('calls')) setWorkerTab('calls');
        else if (target.includes('followup')) setWorkerTab('followups');
        else if (target.includes('profile')) setWorkerTab('profile');
        else setWorkerTab('dashboard');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated, isAdmin, isWorker]);

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

  // Admin Portal Layout (Strictly Protected: role === 'ADMIN' and isActive === true)
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

  // Worker Portal Layout (Strictly Protected: role === 'WORKER' and isActive === true)
  if (isWorker) {
    return (
      <div className="min-h-screen bg-[#F7F8F6] flex flex-col">
        <WorkerHeader onNavigateToTab={(tab) => setWorkerTab(tab as WorkerTab)} />

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

  // Unauthorized or role mismatch fallback
  return (
    <div className="min-h-screen bg-[#F7F8F6] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl border border-[#FECACA] shadow-card max-w-md text-center">
        <div className="text-sm font-bold text-[#DC2626] mb-1">Access Denied</div>
        <p className="text-xs text-[#6B756D] mb-4">
          This account is not authorized for the requested portal or has been deactivated.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#0BAA45] text-white text-xs font-bold rounded-xl"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
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
