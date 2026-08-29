import React, { useState } from 'react';
import { User, Lock, LogIn, Eye, EyeOff, Loader2 } from 'lucide-react';
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
    if (!adminId.trim() || !password.trim()) {
      const msg = 'Please enter both Admin ID and Password';
      setError(msg);
      toast.error(msg);
      return;
    }

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
    <div className="min-h-screen bg-slate-50/90 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans select-none">
      {/* Background Ambient Glow & Subtle Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-35 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.85 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] bg-red-500/6 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.85 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[90px] pointer-events-none"
      />

      {/* Main Login Card - Ultra Compact, Sleek & Premium */}
      <motion.div 
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[350px] sm:max-w-[365px] bg-white rounded-2xl login-card-shadow border border-slate-200/80 relative z-10 p-6 sm:p-7 pt-7 sm:pt-8"
      >
        <div className="w-full flex flex-col justify-center">
          {/* Header & Branding */}
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="flex flex-col items-center mb-5"
          >
            {/* Logo */}
            <div className="h-11 sm:h-12 mb-2.5 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Stylein Logo" 
                className="h-full object-contain mix-blend-multiply [filter:contrast(125%)_brightness(105%)]" 
              />
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-[19px] sm:text-xl font-extrabold text-slate-900 tracking-tight text-center">
              Admin Login
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5 text-center font-normal tracking-tight">
              Enter your credentials to access dashboard
            </p>
          </motion.div>

          {/* Form */}
          <div className="space-y-3.5">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -4 }}
                  className="p-2 text-[11px] font-semibold text-rose-700 bg-rose-50/90 border border-rose-200/80 rounded-lg flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="leading-tight">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Admin ID Field */}
            <motion.div
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.15 }}
            >
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Admin ID
              </label>
              <div className="luxury-input-box rounded-xl h-10 flex items-center relative group px-3">
                <User className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-red-500 group-hover:text-slate-500 transition-colors shrink-0 mr-2" />
                <input 
                  type="text" 
                  placeholder="e.g. admin00001" 
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
                  className="w-full bg-transparent text-xs font-medium text-slate-800 placeholder:text-[11px] placeholder:font-normal placeholder:text-slate-400 outline-none"
                  autoComplete="username"
                  required
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.2 }}
            >
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="luxury-input-box rounded-xl h-10 flex items-center relative group pl-3 pr-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-red-500 group-hover:text-slate-500 transition-colors shrink-0 mr-2" />
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
                  className="w-full bg-transparent text-xs font-medium text-slate-800 placeholder:text-[11px] placeholder:font-normal placeholder:text-slate-400 outline-none"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-md transition-colors cursor-pointer shrink-0"
                  title={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </motion.div>

            {/* Login Button */}
            <motion.button 
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.25 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="button" 
              onClick={() => handleSubmit()}
              disabled={loading}
              className="w-full h-[42px] bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-xl login-btn-shadow transition-all mt-5 sm:mt-6 flex items-center justify-center gap-1.5 text-xs tracking-wide cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Secure Login</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.3 }}
            className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col items-center"
          >
            <div className="text-[9.5px] text-slate-400 font-medium uppercase tracking-wider">
              © {new Date().getFullYear()} Stylein Admin Panel. All rights reserved.
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
