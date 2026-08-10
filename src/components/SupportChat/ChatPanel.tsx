import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Lock, Circle, X, Shield, Loader2, CheckCircle2, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { MessageBubble } from './MessageBubble';
import { ConfirmationModal } from '../ConfirmationModal';
import {
  getCategoryLabel,
  getConversations,
  getMessages,
  claimConversation,
  markConversationRead,
  closeConversation,
  type SupportConversation,
  type SupportMessage,
} from '../../services/support.service';
import {
  connectSupportSocket,
  joinConversation,
  sendSupportMessage,
  emitTypingStart,
  emitTypingStop,
  emitDeleteMessage,
  onSupportEvent,
  offSupportEvent,
  SUPPORT_EVENTS,
  isSocketConnected,
} from '../../services/supportSocket.service';

interface ChatPanelProps {
  conversation: SupportConversation;
  onConversationUpdate: (conv: SupportConversation) => void;
  onClose?: () => void;
}

type LocalMessage = SupportMessage & { status?: 'sending' | 'sent' | 'failed'; clientMessageId?: string };

function getAgentName(conv: SupportConversation): string {
  const agent = conv.agentId;
  if (!agent) return 'Unknown Agent';
  if (typeof agent === 'string') return agent;
  return agent.name || agent.fullName || `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Agent';
}

function getCurrentAdminId(): string | null {
  try {
    const profile = sessionStorage.getItem('adminProfile');
    if (!profile) return null;
    const parsed = JSON.parse(profile);
    return parsed._id || parsed.id || null;
  } catch {
    return null;
  }
}

function getAdminName(adminId: any): string {
  if (!adminId) return 'Unassigned';
  const currentId = getCurrentAdminId();
  if (typeof adminId === 'string') {
    return adminId === currentId ? 'Assigned to You' : 'Assigned to Admin';
  }
  const id = adminId._id || adminId.id;
  if (id === currentId) return 'Assigned to You';
  return `Assigned to ${adminId.name || adminId.fullName || 'Another Admin'}`;
}

function dedupe(msgs: LocalMessage[]): LocalMessage[] {
  const seen = new Set<string>();
  const result: LocalMessage[] = [];
  for (const m of msgs) {
    const key = m._id || m.clientMessageId || '';
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    result.push(m);
  }
  return result;
}

export function ChatPanel({ conversation, onConversationUpdate, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSensitive, setIsSensitive] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [agentPresence, setAgentPresence] = useState<'ONLINE' | 'OFFLINE' | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [conv, setConv] = useState<SupportConversation>(conversation);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const agentTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const convIdRef = useRef<string>(conversation._id);

  const convId = conv._id;
  const isClosed = conv.status === 'CLOSED';
  const currentAdminId = getCurrentAdminId();
  const agentName = getAgentName(conv);

  // Keep convIdRef current
  useEffect(() => {
    convIdRef.current = convId;
  }, [convId]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ── Load messages ──────────────────────────────────────────────
  const loadMessages = useCallback(async (pg = 1, append = false) => {
    if (!convId) return;
    try {
      if (pg === 1) setLoadingMessages(true);
      else setLoadingOlder(true);
      const res = await getMessages(convId, pg, 50);
      const raw: SupportMessage[] = res?.data?.messages || res?.messages || [];
      const pagination = res?.data?.pagination || res?.pagination || {};
      setTotalPages(pagination.totalPages || 1);
      setPage(pg);
      if (append) {
        setMessages(prev => dedupe([...raw.map((m: SupportMessage) => ({ ...m, status: 'sent' as const })), ...prev]));
      } else {
        setMessages(dedupe(raw.map((m: SupportMessage) => ({ ...m, status: 'sent' as const }))));
        setTimeout(scrollToBottom, 100);
      }
    } catch (err: any) {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
      setLoadingOlder(false);
    }
  }, [convId, scrollToBottom]);

  // ── Mark read ──────────────────────────────────────────────────
  const markRead = useCallback(async () => {
    if (!convId) return;
    try {
      await markConversationRead(convId);
      setConv(prev => ({ ...prev, unreadCount: 0 }));
      onConversationUpdate({ ...conv, unreadCount: 0 });
    } catch {}
  }, [convId, conv, onConversationUpdate]);

  // ── Socket events ──────────────────────────────────────────────
  useEffect(() => {
    if (!convId) return;

    // Connect and join
    try {
      connectSupportSocket();
      setSocketConnected(isSocketConnected());
    } catch (e) {
      setSocketConnected(false);
    }
    joinConversation(convId);

    // Handlers — capture convId in closure
    const handleNewMessage = (data: any) => {
      const incomingConvId = data?.conversationId || data?.message?.conversationId;
      if (incomingConvId !== convIdRef.current) return;
      const msg = data?.message || data;
      setMessages(prev => dedupe([...prev, { ...msg, status: 'sent' as const }]));
      markRead();
      setTimeout(scrollToBottom, 50);
    };

    const handleTypingStart = (data: any) => {
      if ((data?.conversationId || data) !== convIdRef.current) return;
      setAgentTyping(true);
      if (agentTypingTimeoutRef.current) clearTimeout(agentTypingTimeoutRef.current);
      agentTypingTimeoutRef.current = setTimeout(() => setAgentTyping(false), 4000);
    };

    const handleTypingStop = (data: any) => {
      if ((data?.conversationId || data) !== convIdRef.current) return;
      setAgentTyping(false);
    };

    const handlePresence = (data: any) => {
      const agentId = typeof conv.agentId === 'object' ? conv.agentId?._id : conv.agentId;
      if (data?.userId && data.userId !== agentId) return;
      setAgentPresence(data?.status || null);
    };

    const handleDelivered = (data: any) => {
      if (data?.conversationId !== convIdRef.current) return;
      setMessages(prev => prev.map(m => m._id === data.messageId ? { ...m, deliveredAt: new Date().toISOString() } : m));
    };

    const handleRead = (data: any) => {
      if (data?.conversationId !== convIdRef.current) return;
      setMessages(prev => prev.map(m => ({ ...m, readAt: new Date().toISOString() })));
    };

    const handleDeleted = (data: any) => {
      if (data?.conversationId !== convIdRef.current) return;
      setMessages(prev => prev.filter(m => m._id !== data.messageId));
    };

    const handleClosed = (data: any) => {
      if (data?.conversationId !== convIdRef.current) return;
      setConv(prev => ({ ...prev, status: 'CLOSED' }));
      onConversationUpdate({ ...conv, status: 'CLOSED' });
      toast('This conversation has been closed.', { icon: '🔒' });
    };

    const handleError = (data: any) => {
      toast.error(data?.message || 'A support error occurred.');
    };

    onSupportEvent(SUPPORT_EVENTS.MESSAGE_NEW, handleNewMessage);
    onSupportEvent(SUPPORT_EVENTS.TYPING_START, handleTypingStart);
    onSupportEvent(SUPPORT_EVENTS.TYPING_STOP, handleTypingStop);
    onSupportEvent(SUPPORT_EVENTS.PRESENCE, handlePresence);
    onSupportEvent(SUPPORT_EVENTS.MESSAGE_DELIVERED, handleDelivered);
    onSupportEvent(SUPPORT_EVENTS.MESSAGES_READ, handleRead);
    onSupportEvent(SUPPORT_EVENTS.MESSAGE_DELETED, handleDeleted);
    onSupportEvent(SUPPORT_EVENTS.CONVERSATION_CLOSED, handleClosed);
    onSupportEvent(SUPPORT_EVENTS.ERROR, handleError);

    return () => {
      offSupportEvent(SUPPORT_EVENTS.MESSAGE_NEW, handleNewMessage);
      offSupportEvent(SUPPORT_EVENTS.TYPING_START, handleTypingStart);
      offSupportEvent(SUPPORT_EVENTS.TYPING_STOP, handleTypingStop);
      offSupportEvent(SUPPORT_EVENTS.PRESENCE, handlePresence);
      offSupportEvent(SUPPORT_EVENTS.MESSAGE_DELIVERED, handleDelivered);
      offSupportEvent(SUPPORT_EVENTS.MESSAGES_READ, handleRead);
      offSupportEvent(SUPPORT_EVENTS.MESSAGE_DELETED, handleDeleted);
      offSupportEvent(SUPPORT_EVENTS.CONVERSATION_CLOSED, handleClosed);
      offSupportEvent(SUPPORT_EVENTS.ERROR, handleError);
      if (agentTypingTimeoutRef.current) clearTimeout(agentTypingTimeoutRef.current);
    };
  }, [convId]);

  // Load messages + mark read on open
  useEffect(() => {
    setConv(conversation);
    setMessages([]);
    setPage(1);
    setTotalPages(1);
    setInputValue('');
    setAgentTyping(false);
    loadMessages(1, false);
    markRead();
  }, [convId]);

  // ── Send message ───────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || !convId) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTypingStop(convId);

    const clientMessageId = crypto.randomUUID();
    const optimistic: LocalMessage = {
      _id: '',
      conversationId: convId,
      senderId: currentAdminId || 'admin',
      senderRole: 'ADMIN',
      message: text,
      messageType: isSensitive ? 'SENSITIVE' : 'TEXT',
      clientMessageId,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    setMessages(prev => [...prev, optimistic]);
    setInputValue('');
    setTimeout(scrollToBottom, 50);

    sendSupportMessage(convId, text, isSensitive ? 'SENSITIVE' : 'TEXT', clientMessageId, (ack: any) => {
      if (ack?.success !== false) {
        const serverId = ack?.data?._id || ack?._id || '';
        setMessages(prev =>
          dedupe(prev.map(m =>
            m.clientMessageId === clientMessageId
              ? { ...m, _id: serverId, status: 'sent' as const }
              : m
          ))
        );
      } else {
        setMessages(prev =>
          prev.map(m =>
            m.clientMessageId === clientMessageId ? { ...m, status: 'failed' as const } : m
          )
        );
        toast.error('Failed to send message. Please retry.');
      }
    });
  }, [inputValue, convId, isSensitive, currentAdminId, scrollToBottom]);

  // ── Typing detection ───────────────────────────────────────────
  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (!convId || isClosed) return;
    emitTypingStart(convId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTypingStop(convId), 2000);
  };

  // ── Claim ──────────────────────────────────────────────────────
  const handleClaim = async () => {
    if (!convId) return;
    setIsClaiming(true);
    try {
      const res = await claimConversation(convId);
      const updated = res?.data || { ...conv, adminId: currentAdminId };
      setConv(prev => ({ ...prev, ...updated }));
      onConversationUpdate({ ...conv, ...updated });
      toast.success('Conversation claimed successfully.');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        toast.error('This conversation has already been claimed by another admin.');
        // Refresh
        try {
          const fresh = await getConversations({ page: 1, limit: 1 });
          const found = (fresh?.data?.conversations || []).find((c: SupportConversation) => c._id === convId);
          if (found) { setConv(found); onConversationUpdate(found); }
        } catch {}
      } else if (status === 403) {
        toast.error('You are not authorized to claim this conversation.');
      } else {
        toast.error('Failed to claim conversation.');
      }
    } finally {
      setIsClaiming(false);
    }
  };

  // ── Close ──────────────────────────────────────────────────────
  const handleClose = async () => {
    if (!convId) return;
    setIsClosing(true);
    try {
      await closeConversation(convId);
      setConv(prev => ({ ...prev, status: 'CLOSED' }));
      onConversationUpdate({ ...conv, status: 'CLOSED' });
      toast.success('Conversation closed.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to close conversation.');
    } finally {
      setIsClosing(false);
      setShowCloseConfirm(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !convId) return;
    setIsDeleting(true);
    try {
      await new Promise<void>((resolve, reject) => {
        emitDeleteMessage(convId, deleteTarget, (ack: any) => {
          if (ack?.success === false) reject(new Error(ack?.message || 'Delete failed'));
          else resolve();
        });
        // Fallback: if no socket ack in 5s
        setTimeout(resolve, 5000);
      });
      setMessages(prev => prev.filter(m => m._id !== deleteTarget));
      toast.success('Message deleted.');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) toast.error('You are not authorized to delete this message.');
      else if (status === 404) setMessages(prev => prev.filter(m => m._id !== deleteTarget));
      else toast.error('Failed to delete message.');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const isAdminIdMatch = (() => {
    if (!conv.adminId) return false;
    const aid = typeof conv.adminId === 'object' ? conv.adminId?._id : conv.adminId;
    return aid === currentAdminId;
  })();

  const adminLabel = !conv.adminId ? 'Unassigned' : getAdminName(conv.adminId);
  const deleteMsg = messages.find(m => m._id === deleteTarget);
  const isSensitiveDelete = deleteMsg?.messageType === 'SENSITIVE';

  return (
    <div className="flex flex-col h-full bg-slate-50/60">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base">{agentName}</span>
              <span className={`flex items-center gap-1 text-[11px] font-semibold ${agentPresence === 'ONLINE' ? 'text-emerald-600' : 'text-slate-400'}`}>
                <Circle className={`w-2 h-2 fill-current ${agentPresence === 'ONLINE' ? 'text-emerald-500' : 'text-slate-400'}`} />
                {agentPresence || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-slate-500 font-medium">{getCategoryLabel(conv.category)}</span>
              <span className="text-slate-300">·</span>
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${conv.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {conv.status}
              </span>
              <span className="text-slate-300">·</span>
              <span className={`text-[11px] font-semibold ${isAdminIdMatch ? 'text-blue-600' : 'text-slate-400'}`}>
                {adminLabel}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Claim button */}
          {!conv.adminId && !isClosed && (
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-800 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              {isClaiming ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
              Claim
            </button>
          )}
          {/* Close button */}
          {conv.status === 'OPEN' && isAdminIdMatch && (
            <button
              onClick={() => setShowCloseConfirm(true)}
              disabled={isClosing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              {isClosing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
              Close
            </button>
          )}
        </div>
      </div>

      {/* Offline notice — informational only, does NOT disable messaging */}
      {agentPresence === 'OFFLINE' && (
        <div className="bg-amber-50 border-b border-amber-100 px-5 py-2 text-xs text-amber-700 font-medium flex items-center gap-2">
          <Circle className="w-2 h-2 fill-amber-400 text-amber-400" />
          Agent is currently offline. Your messages will be delivered when they reconnect.
        </div>
      )}

      {/* Closed notice */}
      {isClosed && (
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-2 text-xs text-slate-600 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
          This conversation is closed. History is read-only.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Load older */}
        {page < totalPages && (
          <div className="text-center mb-4">
            <button
              onClick={() => loadMessages(page + 1, true)}
              disabled={loadingOlder}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mx-auto transition-colors"
            >
              {loadingOlder ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronUp className="w-3 h-3" />}
              Load older messages
            </button>
          </div>
        )}

        {loadingMessages ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-sm text-slate-400 font-medium">No messages yet.</div>
        ) : (
          messages.map((msg) => {
            const isAdmin = msg.senderRole === 'ADMIN';
            return (
              <MessageBubble
                key={msg._id || msg.clientMessageId}
                msg={msg}
                isAdmin={isAdmin}
                isClosed={isClosed}
                onDelete={isAdmin ? (id) => setDeleteTarget(id) : undefined}
              />
            );
          })
        )}

        {agentTyping && (
          <div className="flex justify-start mb-2">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-2 text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              Agent is typing…
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className={`bg-white border-t border-slate-200 p-4 ${isClosed ? 'opacity-60 pointer-events-none' : ''}`}>
        {isClosed ? (
          <p className="text-center text-sm text-slate-400 font-medium py-1">Conversation is closed. No new messages can be sent.</p>
        ) : (
          <>
            {/* Sensitive toggle */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setIsSensitive(p => !p)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-colors ${isSensitive ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
              >
                <Lock className="w-3 h-3" />
                {isSensitive ? 'Sensitive ON' : 'Send as Sensitive'}
              </button>
              {isSensitive && <span className="text-[11px] text-amber-600 font-medium">Message will be encrypted by backend</span>}
            </div>
            <div className="flex items-end gap-3">
              <textarea
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
                rows={2}
                className="flex-1 resize-none text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all leading-relaxed"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="p-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Close confirm */}
      <ConfirmationModal
        isOpen={showCloseConfirm}
        actionType="custom"
        title="Close Conversation?"
        message="This conversation will be marked as closed. The agent will no longer be able to send new messages."
        confirmText="Close Conversation"
        onCancel={() => setShowCloseConfirm(false)}
        onConfirm={handleClose}
        loading={isClosing}
      />

      {/* Delete confirm */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        actionType="delete"
        title={isSensitiveDelete ? 'Delete Sensitive Message?' : 'Delete Message?'}
        message={
          isSensitiveDelete
            ? 'This sensitive message will be permanently deleted. This action cannot be undone.'
            : 'Are you sure you want to permanently delete this message? This action cannot be undone.'
        }
        confirmText="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />
    </div>
  );
}
