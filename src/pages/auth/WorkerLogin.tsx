import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { PhoneCall, Lock, Mail, ArrowRight, User, Phone as PhoneIcon, UserPlus } from 'lucide-react';
import { dataStore } from '../../services/storage/dataStore';

type LoginMode = 'login' | 'signup';

export const WorkerLogin: React.FC<{ onNavigateToAdminLogin: () => void }> = ({
  onNavigateToAdminLogin,
}) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<LoginMode>('login');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Signup state
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your telecaller email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password, 'WORKER');
      if (!result.success) {
        setError(
          result.error ||
            'Invalid worker credentials or unauthorized account.'
        );
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!signupFullName.trim()) {
      setSignupError('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim()) {
      setSignupError('Please enter your email address.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }

    setIsSigningUp(true);

    try {
      const result = dataStore.workerSelfSignup({
        fullName: signupFullName,
        email: signupEmail,
        phone: signupPhone || undefined,
        password: signupPassword,
        autoApprove: true,
      });

      if (!result.user) {
        setSignupError(result.error || 'Signup failed. Please try again.');
      } else {
        setSignupSuccess(true);
        // Auto-login after successful signup
        setTimeout(async () => {
          const loginResult = await login(signupEmail, signupPassword, 'WORKER');
          if (!loginResult.success) {
            setSignupSuccess(false);
            setSignupError('Account created but login failed. Please log in manually.');
            setMode('login');
            setEmail(signupEmail);
          }
        }, 800);
      }
    } catch (err: any) {
      setSignupError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F6] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5E9E5] shadow-card p-6 sm:p-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#0BAA45] text-white flex items-center justify-center font-black text-2xl mx-auto shadow-sm mb-3">
            N
          </div>
          <h1 className="text-2xl font-extrabold text-[#172017] tracking-tight">NexGenAi</h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E9F9EF] text-[#0BAA45] rounded-full text-xs font-bold mt-2">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Telecaller Portal</span>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-[#F7F8F6] rounded-xl p-1 mb-6 border border-[#E5E9E5]">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); setSignupError(null); setSignupSuccess(false); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-white text-[#0BAA45] shadow-sm border border-[#E5E9E5]'
                : 'text-[#6B756D] hover:text-[#172017]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); setSignupError(null); setSignupSuccess(false); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-white text-[#0BAA45] shadow-sm border border-[#E5E9E5]'
                : 'text-[#6B756D] hover:text-[#172017]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <>
            {error && (
              <div className="mb-4 p-3.5 bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] rounded-xl text-xs font-semibold animate-in fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172017] uppercase tracking-wider mb-1.5">
                  Your Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="you@email.com"
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
                  LOGIN TO WORKER PANEL
                </Button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-[#6B756D] font-medium">
                New telecaller?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[#0BAA45] font-bold hover:underline"
                >
                  Create your account →
                </button>
              </p>
            </div>
          </>
        )}

        {/* SIGNUP FORM */}
        {mode === 'signup' && (
          <>
            {signupSuccess ? (
              <div className="py-8 text-center animate-in fade-in">
                <div className="w-14 h-14 rounded-2xl bg-[#E9F9EF] text-[#0BAA45] flex items-center justify-center mx-auto mb-3 text-3xl">
                  ✓
                </div>
                <div className="text-base font-extrabold text-[#172017] mb-1">Account Created!</div>
                <p className="text-xs text-[#6B756D]">Logging you in automatically...</p>
              </div>
            ) : (
              <>
                {signupError && (
                  <div className="mb-4 p-3.5 bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] rounded-xl text-xs font-semibold animate-in fade-in">
                    {signupError}
                  </div>
                )}

                <form onSubmit={handleSignup} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#172017] uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-[#E53935]">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={signupFullName}
                        onChange={(e) => setSignupFullName(e.target.value)}
                        className="nexgen-input pl-10 h-11"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#172017] uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-[#E53935]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        placeholder="you@email.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="nexgen-input pl-10 h-11"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#172017] uppercase tracking-wider mb-1.5">
                      Phone Number <span className="text-[#6B756D] font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <PhoneIcon className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        className="nexgen-input pl-10 h-11"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#172017] uppercase tracking-wider mb-1.5">
                      Password <span className="text-[#E53935]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        placeholder="Min. 6 characters"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="nexgen-input pl-10 h-11"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#172017] uppercase tracking-wider mb-1.5">
                      Confirm Password <span className="text-[#E53935]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        placeholder="Repeat your password"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        className="nexgen-input pl-10 h-11"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full h-12 font-bold text-sm tracking-wide"
                      isLoading={isSigningUp}
                      loadingText="CREATING ACCOUNT..."
                      icon={<UserPlus className="w-4 h-4" />}
                    >
                      CREATE ACCOUNT
                    </Button>
                  </div>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-xs text-[#6B756D] font-medium">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-[#0BAA45] font-bold hover:underline"
                    >
                      Sign in →
                    </button>
                  </p>
                </div>
              </>
            )}
          </>
        )}

        {/* Switch to Admin Link */}
        <div className="mt-6 pt-5 border-t border-[#E5E9E5] bg-[#F7F8F6] -mx-6 -mb-6 p-4 rounded-b-3xl text-center">
          <button
            type="button"
            onClick={onNavigateToAdminLogin}
            className="text-xs text-[#6B756D] hover:text-[#0BAA45] font-semibold underline underline-offset-2 transition-colors"
          >
            Are you an Administrator? Go to Admin Portal →
          </button>
        </div>
      </div>
    </div>
  );
};
