import React, { useState, useEffect } from 'react';
import { Promotion, PromotionFilterState, PromotionStats } from './types/promotion.types';
import { PromotionsHeader } from './components/PromotionsHeader';
import { PromotionsFilters } from './components/PromotionsFilters';
import { PromotionsTable } from './components/PromotionsTable';
import { PromotionDetailsView } from './components/PromotionDetailsView';
import { PromotionFormContainer } from './components/PromotionForm/PromotionFormContainer';
import { ConfirmationModal } from './components/PromotionModals';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function PromotionsModule() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [stats, setStats] = useState<PromotionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'details'>('list');
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // Filter State
  const [filters, setFilters] = useState<PromotionFilterState>({
    search: '',
    promoType: 'ALL',
    status: 'ALL',
    discountType: 'ALL',
    dateFilter: 'ALL',
  });

  // Modal states
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
  const [statusTarget, setStatusTarget] = useState<Promotion | null>(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/offers/stats');
      setStats(res.data?.data || res.data || null);
    } catch (err) {
      console.error('Failed to fetch offer stats', err);
    }
  };

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      await fetchStats();

      let endpoint = '/admin/offers';
      
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      const requestData: any = {};
      if (filters.search.trim()) requestData.title = filters.search.trim();
      if (filters.status !== 'ALL') requestData.status = filters.status;
      if (filters.promoType !== 'ALL') requestData.promoType = filters.promoType;

      if (filters.dateFilter === 'expired') {
        endpoint = '/admin/offers/expired';
      } else if (filters.dateFilter === 'deleted') {
        endpoint = '/admin/offers/deleted';
      } else if (filters.dateFilter === 'running') {
        endpoint = '/admin/offers/active';
      }

      const options: any = { params };
      if (Object.keys(requestData).length > 0) {
        options.data = requestData;
      }

      const res = await api.get(endpoint, options);
      
      let offers = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.offers || res.data || []);
      if (!Array.isArray(offers)) offers = [];

      if (filters.search.trim()) {
        const query = filters.search.trim().toLowerCase();
        offers = offers.filter((o: any) => o.title?.toLowerCase().includes(query) || o.code?.toLowerCase().includes(query));
      }
      
      const total = res.data?.extra?.pagination?.total || offers.length;

      setPromotions(offers);
      setPagination(prev => ({ ...prev, total }));
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [filters, pagination.page, pagination.limit]);

  // Handlers
  const handleCreateSubmit = async (newPromo: Promotion) => {
    try {
      setLoading(true);
      console.log('Submitting Promotion Payload:', newPromo);
      const promoPriority = newPromo.priority || 10;
      if (viewMode === 'edit' && selectedPromo) {
        await api.put(`/admin/offers/${selectedPromo.id || selectedPromo._id}?priority=${promoPriority}`, newPromo);
        toast.success('Promotion updated successfully!');
      } else {
        await api.post(`/admin/offers?priority=${promoPriority}`, newPromo);
        toast.success('Promotion created successfully!');
      }
      setViewMode('list');
      setSelectedPromo(null);
      fetchPromotions();
    } catch (error: any) {
      console.error('Save Promotion Error:', error.response?.data || error);
      const serverMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to save promotion';
      toast.error(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = (promo: Promotion) => {
    const duplicated = {
      ...promo,
      id: '',
      title: `Copy of ${promo.title}`,
      code: promo.promoType === 'COUPON' ? `${promo.code || 'OFFER'}_COPY` : undefined,
      usedCount: 0,
      status: 'INACTIVE',
    };
    setSelectedPromo(duplicated as Promotion);
    setViewMode('edit');
    toast.success('Promotion duplicated. Complete configuring and save.');
  };

  const confirmToggleStatus = async () => {
    if (!statusTarget) return;
    try {
      const newStatus = statusTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.put(`/admin/offers/${statusTarget.id || (statusTarget as any)._id}`, { status: newStatus });
      toast.success(`Promotion ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully!`);
      fetchPromotions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusTarget(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/offers/${deleteTarget.id || (deleteTarget as any)._id}`);
      toast.success('Promotion deleted successfully!');
      fetchPromotions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete promotion');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* View Switcher */}
      {viewMode === 'list' && (
        <>
          <PromotionsHeader
            promotions={promotions}
            loading={loading}
            stats={stats}
            onCreateClick={() => {
              setSelectedPromo(null);
              setViewMode('create');
            }}
          />
          <PromotionsFilters
            filters={filters}
            onFilterChange={(newFilters) => {
              setPagination(prev => ({ ...prev, page: 1 }));
              setFilters(newFilters);
            }}
            onRefresh={() => {
              fetchPromotions();
              toast.success('Promotions list refreshed');
            }}
          />
          <PromotionsTable
            promotions={promotions}
            loading={loading}
            onView={(p) => {
              setSelectedPromo(p);
              setViewMode('details');
            }}
            onEdit={(p) => {
              setSelectedPromo(p);
              setViewMode('edit');
            }}
            onDuplicate={handleDuplicate}
            onToggleStatus={(p) => setStatusTarget(p)}
            onDelete={(p) => setDeleteTarget(p)}
          />

          {!loading && pagination.total > pagination.limit && (
            <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-2xl border border-slate-200 shadow-sm mt-4">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page * pagination.limit >= pagination.total}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <PromotionFormContainer
          initialData={selectedPromo}
          onSubmit={handleCreateSubmit}
          onCancel={() => {
            setViewMode('list');
            setSelectedPromo(null);
          }}
        />
      )}

      {viewMode === 'details' && selectedPromo && (
        <PromotionDetailsView
          promotion={selectedPromo}
          onBack={() => {
            setViewMode('list');
            setSelectedPromo(null);
          }}
          onEdit={() => setViewMode('edit')}
        />
      )}

      {/* Confirmation Modals */}
      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        name={deleteTarget?.title || ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <ConfirmationModal
        isOpen={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={confirmToggleStatus}
        title={`${statusTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} Promotion`}
        message={`Are you sure you want to ${
          statusTarget?.status === 'ACTIVE'
            ? 'deactivate this promotion? It will no longer be available to customers.'
            : 'activate this promotion? Customers will be able to use it according to its eligibility rules.'
        }`}
        confirmText={statusTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        type="warning"
      />
    </div>
  );
}
