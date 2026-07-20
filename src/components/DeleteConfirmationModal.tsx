import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function DeleteConfirmationModal({ 
  isOpen, 
  name, 
  onCancel, 
  onConfirm,
  title = "Delete Account",
  description = "Are you sure you want to delete"
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 shadow-inner border border-red-100">
          <Trash2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">{title}</h3>
        <p className="text-slate-500 font-medium text-sm mb-8 px-4">
          {description} <span className="font-bold text-slate-800">{name}</span>? This action cannot be undone.
        </p>
        <div className="flex items-center gap-3 w-full">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-md shadow-red-500/20 transition-all active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
