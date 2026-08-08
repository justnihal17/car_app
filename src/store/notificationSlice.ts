import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AppNotification, NotificationState } from '../types/notification.types';
import { notificationService } from '../services/notification.service';

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  filters: {
    search: '',
    category: 'All',
    status: 'All',
    priority: 'All'
  }
};

// Async Thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (params?: { is_read?: boolean; page?: number; limit?: number }) => {
    const response = await notificationService.fetchNotifications(params);
    return response;
  }
);

export const createNotification = createAsyncThunk(
  'notifications/create',
  async (notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    // Local mock since API doesn't support creating notifications from admin panel
    return {
      ...notification,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false
    } as AppNotification;
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: string) => {
    await notificationService.markAsRead(id);
    return id;
  }
);

export const markAsUnread = createAsyncThunk(
  'notifications/markAsUnread',
  async (id: string) => {
    // API doesn't support mark as unread, handle locally
    return id;
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    await notificationService.markAllAsRead();
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id: string) => {
    await notificationService.deleteNotification(id);
    return id;
  }
);

export const clearReadNotifications = createAsyncThunk(
  'notifications/clearAll',
  async () => {
    await notificationService.clearAllNotifications();
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Partial<NotificationState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // Allows receiving real-time/websocket payloads immediately without refreshing
    addRealtimeNotification: (state, action: PayloadAction<AppNotification>) => {
      const exists = state.notifications.find(n => n.id === action.payload.id);
      if (!exists) {
        state.notifications.unshift(action.payload);
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      })
      // Create
      .addCase(createNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
        state.unreadCount += 1;
      })
      // Mark Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notif = state.notifications.find(n => n.id === action.payload);
        if (notif && !notif.isRead) {
          notif.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark Unread
      .addCase(markAsUnread.fulfilled, (state, action) => {
        const notif = state.notifications.find(n => n.id === action.payload);
        if (notif && notif.isRead) {
          notif.isRead = false;
          state.unreadCount += 1;
        }
      })
      // Mark All Read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => { n.isRead = true; });
        state.unreadCount = 0;
      })
      // Delete
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notif = state.notifications.find(n => n.id === action.payload);
        if (notif && !notif.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
      })
      // Clear All
      .addCase(clearReadNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      });
  }
});

export const { setFilter, addRealtimeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
