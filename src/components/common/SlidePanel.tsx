import React, { useEffect } from 'react';
import { X, Layers } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function SlidePanel({ isOpen, onClose, title, children }: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[100] flex items-center justify-center p-3 sm:p-4 transition-opacity duration-200 ease-out">
      <div className="bg-[#F8FAFC] w-full max-w-lg md:max-w-xl rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-200 ease-out">
        {/* Header - White, minimal, top accent */}
        <div className="px-4 py-2.5 bg-white flex items-center justify-between border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 shadow-2xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900 capitalize leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Manage master details and configuration.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer" aria-label="Close modal">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar relative pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
