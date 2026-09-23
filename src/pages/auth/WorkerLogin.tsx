import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { PhoneCall, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

export const WorkerLogin: React.FC<{ onNavigateToAdminLogin: () => void }> = ({
  onNavigateToAdminLogin,
}) => {
  const { login, quickLogin } = useAuth();
  const [email, setEmail] = useState('rahul@nexgenai.in');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(async () => {
      const success = await login(email, 'WORKER');
      if (!success) {
        setError('Worker account not found or deactivated. Use rahul@nexgenai.in or aman@nexgenai.in');
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F7F8F6] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5E9E5] shadow-card p-6 sm:p-8">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#0BAA45] text-white flex items-center justify-center font-black text-2xl mx-auto shadow-sm mb-3">
            N
          </div>
          <h1 className="text-2xl font-extrabold text-[#172017] tracking-tight">NexGenAi</h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E9F9EF] text-[#0BAA45] rounded-full text-xs font-bold mt-2">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Worker Portal</span>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3.5 bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] rounded-xl text-xs font-semibold animate-in fade-in">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172017] uppercase tracking-wider mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="rahul@nexgenai.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="nexgen-input pl-10 h-11"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172017] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="nexgen-input pl-10 h-11"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-12 font-bold text-sm tracking-wide"
              isLoading={isLoading}
              loadingText="LOGGING IN..."
              icon={<ArrowRight className="w-4 h-4" />}
            >
              LOGIN
            </Button>
          </div>
        </form>

        {/* Demo Fast Fill Buttons */}
        <div className="mt-6 pt-5 border-t border-[#E5E9E5] bg-[#F7F8F6] -mx-6 -mb-6 p-4 rounded-b-3xl text-center">
          <div className="text-[11px] text-[#6B756D] mb-2 font-medium">Quick Demo Worker Login</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickLogin('usr_worker_rahul')}
              className="py-2 px-3 bg-white hover:bg-[#E9F9EF] text-[#172017] hover:text-[#0BAA45] border border-[#E5E9E5] rounded-xl text-xs font-bold transition-all truncate text-center"
            >
              👤 Rahul Kumar
            </button>
            <button
              type="button"
              onClick={() => quickLogin('usr_worker_aman')}
              className="py-2 px-3 bg-white hover:bg-[#E9F9EF] text-[#172017] hover:text-[#0BAA45] border border-[#E5E9E5] rounded-xl text-xs font-bold transition-all truncate text-center"
            >
              👤 Aman Kumar
            </button>
          </div>

          <div className="mt-3">
            <button
              type="button"
              onClick={onNavigateToAdminLogin}
              className="text-xs text-[#6B756D] hover:text-[#0BAA45] font-semibold underline underline-offset-2 transition-colors"
            >
              Go to Admin Portal Login →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
