import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/constants';

// ─── Singleton Socket Instance ──────────────────────────────────
let socket: Socket | null = null;
let currentConversationId: string | null = null;

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.trim().length > 0 && id !== 'undefined' && id !== 'null';
}

function getSocketUrl(): string {
  try {
    const url = new URL(API_BASE_URL);
    return url.origin;
  } catch {
    return API_BASE_URL;
  }
}

// ─── Connect ────────────────────────────────────────────────────
export function connectSupportSocket(): Socket {
  if (socket?.connected) return socket;

  const token = sessionStorage.getItem('accessToken');
  if (!token) throw new Error('No auth token available');

  if (socket) {
    // Already exists but disconnected — update auth and reconnect
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(getSocketUrl(), {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
    path: '/socket.io',
  });

  // On reconnect, rejoin current conversation
  socket.on('connect', () => {
    if (currentConversationId && isValidId(currentConversationId)) {
      socket?.emit('support:join', { conversationId: currentConversationId });
    }
  });

  return socket;
}

// ─── Disconnect ─────────────────────────────────────────────────
export function disconnectSupportSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    currentConversationId = null;
  }
}

// ─── Get socket (or null) ───────────────────────────────────────
export function getSupportSocket(): Socket | null {
  return socket;
}

// ─── Is Connected ───────────────────────────────────────────────
export function isSocketConnected(): boolean {
  return !!socket?.connected;
}

// ─── Join Conversation ──────────────────────────────────────────
export function joinConversation(conversationId: string): void {
  if (!isValidId(conversationId)) return;
  if (!socket?.connected) return;
  currentConversationId = conversationId;
  socket.emit('support:join', { conversationId });
}

// ─── Get Current Conversation ───────────────────────────────────
export function getCurrentConversationId(): string | null {
  return currentConversationId;
}

export function setCurrentConversationId(id: string | null): void {
  currentConversationId = id;
}

// ─── Send Message ───────────────────────────────────────────────
export function sendSupportMessage(
  conversationId: string,
  message: string,
  messageType: 'TEXT' | 'SENSITIVE',
  clientMessageId: string,
  callback?: (ack: any) => void
): void {
  if (!isValidId(conversationId)) return;
  if (!socket?.connected) return;

  socket.emit(
    'support:message',
    { conversationId, message, messageType, clientMessageId },
    callback
  );
}

// ─── Typing ─────────────────────────────────────────────────────
let typingTimeout: ReturnType<typeof setTimeout> | null = null;

export function emitTypingStart(conversationId: string): void {
  if (!isValidId(conversationId) || !socket?.connected) return;
  socket.emit('support:typing:start', { conversationId });

  // Auto-stop after 3s
  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    emitTypingStop(conversationId);
  }, 3000);
}

export function emitTypingStop(conversationId: string): void {
  if (!isValidId(conversationId) || !socket?.connected) return;
  socket.emit('support:typing:stop', { conversationId });
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }
}

// ─── Delete Message ─────────────────────────────────────────────
export function emitDeleteMessage(
  conversationId: string,
  messageId: string,
  callback?: (ack: any) => void
): void {
  if (!isValidId(conversationId) || !isValidId(messageId)) return;
  if (!socket?.connected) return;
  socket.emit('support:message:delete', { conversationId, messageId }, callback);
}

// ─── Safe Listener Registration ─────────────────────────────────
// Removes existing listener before adding to prevent duplicates
export function onSupportEvent(event: string, handler: (...args: any[]) => void): void {
  if (!socket) return;
  socket.off(event, handler);
  socket.on(event, handler);
}

export function offSupportEvent(event: string, handler?: (...args: any[]) => void): void {
  if (!socket) return;
  if (handler) {
    socket.off(event, handler);
  } else {
    socket.off(event);
  }
}

// ─── All Event Names ────────────────────────────────────────────
export const SUPPORT_EVENTS = {
  MESSAGE_NEW: 'support:message:new',
  MESSAGE_DELIVERED: 'support:message:delivered',
  MESSAGES_READ: 'support:messages:read',
  TYPING_START: 'support:typing:start',
  TYPING_STOP: 'support:typing:stop',
  PRESENCE: 'support:presence',
  MESSAGE_DELETED: 'support:message:deleted',
  CONVERSATION_CLOSED: 'support:conversation:closed',
  ERROR: 'support:error',
} as const;
