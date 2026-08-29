import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OrderService, OrderFilters } from '../services/order.service';

export interface LiveOverviewItem {
  count: number;
  percentage: number;
}

export interface LiveOverviewData {
  totalOrders: number;
  pending: LiveOverviewItem;
  accepted: LiveOverviewItem;
  agentAssigned: LiveOverviewItem;
  onTheWay: LiveOverviewItem;
  inProgress: LiveOverviewItem;
  completed: LiveOverviewItem;
  cancelled: LiveOverviewItem;
}

export const getOrderTimestamp = (order: any): number => {
  if (!order) return 0;
  // 1. High-precision database creation timestamp
  if (order.createdAt) {
    const t = new Date(order.createdAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (order.created_at) {
    const t = new Date(order.created_at).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (order.updatedAt) {
    const t = new Date(order.updatedAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (order.order_date) {
    const t = new Date(order.order_date).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (order.date) {
    const t = new Date(order.date).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  // 2. MongoDB ObjectId timestamp (first 4 bytes encode exact creation epoch)
  const id = order._id || order.id;
  if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
    const t = parseInt(id.substring(0, 8), 16) * 1000;
    if (!isNaN(t) && t > 0) return t;
  }
  if (order.scheduled_at) {
    const t = new Date(order.scheduled_at).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  // 3. Fallback: Parse order number digits (e.g. ORD000087 -> 87)
  const ordNum = String(order.order_number || order.orderNumber || '');
  const digits = ordNum.replace(/\D/g, '');
  if (digits) {
    return parseInt(digits, 10);
  }
  return 0;
};

export interface OrderState {
  orders: any[];
  recentOrders: any[];
  selectedOrder: any | null;
  liveOverview: LiveOverviewData | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  filters: OrderFilters;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: OrderState = {
  orders: [],
  recentOrders: [],
  selectedOrder: null,
  liveOverview: null,
  loading: false,
  actionLoading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  }
};

export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (filters: OrderFilters, { rejectWithValue }) => {
    try {
      const response = await OrderService.getOrders(filters);
      if (response.success) {
        const pagination = response.pagination || response.extra?.pagination;
        const total = pagination?.total ?? response.total ?? response.count ?? (Array.isArray(response.data) ? response.data.length : 0);
        return { 
          data: response.data || [], 
          pagination,
          total
        };
      }
      return rejectWithValue(response.message || 'Failed to fetch orders');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchRecentOrders = createAsyncThunk(
  'order/fetchRecentOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await OrderService.getRecentOrders();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch recent orders');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const cleanId = String(id || '').trim();
      if (!cleanId) return rejectWithValue('Invalid Order ID');

      // 1. Direct API call with ID or order_number
      try {
        const response = await OrderService.getOrderById(cleanId);
        if (response && response.success && response.data) {
          return response.data;
        }
        if (response && response.data && (response.data._id || response.data.order_number)) {
          return response.data;
        }
      } catch (e) {
        console.warn('Direct getOrderById failed, trying search fallback:', e);
      }

      // 2. Search /admin/order with order_number / search
      try {
        const searchResponse = await OrderService.getOrders({ search: cleanId, limit: 20 });
        const list = Array.isArray(searchResponse.data) ? searchResponse.data : (searchResponse.data?.orders || []);
        if (list.length > 0) {
          const match = list.find((o: any) => 
            String(o.order_number || o.orderNumber || '').trim().toLowerCase() === cleanId.toLowerCase() ||
            String(o._id || o.id || '').trim().toLowerCase() === cleanId.toLowerCase()
          );
          if (match) return match;
          return list[0];
        }
      } catch (e) {
        console.warn('Search fallback failed:', e);
      }

      // 3. Try recent orders API
      try {
        const recentResponse = await OrderService.getRecentOrders();
        const recentList = Array.isArray(recentResponse.data) ? recentResponse.data : (recentResponse.data?.orders || []);
        if (recentList.length > 0) {
          const match = recentList.find((o: any) => 
            String(o.order_number || o.orderNumber || '').trim().toLowerCase() === cleanId.toLowerCase() ||
            String(o._id || o.id || '').trim().toLowerCase() === cleanId.toLowerCase()
          );
          if (match) return match;
        }
      } catch (e) {
        console.warn('Recent orders fallback failed:', e);
      }

      // 4. Fetch general orders list
      try {
        const allResponse = await OrderService.getOrders({ limit: 100 });
        const allList = Array.isArray(allResponse.data) ? allResponse.data : (allResponse.data?.orders || []);
        if (allList.length > 0) {
          const match = allList.find((o: any) => 
            String(o.order_number || o.orderNumber || '').trim().toLowerCase() === cleanId.toLowerCase() ||
            String(o._id || o.id || '').trim().toLowerCase() === cleanId.toLowerCase()
          );
          if (match) return match;
        }
      } catch (e) {
        console.warn('All orders list fallback failed:', e);
      }

      // 5. Fallback: check currently loaded orders in Redux state
      const state = getState() as any;
      const foundInOrders = state.order?.orders?.find((o: any) => 
        String(o._id) === cleanId || 
        String(o.id) === cleanId || 
        String(o.order_number || o.orderNumber || '').trim().toLowerCase() === cleanId.toLowerCase()
      );
      if (foundInOrders) return foundInOrders;

      const foundInRecent = state.order?.recentOrders?.find((o: any) => 
        String(o._id) === cleanId || 
        String(o.id) === cleanId || 
        String(o.order_number || o.orderNumber || '').trim().toLowerCase() === cleanId.toLowerCase()
      );
      if (foundInRecent) return foundInRecent;

      return rejectWithValue('Order not found');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch order details');
    }
  }
);

export const fetchLiveOverview = createAsyncThunk(
  'order/fetchLiveOverview',
  async (params: { startDate?: string; endDate?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await OrderService.getLiveOverview(params);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch live order overview');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<OrderFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedOrder(state) {
      state.selectedOrder = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Orders
    builder.addCase(fetchOrders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      state.loading = false;
      const ordersList = Array.isArray(action.payload.data) ? [...action.payload.data] : [];
      ordersList.sort((a, b) => {
        const timeA = getOrderTimestamp(a);
        const timeB = getOrderTimestamp(b);
        if (timeB !== timeA) return timeB - timeA;

        const numA = parseInt(String(a.order_number || a.orderNumber || '').replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(String(b.order_number || b.orderNumber || '').replace(/\D/g, ''), 10) || 0;
        if (numB !== numA) return numB - numA;

        const idA = String(a.order_number || a._id || a.id || '');
        const idB = String(b.order_number || b._id || b.id || '');
        return idB.localeCompare(idA, undefined, { numeric: true });
      });
      state.orders = ordersList;

      const paginationObj = action.payload.pagination;
      const totalCount = action.payload.total ?? paginationObj?.total ?? ordersList.length;
      const limitVal = paginationObj?.limit || state.filters.limit || 10;
      const pageVal = paginationObj?.page || state.filters.page || 1;
      const totalPagesVal = paginationObj?.totalPages || Math.ceil(totalCount / limitVal) || 1;

      state.pagination = {
        total: totalCount,
        page: pageVal,
        limit: limitVal,
        totalPages: totalPagesVal
      };
    });
    builder.addCase(fetchOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Recent Orders
    builder.addCase(fetchRecentOrders.fulfilled, (state, action) => {
      const recent = Array.isArray(action.payload) ? [...action.payload] : [];
      recent.sort((a, b) => {
        const timeA = getOrderTimestamp(a);
        const timeB = getOrderTimestamp(b);
        if (timeB !== timeA) return timeB - timeA;
        const idA = String(a.order_number || a._id || a.id || '');
        const idB = String(b.order_number || b._id || b.id || '');
        return idB.localeCompare(idA, undefined, { numeric: true });
      });
      state.recentOrders = recent;
    });

    // Fetch Order By Id
    builder.addCase(fetchOrderById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrderById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedOrder = action.payload;
    });
    builder.addCase(fetchOrderById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Live Overview
    builder.addCase(fetchLiveOverview.fulfilled, (state, action) => {
      state.liveOverview = action.payload;
    });
  }
});

export const { setFilters, clearSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
