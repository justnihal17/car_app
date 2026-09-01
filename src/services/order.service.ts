import api from '../api/axios';

export interface OrderFilters {
  status?: string;
  payment?: string;
  agent?: string;
  date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const OrderService = {
  getOrders: async (filters: OrderFilters) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.payment) params.append('payment_status', filters.payment);
    if (filters.agent) params.append('agent_id', filters.agent);
    if (filters.search) {
      params.append('search', filters.search);
      params.append('order_number', filters.search);
      params.append('orderNumber', filters.search);
    }
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    // Sort newest orders first
    params.append('sort', '-createdAt');
    params.append('sortBy', 'createdAt');
    params.append('sortOrder', 'desc');
    
    const response = await api.get('/admin/order', { params });
    return response.data;
  },

  getRecentOrders: async () => {
    const response = await api.get('/admin/order/recent');
    return response.data;
  },

  getOrderById: async (id: string) => {
    try {
      const response = await api.get(`/admin/order/${id}`);
      if (response.data?.success && response.data?.data) return response.data;
      if (response.data && (response.data._id || response.data.order_number)) return response.data;
    } catch (e: any) {
      if (e.response?.status !== 404 && e.response?.data?.success) throw e;
    }

    try {
      const response = await api.get(`/admin/orders/${id}`);
      if (response.data?.success && response.data?.data) return response.data;
      if (response.data && (response.data._id || response.data.order_number)) return response.data;
    } catch (e) {}

    try {
      const response = await api.get(`/order/admin/orders/${id}`);
      if (response.data?.success && response.data?.data) return response.data;
    } catch (e) {}

    const response = await api.get('/admin/order', {
      params: { search: id, order_number: id, limit: 10 }
    });
    return response.data;
  },

  getOrderByNumber: async (orderNumber: string) => {
    try {
      const response = await api.get(`/admin/order/${orderNumber}`);
      if (response.data?.success && response.data?.data) return response.data;
    } catch (e) {}

    const response = await api.get('/admin/order', {
      params: { search: orderNumber, order_number: orderNumber, orderNumber, limit: 10 }
    });
    return response.data;
  },

  updateOrder: async (id: string, data: { scheduled_at?: string; customer_note?: string }) => {
    const response = await api.patch(`/admin/order/${id}`, data);
    return response.data;
  },

  assignAgent: async (id: string, agent_id: string) => {
    const response = await api.patch(`/admin/order/${id}/assign`, { agent_id });
    return response.data;
  },

  reassignAgent: async (id: string, payload: { agent_id: string; reason: string; version?: number }) => {
    const response = await api.patch(`/admin/order/${id}/reassign`, payload);
    return response.data;
  },

  getActiveEligibleAgents: async () => {
    const response = await api.get('/agent/agent', {
      params: { limit: 100, page: 1 }
    });
    const agents: any[] = response.data?.data || response.data || [];
    return agents.filter((a: any) => a.active === true && a.blocked !== true && a.isDeleted !== true);
  },

  cancelOrder: async (id: string, cancel_reason: string) => {
    const response = await api.patch(`/admin/order/${id}/cancel`, { cancel_reason });
    return response.data;
  },

  updatePayment: async (id: string, data: { status: string; transaction_id?: string; method?: string }) => {
    const response = await api.patch(`/admin/order/${id}/payment`, data);
    return response.data;
  },

  getLiveOverview: async (params?: { startDate?: string; endDate?: string }) => {
    try {
      const response = await api.get('/admin/order/live-overview', { params });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        const response = await api.get('/admin/orders/live-overview', { params });
        return response.data;
      }
      throw error;
    }
  }
};
