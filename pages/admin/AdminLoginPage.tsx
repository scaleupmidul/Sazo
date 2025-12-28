
import React, { useState } from 'react';
import { Lock, Mail, LoaderCircle, AlertCircle, ChevronLeft, ShieldAlert } from 'lucide-react';
import { useAppStore } from '../../store';

const AdminLoginPage: React.FC = () => {
  const { login, resetAdminPassword } = useAppStore(state => ({
    login: state.login,
    resetAdminPassword: state.resetAdminPassword
  }));
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isReseting, setIsReseting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    await login(email, password);
    setIsLoggingIn(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (isReseting) return;
    
    const confirm = window.confirm("Are you sure you want to reset the password to default? A notification will be sent to your email.");
    if (!confirm) return;

    setIsReseting(true);
    const success = await resetAdminPassword(email);
    if (success) setIsResetMode(false);
    setIsReseting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] p-4">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden group">
        
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-pink-600/20 rounded-full blur-3xl group-hover:bg-pink-600/30 transition-all duration-1000"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl group-hover:bg-purple-600/30 transition-all duration-1000"></div>

        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-600 text-white font-black text-3xl mb-4 shadow-lg shadow-pink-600/20">
            S
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isResetMode ? 'Recover Access' : 'Welcome Back'}
          </h1>
          <p className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            {isResetMode ? 'Emergency Security Reset' : 'Secure Admin Access'}
          </p>
        </div>

        <form onSubmit={isResetMode ? handleReset : handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sazo.com"
                className="w-full bg-slate-900/50 border border-slate-700 p-3.5 pl-12 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all duration-300 outline-none text-sm"
                required
              />
            </div>
          </div>

          {!isResetMode && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-slate-700 p-3.5 pl-12 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all duration-300 outline-none text-sm"
                  required
                />
              </div>
            </div>
          )}

          {isResetMode && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 items-start animate-fadeIn">
                <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-amber-200/80 leading-relaxed uppercase tracking-tight">
                    Warning: Password will revert to system default. A secure notification will be sent to your primary email address.
                </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn || isReseting}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-xl active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50
              ${isResetMode 
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/20' 
                : 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-900/20'}
            `}
          >
            {isLoggingIn || isReseting ? (
              <LoaderCircle className="w-5 h-5 animate-spin" />
            ) : (
              isResetMode ? 'Confirm Reset' : 'Sign In Now'
            )}
          </button>
        </form>

        <div className="pt-2 text-center relative z-10">
          <button 
            type="button" 
            onClick={() => setIsResetMode(!isResetMode)}
            className="group inline-flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-pink-500 transition-all uppercase tracking-widest p-3 border border-white/5 rounded-xl hover:bg-white/5"
          >
            {isResetMode ? (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                Back to Login
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                Forgot Access? Reset to Default
              </>
            )}
          </button>
        </div>

        <div className="text-center pt-4">
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">
                Secure Admin Portal © 2026 SAZO
            </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
