import React, { useState } from 'react';
import { User, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const trimmedId = adminId.trim();
      const trimmedPassword = password.trim();

      const payload: any = {
        adminId: trimmedId,
        email: trimmedId,
        username: trimmedId,
        id: trimmedId,
        password: trimmedPassword
      };

      const response = await api.post('/admin/admin/login', payload);

      const { success, message, data, token, accessToken } = response.data;
      
      const finalToken = data?.accessToken || data?.token || token || accessToken;
      const finalRefreshToken = data?.refreshToken || response.data.refreshToken;

      if (success !== false && (finalToken || response.status === 200)) {
        if (data?.profile) sessionStorage.setItem('adminProfile', JSON.stringify(data.profile));
        if (finalToken) sessionStorage.setItem('accessToken', finalToken);
        if (finalRefreshToken) sessionStorage.setItem('refreshToken', finalRefreshToken);
        
        try {
          const history = JSON.parse(localStorage.getItem('adminLoginHistory') || '{}');
          const now = new Date().toISOString();
          if (trimmedId) history[trimmedId.toLowerCase()] = now;
          if (data?.profile?.adminId) history[data.profile.adminId.toLowerCase()] = now;
          if (data?.profile?.email) history[data.profile.email.toLowerCase()] = now;
          if (data?.profile?._id) history[data.profile._id] = now;
          localStorage.setItem('adminLoginHistory', JSON.stringify(history));
        } catch (e) {
          console.error('Failed to save login history:', e);
        }

        toast.success('Admin logged in successfully!');
        onLogin();
      } else {
        const errorMsg = message || 'Invalid credentials. Please check Admin ID & Password.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      const finalMsg = serverMsg || (err.response?.status === 401 ? 'Invalid Admin ID or Password. Please check your login credentials.' : 'An error occurred during login. Please try again.');
      setError(finalMsg);
      toast.error(finalMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Animated Decorations */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-red-600/5 rounded-full blur-3xl pointer-events-none"
      />

      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col w-full max-w-md p-8 sm:p-10 relative z-10"
      >
        <div className="w-full flex flex-col justify-center bg-white">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center mb-8"
          >
            {/* Logo */}
            <img src="/logo.png" alt="Stylein Logo" className="h-16 md:h-20 object-contain mb-6 mix-blend-multiply [filter:contrast(130%)_brightness(110%)]" />

            {/* Header Content */}
            <div className="text-center">
              <h1 className="text-2xl font-medium text-slate-900 tracking-tight">Admin Login</h1>
              <p className="text-sm text-slate-500 mt-1">Please enter your credentials to continue</p>
            </div>
          </motion.div>

          <div className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 rounded-xl"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Admin ID */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Admin ID</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="e.g. admin00001" 
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-[#F8FAFC] rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all text-sm font-normal shadow-2xs"
                  required
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-[#F8FAFC] rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all text-sm font-normal shadow-2xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {/* Login Button */}
            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button" 
              onClick={() => handleSubmit()}
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors mt-6 shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Secure Login'}</span>
            </motion.button>
          </div>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-[11px] text-slate-400 text-center mt-8 font-medium uppercase tracking-wider"
          >
            © 2024 Stylein Admin Panel. All rights reserved.
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
