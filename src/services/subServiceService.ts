import api from '../api/axios';

/**
 * Customer API: Get sub-services by service ID
 * Returns only active sub-services for the customer app.
 * Endpoint: GET /admin/subservice/service/:serviceId
 */
export const getCustomerSubServicesByServiceId = async (serviceId: string) => {
  const response = await api.get(`/admin/subservice/service/${serviceId}`);
  return response.data;
};

/**
 * Admin API: Get sub-services by service ID
 * Returns all sub-services (both active and inactive) for admin management.
 * Endpoint: GET /admin/subservice/admin/service/:serviceId
 */
export const getAdminSubServicesByServiceId = async (serviceId: string) => {
  const response = await api.get(`/admin/subservice/admin/service/${serviceId}`);
  return response.data;
};
