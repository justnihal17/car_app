import React, { useState } from 'react';
import { User, Lock, Car } from 'lucide-react';
import api from '../../api/axios';

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/admin/admin/login', {
        adminId: adminId.trim(),
        password: password.trim()
      });

      const { success, message, data } = response.data;

      if (success) {
        localStorage.setItem('adminProfile', JSON.stringify(data.profile));
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        onLogin();
      } else {
        setError(message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 flex w-full max-w-4xl overflow-hidden min-h-[500px]">
        {/* Left Side: Image */}
        <div className="hidden md:block w-1/2 bg-slate-100 relative">
          <img 
            src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop" 
            alt="Car" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent"></div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">CAFU Admin</h1>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mt-2">Sign In to your account</h2>
            <p className="text-slate-500 mt-1 text-sm">Enter your admin credentials to proceed</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Admin ID / Email</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="e.g. admin00001" 
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors mt-6 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

