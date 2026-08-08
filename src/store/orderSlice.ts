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
  async (id: string, { rejectWithValue }) => {
    try {
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
      
      if (!isMongoId) {
        // If it's a display order number (like ORD000109), fetch via search
        const searchResponse = await OrderService.getOrders({ search: id, limit: 1 });
        if (searchResponse.success && searchResponse.data && searchResponse.data.length > 0) {
          return searchResponse.data[0];
        }
        return rejectWithValue('Order not found');
      }

      const response = await OrderService.getOrderById(id);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch order details');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
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
      const ordersList = action.payload.data || [];
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
      state.recentOrders = action.payload;
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
