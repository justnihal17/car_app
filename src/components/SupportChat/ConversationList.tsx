import { Search, Filter, Circle } from 'lucide-react';
import { getCategoryLabel, CATEGORY_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from '../../services/support.service';
import type { SupportConversation } from '../../services/support.service';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: SupportConversation[];
  selectedId: string | null;
  onSelect: (conv: SupportConversation) => void;
  loading: boolean;
  // Filters
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  categoryFilter: string;
  onCategoryChange: (v: string) => void;
  unreadOnly: boolean;
  onUnreadToggle: () => void;
  // Pagination
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

function getAgentName(conv: SupportConversation): string {
  const agent = conv.agentId;
  if (!agent) return 'Unknown Agent';
  if (typeof agent === 'string') return agent;
  return agent.name || agent.fullName || `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Agent';
}

function getStatusColor(status: string) {
  return status === 'OPEN'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-slate-100 text-slate-500 border-slate-200';
}

export function ConversationList({
  conversations, selectedId, onSelect, loading,
  search, onSearchChange, statusFilter, onStatusChange,
  categoryFilter, onCategoryChange, unreadOnly, onUnreadToggle,
  page, totalPages, onPageChange,
}: ConversationListProps) {
  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 space-y-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Support Inbox</h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all"
          />
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300"
          >
            {STATUS_FILTER_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300"
          >
            {CATEGORY_FILTER_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={onUnreadToggle}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
              unreadOnly
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">Loading...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center">
            <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-500">No conversations found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search.</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = selectedId === conv._id;
            const hasUnread = (conv.unreadCount || 0) > 0;
            return (
              <button
                key={conv._id}
                onClick={() => onSelect(conv)}
                className={`w-full text-left px-4 py-3.5 border-b border-slate-100 transition-colors ${
                  isSelected
                    ? 'bg-slate-50 border-l-[3px] border-l-slate-800'
                    : hasUnread
                    ? 'bg-white hover:bg-slate-50/80 border-l-[3px] border-l-transparent'
                    : 'bg-white hover:bg-slate-50/50 border-l-[3px] border-l-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm truncate ${hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                        {getAgentName(conv)}
                      </span>
                      {hasUnread && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-800 text-white rounded-full leading-none">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded border ${getStatusColor(conv.status)}`}>
                        {conv.status}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 truncate">
                        {getCategoryLabel(conv.category)}
                      </span>
                    </div>
                    {conv.lastMessage && (
                      <p className={`text-xs mt-1 truncate ${hasUnread ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                        {conv.lastMessage}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                      {conv.lastMessageAt ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true }) : ''}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>
          <span className="text-slate-500 font-medium">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
