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
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    const response = await api.get('/admin/order', { params });
    return response.data;
  },

  getRecentOrders: async () => {
    const response = await api.get('/admin/order/recent');
    return response.data;
  },

  getOrderById: async (id: string) => {
    const response = await api.get(`/admin/order/${id}`);
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

  cancelOrder: async (id: string, cancel_reason: string) => {
    const response = await api.patch(`/admin/order/${id}/cancel`, { cancel_reason });
    return response.data;
  },

  updatePayment: async (id: string, data: { status: string; transaction_id?: string; method?: string }) => {
    const response = await api.patch(`/admin/order/${id}/payment`, data);
    return response.data;
  }
};
