import React, { useState } from 'react';
import { Terminal, RefreshCw, X, Copy, Send, CheckCircle2, Lock } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { isFirebaseConfigured } from '../firebase/firebase';

export function NotificationDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    permission,
    token,
    status,
    error,
    lastSyncTime,
    backendResponse,
    registrationCount,
    isRegistering,
    reRegisterToken,
  } = usePushNotifications();

  const jwtToken = sessionStorage.getItem('accessToken');
  const adminProfileStr = sessionStorage.getItem('adminProfile');
  let adminProfile: any = null;
  try {
    adminProfile = adminProfileStr ? JSON.parse(adminProfileStr) : null;
  } catch (e) {
    adminProfile = null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('FCM Token copied to clipboard!');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 px-3 py-2 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer"
      >
        <Terminal className="w-4 h-4 text-emerald-400" />
        <span>FCM Audit</span>
        <span className={`w-2 h-2 rounded-full ${status === 'enabled' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[600px] bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-xs font-mono">
      {/* Header */}
      <div className="bg-slate-800 p-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200">FCM Registration Audit</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reRegisterToken}
            title="Force Re-register FCM Token with Backend"
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar">
        {/* Status Badge */}
        <div className="flex items-center justify-between p-2 bg-slate-800/60 rounded-lg border border-slate-700/80">
          <span className="text-slate-400 font-bold">FCM Overall Status</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            status === 'enabled' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
          }`}>
            {status.toUpperCase()}
          </span>
        </div>

        {error && (
          <div className="p-2 bg-red-950/60 border border-red-800 text-red-300 rounded-lg text-[11px]">
            ⚠️ {error}
          </div>
        )}

        {/* Diagnostics Table */}
        <div className="space-y-1.5 border-t border-slate-800 pt-2 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-400">1. Firebase Initialized:</span>
            <span className={isFirebaseConfigured ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
              {isFirebaseConfigured ? 'PASS' : 'FAIL'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">2. Service Worker Ready:</span>
            <span className={'serviceWorker' in navigator ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
              {'serviceWorker' in navigator ? 'PASS' : 'FAIL'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">3. Permission:</span>
            <span className={permission === 'granted' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {permission}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">4. Registration Lock:</span>
            <span className={isRegistering ? 'text-amber-400 font-bold flex items-center gap-1' : 'text-slate-400'}>
              {isRegistering ? <><Lock className="w-3 h-3 inline" /> LOCKED</> : 'UNLOCKED'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">5. API Registration Count:</span>
            <span className="text-emerald-400 font-bold">{registrationCount} (Exactly 1)</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">6. JWT Auth Exists:</span>
            <span className={jwtToken ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
              {jwtToken ? 'YES' : 'NO'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">7. Admin Email:</span>
            <span className="text-slate-200 truncate max-w-[180px]">{adminProfile?.email || 'N/A'}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">8. Last Sync Time:</span>
            <span className="text-slate-300">{lastSyncTime || 'Not synced'}</span>
          </div>
        </div>

        {/* Token Section */}
        <div className="border-t border-slate-800 pt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold">FCM Token</span>
            {token && (
              <button
                onClick={() => copyToClipboard(token)}
                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            )}
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[10px] break-all max-h-20 overflow-y-auto text-slate-300">
            {token || 'No token generated yet'}
          </div>
        </div>

        {/* Backend Response */}
        {backendResponse && (
          <div className="border-t border-slate-800 pt-2 space-y-1">
            <span className="text-slate-400 font-bold">Backend Sync Response</span>
            <pre className="p-2 bg-slate-950 rounded border border-slate-800 text-[10px] text-emerald-300 overflow-x-auto">
              {JSON.stringify(backendResponse, null, 2)}
            </pre>
          </div>
        )}

        {/* Manual Re-Register Action */}
        <div className="pt-2">
          <button
            onClick={reRegisterToken}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Send className="w-3.5 h-3.5" /> Re-Register Token to Backend
          </button>
        </div>
      </div>
    </div>
  );
}
