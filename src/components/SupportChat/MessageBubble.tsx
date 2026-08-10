import { useState } from 'react';
import { Check, CheckCheck, Clock, Lock, Trash2, AlertCircle, RotateCcw } from 'lucide-react';
import type { SupportMessage } from '../../services/support.service';

interface MessageBubbleProps {
  msg: SupportMessage & { status?: 'sending' | 'sent' | 'failed' };
  isAdmin: boolean;
  isClosed: boolean;
  onDelete?: (messageId: string) => void;
}

function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '';
  }
}

export function MessageBubble({ msg, isAdmin, isClosed, onDelete }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const isSensitive = msg.messageType === 'SENSITIVE';
  const isSending = msg.status === 'sending';
  const isFailed = msg.status === 'failed';

  // Delivery state icon
  const renderStatus = () => {
    if (!isAdmin) return null;
    if (isSending) return <Clock className="w-3 h-3 text-slate-400" />;
    if (isFailed) return <AlertCircle className="w-3 h-3 text-red-500" />;
    if (msg.readAt) return <CheckCheck className="w-3 h-3 text-blue-500" />;
    if (msg.deliveredAt) return <CheckCheck className="w-3 h-3 text-slate-400" />;
    return <Check className="w-3 h-3 text-slate-400" />;
  };

  return (
    <div
      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} group mb-3`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`relative max-w-[70%] min-w-[120px] ${isAdmin ? 'order-1' : 'order-1'}`}>
        {/* Delete action */}
        {showActions && isAdmin && !isClosed && msg._id && onDelete && !isSending && (
          <button
            onClick={() => onDelete(msg._id)}
            className="absolute -top-2 right-0 p-1 bg-white border border-slate-200 rounded-md shadow-sm text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors z-10"
            title="Delete message"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}

        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isAdmin
              ? 'bg-slate-800 text-white rounded-br-md'
              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
          } ${isSensitive ? (isAdmin ? 'border border-amber-500/30' : 'border-amber-300') : ''}`}
        >
          {/* Sensitive badge */}
          {isSensitive && (
            <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isAdmin ? 'text-amber-300' : 'text-amber-600'}`}>
              <Lock className="w-3 h-3" />
              Sensitive Message
            </div>
          )}

          {/* Message text — NEVER render encryptedPayload internals */}
          <p className="whitespace-pre-wrap break-words">{msg.message}</p>

          {/* Footer: time + status */}
          <div className={`flex items-center gap-1.5 mt-1.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[10px] ${isAdmin ? 'text-slate-400' : 'text-slate-400'}`}>
              {formatTime(msg.createdAt)}
            </span>
            {renderStatus()}
          </div>
        </div>

        {/* Failed retry */}
        {isFailed && (
          <div className="flex items-center gap-1 mt-1 text-[11px] text-red-500 font-medium">
            <AlertCircle className="w-3 h-3" />
            Failed to send
            <button className="underline ml-1 flex items-center gap-0.5">
              <RotateCcw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
