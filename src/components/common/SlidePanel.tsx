import React from 'react';
import { X, Layers } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function SlidePanel({ isOpen, onClose, title, children }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6 transition-opacity duration-200 ease-out">
      <div className="bg-[#F8FAFC] w-full max-w-full md:max-w-2xl rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 ease-out">
        {/* Header - White, minimal, top accent */}
        <div className="px-6 py-4 bg-white flex items-center justify-between border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-900 capitalize leading-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage master details and configuration.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar relative pb-10">
          {children}
        </div>
      </div>
    </div>
  );
}
