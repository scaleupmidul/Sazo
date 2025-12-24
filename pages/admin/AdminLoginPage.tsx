import React, { useState } from 'react';
import { Lock, Mail, LoaderCircle, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../store';

const AdminLoginPage: React.FC = () => {
  const login = useAppStore(state => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    await login(email, password);
    setIsLoggingIn(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-pink-600/20 blur-[120px]"></div>
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md p-8 z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 space-y-8">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-400 shadow-lg mb-4">
                    <span className="text-white font-bold text-xl">S</span>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
                <p className="text-slate-400 text-sm">Enter your credentials to access the admin panel.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">Email Address</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                    </div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-xl leading-5 bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition duration-200 sm:text-sm"
                        placeholder="admin@sazo.com"
                        required
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">Password</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-xl leading-5 bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition duration-200 sm:text-sm"
                        placeholder="••••••••"
                        required
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoggingIn}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-300 shadow-lg hover:shadow-pink-500/25 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
                {isLoggingIn ? (
                    <LoaderCircle className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        Sign In
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
            </form>
            
            <div className="text-center pt-4 border-t border-white/10">
                <p className="text-xs text-slate-500">Secure Admin Portal &copy; {new Date().getFullYear()} SAZO</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
