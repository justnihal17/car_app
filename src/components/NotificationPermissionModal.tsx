import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, ShieldCheck, Zap, Radio, X } from 'lucide-react';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onEnable: () => void;
  onNotNow: () => void;
}

export function NotificationPermissionModal({
  isOpen,
  onEnable,
  onNotNow,
}: NotificationPermissionModalProps) {
  // ESC key handler for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onNotNow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNotNow]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onNotNow}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xl"
          />

          {/* Modal Card / Mobile Bottom Sheet */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="fcm-modal-title"
            className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-white/10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl p-6 sm:p-8 text-white overflow-hidden max-sm:fixed max-sm:bottom-0 max-sm:rounded-b-none max-sm:rounded-t-3xl"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Close / Not Now Top Button */}
            <button
              type="button"
              onClick={onNotNow}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Floating Bell Animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-3xl bg-red-600 blur-xl"
                />
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 via-red-600 to-rose-700 p-[1px] shadow-2xl flex items-center justify-center border border-red-400/30"
                >
                  <div className="w-full h-full bg-slate-950/80 rounded-[23px] flex items-center justify-center backdrop-blur-md">
                    <Bell className="w-10 h-10 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                  </div>
                </motion.div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                </div>
              </div>
            </div>

            {/* Header Content */}
            <div className="text-center space-y-2 mb-6">
              <h2 id="fcm-modal-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Enable Instant Order Notifications
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Receive new customer orders instantly even when the dashboard is running in the background.
              </p>
            </div>

            {/* Benefits Checklist Grid */}
            <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-4 sm:p-5 mb-6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold">Instant Order Alerts</span>
                </div>

                <div className="flex items-center gap-2.5 text-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20 shrink-0">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold">Real-time Requests</span>
                </div>

                <div className="flex items-center gap-2.5 text-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold">Background Alerts</span>
                </div>

                <div className="flex items-center gap-2.5 text-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold">Never Miss Requests</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onEnable}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-[0_10px_25px_-5px_rgba(225,29,72,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 border border-red-400/30"
              >
                <Bell className="w-4 h-4" />
                <span>Enable Notifications</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onNotNow}
                className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-sm transition-all border border-white/10 cursor-pointer text-center"
              >
                Not Now
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
