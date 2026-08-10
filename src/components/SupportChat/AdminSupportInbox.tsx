import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { ConversationList } from './ConversationList';
import { ChatPanel } from './ChatPanel';
import {
  getConversations,
  type SupportConversation,
  type ConversationFilters,
} from '../../services/support.service';
import {
  connectSupportSocket,
  onSupportEvent,
  offSupportEvent,
  SUPPORT_EVENTS,
  isSocketConnected,
  getSupportSocket,
} from '../../services/supportSocket.service';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE = 300;

export function AdminSupportInbox() {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedConv, setSelectedConv] = useState<SupportConversation | null>(null);
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [showChat, setShowChat] = useState(false); // for mobile toggle

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchValueRef = useRef(search);
  searchValueRef.current = search;

  // ── Fetch conversations ────────────────────────────────────────
  const fetchConversations = useCallback(async (pg: number, filters: ConversationFilters) => {
    setLoading(true);
    try {
      const res = await getConversations({ ...filters, page: pg, limit: PAGE_SIZE });
      const list: SupportConversation[] = res?.data?.conversations || res?.conversations || [];
      const pagination = res?.data?.pagination || res?.pagination || {};
      setConversations(list);
      setTotalPages(pagination.totalPages || 1);
    } catch (err: any) {
      // Silently fail on filter change, show error only on initial load
    } finally {
      setLoading(false);
    }
  }, []);

  const currentFilters = useCallback((): ConversationFilters => ({
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    search: search.trim() || undefined,
    unreadOnly: unreadOnly || undefined,
  }), [statusFilter, categoryFilter, search, unreadOnly]);

  useEffect(() => {
    fetchConversations(page, currentFilters());
  }, [page, statusFilter, categoryFilter, unreadOnly]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchConversations(1, {
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        search: searchValueRef.current.trim() || undefined,
        unreadOnly: unreadOnly || undefined,
      });
    }, SEARCH_DEBOUNCE);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [search]);

  // ── Socket connection & inbox realtime ─────────────────────────
  useEffect(() => {
    try {
      const sock = connectSupportSocket();
      setSocketStatus(isSocketConnected() ? 'connected' : 'reconnecting');

      const onConnect = () => setSocketStatus('connected');
      const onDisconnect = () => setSocketStatus('disconnected');
      const onReconnectAttempt = () => setSocketStatus('reconnecting');

      sock.on('connect', onConnect);
      sock.on('disconnect', onDisconnect);
      sock.io.on('reconnect_attempt', onReconnectAttempt);

      // Global inbox update when a message arrives for any conversation
      const handleNewMessage = (data: any) => {
        const incomingConvId = data?.conversationId || data?.message?.conversationId;
        if (!incomingConvId) return;

        // If it's the currently open conversation, ChatPanel handles it
        // Just update the inbox row metadata
        setConversations(prev => {
          const updated = prev.map(c => {
            if (c._id !== incomingConvId) return c;
            const msgText = data?.message?.message || data?.message || '';
            const isSelected = selectedConv?._id === incomingConvId;
            return {
              ...c,
              lastMessage: typeof msgText === 'string' ? msgText : c.lastMessage,
              lastMessageAt: data?.message?.createdAt || new Date().toISOString(),
              unreadCount: isSelected ? (c.unreadCount || 0) : (c.unreadCount || 0) + 1,
            };
          });
          // Re-sort by lastMessageAt DESC
          return [...updated].sort((a, b) => {
            const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return bTime - aTime;
          });
        });
      };

      // Conversation closed realtime
      const handleConvClosed = (data: any) => {
        const cid = data?.conversationId;
        if (!cid) return;
        setConversations(prev => prev.map(c => c._id === cid ? { ...c, status: 'CLOSED' } : c));
      };

      onSupportEvent(SUPPORT_EVENTS.MESSAGE_NEW, handleNewMessage);
      onSupportEvent(SUPPORT_EVENTS.CONVERSATION_CLOSED, handleConvClosed);

      return () => {
        sock.off('connect', onConnect);
        sock.off('disconnect', onDisconnect);
        sock.io.off('reconnect_attempt', onReconnectAttempt);
        offSupportEvent(SUPPORT_EVENTS.MESSAGE_NEW, handleNewMessage);
        offSupportEvent(SUPPORT_EVENTS.CONVERSATION_CLOSED, handleConvClosed);
      };
    } catch {}
  }, []);

  // ── Handlers ───────────────────────────────────────────────────
  const handleSelectConv = (conv: SupportConversation) => {
    setSelectedConv(conv);
    setConversations(prev => prev.map(c => c._id === conv._id ? { ...c, unreadCount: 0 } : c));
    setShowChat(true);
  };

  const handleConversationUpdate = (updated: SupportConversation) => {
    setConversations(prev => prev.map(c => c._id === updated._id ? { ...updated } : c));
    if (selectedConv?._id === updated._id) setSelectedConv(updated);
  };

  const handleBackToList = () => setShowChat(false);

  const handleFilterChange = (setter: (v: string) => void, val: string) => {
    setter(val);
    setPage(1);
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50/60">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Support</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Agent support conversations</p>
        </div>
        {/* Socket indicator */}
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${
          socketStatus === 'connected' ? 'text-emerald-600' :
          socketStatus === 'reconnecting' ? 'text-amber-500' : 'text-slate-400'
        }`}>
          {socketStatus === 'connected' ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {socketStatus === 'connected' ? 'Live' : socketStatus === 'reconnecting' ? 'Reconnecting…' : 'Offline'}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Conversation list */}
        <div className={`${showChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 xl:w-96 flex-col`}>
          <ConversationList
            conversations={conversations}
            selectedId={selectedConv?._id || null}
            onSelect={handleSelectConv}
            loading={loading}
            search={search}
            onSearchChange={(v) => setSearch(v)}
            statusFilter={statusFilter}
            onStatusChange={(v) => handleFilterChange(setStatusFilter, v)}
            categoryFilter={categoryFilter}
            onCategoryChange={(v) => handleFilterChange(setCategoryFilter, v)}
            unreadOnly={unreadOnly}
            onUnreadToggle={() => { setUnreadOnly(p => !p); setPage(1); }}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>

        {/* Right: Chat panel */}
        <div className={`${showChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden`}>
          {selectedConv ? (
            <>
              {/* Mobile back button */}
              <div className="md:hidden bg-white border-b border-slate-100 px-4 py-2">
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Inbox
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatPanel
                  key={selectedConv._id}
                  conversation={selectedConv}
                  onConversationUpdate={handleConversationUpdate}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/60">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">Select a conversation</h3>
              <p className="text-sm text-slate-400 max-w-xs">
                Choose a conversation from the inbox to start reviewing or responding to agent support reports.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
