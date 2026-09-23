import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';

export const AdminLogin: React.FC<{ onNavigateToWorkerLogin: () => void }> = ({
  onNavigateToWorkerLogin,
}) => {
  const { login, quickLogin } = useAuth();
  const [email, setEmail] = useState('admin@nexgenai.in');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(async () => {
      const success = await login(email, 'ADMIN');
      if (!success) {
        setError('Invalid admin credentials. Use admin@nexgenai.in');
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
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
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
                placeholder="admin@nexgenai.in"
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
              LOGIN TO ADMIN PANEL
            </Button>
          </div>
        </form>

        {/* Small text notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#6B756D] font-medium">
            Secure internal access • NexGenAi
          </p>
        </div>

        {/* Demo Fast Fill Pill */}
        <div className="mt-6 pt-5 border-t border-[#E5E9E5] bg-[#F7F8F6] -mx-6 -mb-6 p-4 rounded-b-3xl text-center">
          <div className="text-[11px] text-[#6B756D] mb-2 font-medium">Quick Demo Testing Access</div>
          <button
            type="button"
            onClick={() => quickLogin('usr_admin_1')}
            className="w-full py-2 bg-white hover:bg-[#E9F9EF] text-[#0BAA45] border border-[#16C763]/40 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5"
          >
            ⚡ 1-Click Login as Admin (admin@nexgenai.in)
          </button>

          <div className="mt-3">
            <button
              type="button"
              onClick={onNavigateToWorkerLogin}
              className="text-xs text-[#6B756D] hover:text-[#0BAA45] font-semibold underline underline-offset-2 transition-colors"
            >
              Are you a Telecaller? Switch to Worker Portal →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
