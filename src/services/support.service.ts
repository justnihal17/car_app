import api from '../api/axios';

// ─── Category Display Mapping ───────────────────────────────────
export const CATEGORY_MAP: Record<string, string> = {
  ACCOUNT_ISSUE: 'Account Issue',
  PASSWORD_ISSUE: 'Password Issue',
  ORDER_ISSUE: 'Order Issue',
  PAYMENT_EARNINGS: 'Payment & Earnings',
  TECHNICAL_ISSUE: 'Technical Issue',
  GENERAL_SUPPORT: 'Report',
};

export const CATEGORY_FILTER_OPTIONS = [
  { label: 'All Categories', value: '' },
  { label: 'Account Issue', value: 'ACCOUNT_ISSUE' },
  { label: 'Password Issue', value: 'PASSWORD_ISSUE' },
  { label: 'Order Issue', value: 'ORDER_ISSUE' },
  { label: 'Payment & Earnings', value: 'PAYMENT_EARNINGS' },
  { label: 'Technical Issue', value: 'TECHNICAL_ISSUE' },
  { label: 'Report', value: 'GENERAL_SUPPORT' },
];

export const STATUS_FILTER_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'OPEN' },
  { label: 'Closed', value: 'CLOSED' },
];

// ─── Helpers ────────────────────────────────────────────────────
export function getCategoryLabel(raw: string): string {
  return CATEGORY_MAP[raw] || raw?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';
}

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.trim().length > 0 && id !== 'undefined' && id !== 'null';
}

// ─── Conversation Interfaces ────────────────────────────────────
export interface SupportConversation {
  _id: string;
  agentId: any;
  adminId: any;
  category: string;
  status: 'OPEN' | 'CLOSED';
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'AGENT' | 'ADMIN';
  message: string;
  messageType: 'TEXT' | 'SENSITIVE';
  clientMessageId?: string;
  isRead?: boolean;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ConversationFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
  unreadOnly?: boolean;
}

// ─── REST API Methods ───────────────────────────────────────────

export async function getConversations(filters: ConversationFilters = {}) {
  const params: Record<string, string | number | boolean> = {};
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.status) params.status = filters.status;
  if (filters.category) params.category = filters.category;
  if (filters.search) params.search = filters.search;
  if (filters.unreadOnly) params.unreadOnly = true;

  const res = await api.get('/admin/support/conversations', { params });
  return res.data;
}

export async function getMessages(conversationId: string, page = 1, limit = 50) {
  if (!isValidId(conversationId)) {
    throw new Error('Invalid conversationId');
  }
  const res = await api.get(`/admin/support/conversations/${conversationId}/messages`, {
    params: { page, limit },
  });
  return res.data;
}

export async function claimConversation(conversationId: string) {
  if (!isValidId(conversationId)) {
    throw new Error('Invalid conversationId');
  }
  const res = await api.patch(`/admin/support/conversations/${conversationId}/claim`);
  return res.data;
}

export async function markConversationRead(conversationId: string) {
  if (!isValidId(conversationId)) {
    throw new Error('Invalid conversationId');
  }
  const res = await api.patch(`/admin/support/conversations/${conversationId}/read`);
  return res.data;
}

export async function closeConversation(conversationId: string) {
  if (!isValidId(conversationId)) {
    throw new Error('Invalid conversationId');
  }
  const res = await api.patch(`/admin/support/conversations/${conversationId}/close`);
  return res.data;
}

export async function deleteMessageREST(conversationId: string, messageId: string) {
  if (!isValidId(conversationId) || !isValidId(messageId)) {
    throw new Error('Invalid conversationId or messageId');
  }
  const res = await api.delete(`/admin/support/conversations/${conversationId}/messages/${messageId}`);
  return res.data;
}
