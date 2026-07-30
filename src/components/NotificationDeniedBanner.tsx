import React, { useState } from 'react';
import { BellOff, ShieldAlert, ChevronRight, X, Lock } from 'lucide-react';

export function NotificationDeniedBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl text-amber-200 mb-6 relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 mt-0.5">
            <BellOff className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-100 flex items-center gap-2">
              <span>Notifications are blocked in your browser</span>
            </h4>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              To receive new order alerts instantly when working on other tabs, enable notifications in your browser settings.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{showInstructions ? 'Hide Instructions' : 'How to Enable in Browser'}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showInstructions ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-amber-400/60 hover:text-amber-200 p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Expandable Step-by-step instructions */}
      {showInstructions && (
        <div className="mt-4 pt-3 border-t border-amber-500/20 text-xs space-y-2 text-amber-100/90 bg-amber-950/40 p-3 rounded-xl">
          <p className="font-bold text-amber-300">Quick steps to enable notifications:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-300">
            <li>Click the <span className="font-semibold text-white">Lock icon 🔒</span> or <span className="font-semibold text-white">Tune icon 🎛️</span> next to the URL in your browser address bar.</li>
            <li>Find <span className="font-semibold text-white">Notifications</span> in the dropdown list.</li>
            <li>Change the permission to <span className="font-semibold text-emerald-400">Allow</span>.</li>
            <li>Refresh the page to start receiving instant order alerts.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
