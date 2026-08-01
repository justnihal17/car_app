import React, { useState, useMemo, useEffect } from 'react';
import { Promotion, PromotionFilterState } from './types/promotion.types';
import { INITIAL_PROMOTIONS } from './data/dummyPromotions';
import { PromotionsHeader } from './components/PromotionsHeader';
import { PromotionsFilters } from './components/PromotionsFilters';
import { PromotionsTable } from './components/PromotionsTable';
import { PromotionDetailsView } from './components/PromotionDetailsView';
import { PromotionFormContainer } from './components/PromotionForm/PromotionFormContainer';
import { ConfirmationModal } from './components/PromotionModals';
import toast from 'react-hot-toast';

export default function PromotionsModule() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'details'>('list');
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPromotions(INITIAL_PROMOTIONS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter State
  const [filters, setFilters] = useState<PromotionFilterState>({
    search: '',
    promoType: 'all',
    status: 'all',
    discountType: 'all',
    dateFilter: 'all',
  });

  // Modal states
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
  const [statusTarget, setStatusTarget] = useState<Promotion | null>(null);

  // Filtered Promotions List
  const filteredPromotions = useMemo(() => {
    return promotions.filter((p) => {
      if (p.isDeleted) return false;

      // Search (title or code)
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchCode = p.code ? p.code.toLowerCase().includes(query) : false;
        if (!matchTitle && !matchCode) return false;
      }

      // Promo Type
      if (filters.promoType !== 'all' && p.promoType !== filters.promoType) {
        return false;
      }

      // Status
      if (filters.status !== 'all' && p.status !== filters.status) {
        return false;
      }

      // Discount Type
      if (filters.discountType !== 'all' && p.discountType !== filters.discountType) {
        return false;
      }

      // Date Filter
      if (filters.dateFilter !== 'all') {
        const today = new Date().toISOString().split('T')[0];
        const isExpired = p.endDate ? p.endDate < today : false;
        const isUpcoming = p.startDate > today;
        const isRunning = p.startDate <= today && (!p.endDate || p.endDate >= today);

        if (filters.dateFilter === 'expired' && !isExpired) return false;
        if (filters.dateFilter === 'upcoming' && !isUpcoming) return false;
        if (filters.dateFilter === 'running' && !isRunning) return false;
      }

      return true;
    });
  }, [promotions, filters]);

  // Handlers
  const handleCreateSubmit = (newPromo: Promotion) => {
    if (viewMode === 'edit' && selectedPromo) {
      setPromotions((prev) => prev.map((p) => (p.id === newPromo.id ? newPromo : p)));
      toast.success('Promotion updated successfully!');
    } else {
      setPromotions((prev) => [newPromo, ...prev]);
      toast.success('Promotion created successfully!');
    }
    setViewMode('list');
    setSelectedPromo(null);
  };

  const handleDuplicate = (promo: Promotion) => {
    const duplicated: Promotion = {
      ...promo,
      id: `prom-${Date.now()}`,
      title: `Copy of ${promo.title}`,
      code: promo.promoType === 'coupon' ? `${promo.code || 'OFFER'}_COPY` : undefined,
      usedCount: 0,
      status: 'inactive',
    };
    setSelectedPromo(duplicated);
    setViewMode('edit');
    toast.success('Promotion duplicated. Complete configuring and save.');
  };

  const confirmToggleStatus = () => {
    if (!statusTarget) return;
    const newStatus = statusTarget.status === 'active' ? 'inactive' : 'active';
    setPromotions((prev) =>
      prev.map((p) => (p.id === statusTarget.id ? { ...p, status: newStatus } : p))
    );
    toast.success(`Promotion ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
    setStatusTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setPromotions((prev) =>
      prev.map((p) => (p.id === deleteTarget.id ? { ...p, isDeleted: true } : p))
    );
    toast.success('Promotion deleted successfully!');
    setDeleteTarget(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* View Switcher */}
      {viewMode === 'list' && (
        <>
          <PromotionsHeader
            promotions={promotions}
            loading={loading}
            onCreateClick={() => {
              setSelectedPromo(null);
              setViewMode('create');
            }}
          />
          <PromotionsFilters
            filters={filters}
            onFilterChange={setFilters}
            onRefresh={() => {
              setPromotions([...INITIAL_PROMOTIONS]);
              toast.success('Promotions list refreshed');
            }}
          />
          <PromotionsTable
            promotions={filteredPromotions}
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
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Promotion"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action will mark the promotion as deleted and remove it from active listings.`}
        confirmText="Delete Promotion"
        type="danger"
      />

      <ConfirmationModal
        isOpen={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={confirmToggleStatus}
        title={`${statusTarget?.status === 'active' ? 'Deactivate' : 'Activate'} Promotion`}
        message={`Are you sure you want to ${
          statusTarget?.status === 'active'
            ? 'deactivate this promotion? It will no longer be available to customers.'
            : 'activate this promotion? Customers will be able to use it according to its eligibility rules.'
        }`}
        confirmText={statusTarget?.status === 'active' ? 'Deactivate' : 'Activate'}
        type="warning"
      />
    </div>
  );
}
