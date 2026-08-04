import React, { useEffect, useState } from 'react';
import { SafeImage } from './common/SafeImage';
import { 
  Eye, Edit2, UserX, UserCheck, Trash2, RotateCcw, CheckCircle2, 
  XCircle, Key, ShieldCheck, ShieldAlert, LogOut, AlertTriangle, Loader2 
} from 'lucide-react';

export type ActionType = 
  | 'view' | 'edit' | 'block' | 'unblock' | 'delete' | 'restore' 
  | 'activate' | 'deactivate' | 'approve' | 'reject' 
  | 'reset_password' | 'assign_role' | 'remove_role' | 'logout' | 'custom';

export interface ConfirmationModalProps {
  isOpen: boolean;
  actionType?: ActionType;
  title?: string;
  message?: string;
  description?: string;
  name?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

const PRESETS: Record<ActionType, { title: string; message: string; confirmText: string; variant: 'danger' | 'success' | 'info' | 'warning'; Icon: React.ElementType }> = {
  view: { title: 'View Details?', message: 'Do you want to view this record?', confirmText: 'View', variant: 'info', Icon: Eye },
  edit: { title: 'Edit Record?', message: 'Do you want to edit this record?', confirmText: 'Edit', variant: 'info', Icon: Edit2 },
  block: { title: 'Block User?', message: 'Are you sure you want to block this user? They will lose access to the application.', confirmText: 'Block', variant: 'danger', Icon: UserX },
  unblock: { title: 'Unblock User?', message: 'This user will regain access to the application.', confirmText: 'Unblock', variant: 'success', Icon: UserCheck },
  delete: { title: 'Delete Record?', message: 'Are you sure you want to delete this record? This action cannot be undone.', confirmText: 'Delete', variant: 'danger', Icon: Trash2 },
  restore: { title: 'Restore Record?', message: 'Restore this deleted record?', confirmText: 'Restore', variant: 'success', Icon: RotateCcw },
  activate: { title: 'Activate Account?', message: 'This account will become active.', confirmText: 'Activate', variant: 'success', Icon: CheckCircle2 },
  deactivate: { title: 'Deactivate Account?', message: 'This account will become inactive.', confirmText: 'Deactivate', variant: 'warning', Icon: AlertTriangle },
  approve: { title: 'Approve Request?', message: 'Are you sure you want to approve this request?', confirmText: 'Approve', variant: 'success', Icon: CheckCircle2 },
  reject: { title: 'Reject Request?', message: 'Are you sure you want to reject this request?', confirmText: 'Reject', variant: 'danger', Icon: XCircle },
  reset_password: { title: 'Reset Password?', message: 'Are you sure you want to reset the password?', confirmText: 'Reset Password', variant: 'warning', Icon: Key },
  assign_role: { title: 'Assign Role?', message: 'Are you sure you want to assign this role?', confirmText: 'Assign', variant: 'info', Icon: ShieldCheck },
  remove_role: { title: 'Remove Role?', message: 'Are you sure you want to remove this role?', confirmText: 'Remove', variant: 'danger', Icon: ShieldAlert },
  logout: { title: 'Logout', message: '', confirmText: 'Logout', variant: 'danger', Icon: LogOut },
  custom: { title: 'Confirm Action', message: 'Are you sure you want to proceed?', confirmText: 'Confirm', variant: 'info', Icon: AlertTriangle },
};

const VARIANT_STYLES = {
  danger: { iconWrapper: 'bg-red-50 text-red-500 border-red-100', button: 'bg-red-500 hover:bg-red-600 shadow-red-500/20' },
  success: { iconWrapper: 'bg-emerald-50 text-emerald-500 border-emerald-100', button: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' },
  info: { iconWrapper: 'bg-blue-50 text-blue-500 border-blue-100', button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' },
  warning: { iconWrapper: 'bg-amber-50 text-amber-500 border-amber-100', button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' },
};

export function ConfirmationModal({
  isOpen, actionType = 'custom', title, message, description, name,
  confirmText, cancelText = 'Cancel', loading: externalLoading, onCancel, onConfirm
}: ConfirmationModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);

  const preset = PRESETS[actionType] || PRESETS.custom;
  const isExecuting = externalLoading || internalLoading;
  const modalTitle = title || preset.title;
  const finalMessage = description || message || (name ? `Are you sure you want to ${actionType.replace('_', ' ')} ${name}?` : preset.message);
  const finalConfirmText = confirmText || preset.confirmText;
  const style = VARIANT_STYLES[preset.variant];
  const Icon = preset.Icon;

  const handleConfirm = async () => {
    if (isExecuting) return;
    try {
      setInternalLoading(true);
      await onConfirm();
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isExecuting) onCancel();
      if (e.key === 'Enter' && !isExecuting) handleConfirm();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExecuting, onCancel, onConfirm]);

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
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget && !isExecuting) onCancel(); }}
    >
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 border border-slate-100" role="dialog" aria-modal="true">
        {actionType === 'logout' ? (
          <div className="mb-6 flex items-center justify-center w-full">
            <SafeImage 
              src="/logo.png" 
              alt="Logo" 
              className="h-20 object-contain mix-blend-multiply [filter:contrast(130%)_brightness(110%)] mx-auto" 
            />
          </div>
        ) : (
          <>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 shadow-inner border ${style.iconWrapper}`}>
              <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">{modalTitle}</h3>
            {finalMessage ? (
              <p className="text-slate-500 font-medium text-sm mb-8 px-4 leading-relaxed">{finalMessage}</p>
            ) : (
              <div className="mb-6" />
            )}
          </>
        )}
        <div className="flex items-center gap-3 w-full">
          <button 
            onClick={onCancel}
            disabled={isExecuting}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isExecuting}
            className={`flex-1 py-3 px-4 rounded-xl text-white font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer ${style.button}`}
          >
            {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {finalConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
