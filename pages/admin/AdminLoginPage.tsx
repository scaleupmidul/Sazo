import React, { useState } from 'react';
import { Lock, Mail, LoaderCircle } from 'lucide-react';
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
    // On failure, button becomes active again. On success, component unmounts.
    setIsLoggingIn(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="sazo-logo text-3xl sm:text-4xl font-semibold text-pink-600">SAZO</h1>
          <p className="mt-2 text-sm text-gray-600">Admin Panel Login</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 transition text-sm bg-white text-black"
              required
            />
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 transition text-sm bg-white text-black"
              required
            />
          </div>
          <div className="text-right">
            <button type="button" className="text-sm font-medium text-pink-600 hover:text-pink-500">
                Forgot Password?
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-pink-600 text-white text-base font-bold py-3 rounded-lg hover:bg-pink-700 transition duration-300 shadow-md active:scale-95 flex justify-center items-center disabled:bg-pink-400"
          >
            {isLoggingIn ? <LoaderCircle className="w-5 h-5 animate-spin" /> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;