import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OrderService, OrderFilters } from '../services/order.service';

export interface OrderState {
  orders: any[];
  recentOrders: any[];
  selectedOrder: any | null;
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
    totalPages: 0,
  }
};

export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (filters: OrderFilters, { rejectWithValue }) => {
    try {
      const response = await OrderService.getOrders(filters);
      if (response.success) {
        return { data: response.data, pagination: response.extra?.pagination };
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
      state.orders = action.payload.data;
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
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
  }
});

export const { setFilters, clearSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
