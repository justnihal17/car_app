import React from 'react';
import { Search, RotateCcw, X } from 'lucide-react';
import { PromotionFilterState } from '../types/promotion.types';
import { CustomSelect } from '../../common/CustomSelect';

interface PromotionsFiltersProps {
  filters: PromotionFilterState;
  onFilterChange: (filters: PromotionFilterState) => void;
  onRefresh: () => void;
}

export function PromotionsFilters({ filters, onFilterChange, onRefresh }: PromotionsFiltersProps) {
  const isFiltered = filters.search || filters.promoType !== 'all' || filters.status !== 'all' || filters.discountType !== 'all' || filters.dateFilter !== 'all';

  const clearFilters = () => {
    onFilterChange({
      search: '',
      promoType: 'all',
      status: 'all',
      discountType: 'all',
      dateFilter: 'all',
    });
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs mb-6 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search by title or code..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
        </div>

        {/* Promo Type Dropdown */}
        <CustomSelect
          value={filters.promoType}
          onChange={(val) => onFilterChange({ ...filters, promoType: val })}
          options={[
            { label: 'All Types', value: 'all' },
            { label: 'Coupon', value: 'coupon' },
            { label: 'Automatic', value: 'automatic' },
            { label: 'Referral', value: 'referral' },
            { label: 'Cashback', value: 'cashback' },
          ]}
          placeholder="Promo Type"
          className="w-full bg-slate-50"
        />

        {/* Status Dropdown */}
        <CustomSelect
          value={filters.status}
          onChange={(val) => onFilterChange({ ...filters, status: val })}
          options={[
            { label: 'All Status', value: 'all' },
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ]}
          placeholder="Status"
          className="w-full bg-slate-50"
        />

        {/* Discount Type Dropdown */}
        <CustomSelect
          value={filters.discountType}
          onChange={(val) => onFilterChange({ ...filters, discountType: val })}
          options={[
            { label: 'All Discounts', value: 'all' },
            { label: 'Flat', value: 'flat' },
            { label: 'Percentage', value: 'percentage' },
            { label: 'Free Service', value: 'free_service' },
          ]}
          placeholder="Discount Type"
          className="w-full bg-slate-50"
        />

        {/* Date Filter Dropdown */}
        <CustomSelect
          value={filters.dateFilter}
          onChange={(val) => onFilterChange({ ...filters, dateFilter: val })}
          options={[
            { label: 'All Time', value: 'all' },
            { label: 'Currently Running', value: 'running' },
            { label: 'Upcoming', value: 'upcoming' },
            { label: 'Expired', value: 'expired' },
          ]}
          placeholder="Date Filter"
          className="w-full bg-slate-50"
        />
      </div>

      {/* Buttons toolbar */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
        <div className="text-slate-500 font-medium">
          {isFiltered ? (
            <span className="text-red-600 font-semibold">Active filters applied</span>
          ) : (
            <span>Showing all promotional campaigns</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-red-600 font-semibold transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
