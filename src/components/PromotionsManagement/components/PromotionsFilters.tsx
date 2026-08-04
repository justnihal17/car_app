import React from 'react';
import { Search, RotateCcw, X, Trash2 } from 'lucide-react';
import { PromotionFilterState } from '../types/promotion.types';
import { CustomSelect } from '../../common/CustomSelect';

interface PromotionsFiltersProps {
  filters: PromotionFilterState;
  onFilterChange: (filters: PromotionFilterState) => void;
  onRefresh: () => void;
}

export function PromotionsFilters({ filters, onFilterChange, onRefresh }: PromotionsFiltersProps) {
  const isFiltered = filters.search || filters.promoType !== 'ALL' || filters.status !== 'ALL' || filters.discountType !== 'ALL' || filters.dateFilter !== 'ALL';

  const clearFilters = () => {
    onFilterChange({
      search: '',
      promoType: 'ALL',
      status: 'ALL',
      discountType: 'ALL',
      dateFilter: 'ALL',
    });
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs mb-6 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search by Title */}
        <div className="relative group flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 group-focus-within:text-red-500 transition-colors pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search by Title Name..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all shadow-2xs leading-normal"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Promo Type Dropdown */}
        <CustomSelect
          value={filters.promoType}
          onChange={(val) => onFilterChange({ ...filters, promoType: val })}
          options={[
            { label: 'All Types', value: 'ALL' },
            { label: 'Coupon', value: 'COUPON' },
            { label: 'Automatic', value: 'AUTOMATIC' },
            { label: 'Referral', value: 'REFERRAL' },
            { label: 'Cashback', value: 'CASHBACK' },
          ]}
          placeholder="Promo Type"
          className="w-full bg-slate-50"
        />

        {/* Status Dropdown */}
        <CustomSelect
          value={filters.status}
          onChange={(val) => onFilterChange({ ...filters, status: val })}
          options={[
            { label: 'All Status', value: 'ALL' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Inactive', value: 'INACTIVE' },
          ]}
          placeholder="Status"
          className="w-full bg-slate-50"
        />

        {/* Discount Type Dropdown */}
        <CustomSelect
          value={filters.discountType}
          onChange={(val) => onFilterChange({ ...filters, discountType: val })}
          options={[
            { label: 'All Discounts', value: 'ALL' },
            { label: 'Flat', value: 'FLAT' },
            { label: 'Percentage', value: 'PERCENTAGE' },
            { label: 'Free Service', value: 'FREE_SERVICE' },
          ]}
          placeholder="Discount Type"
          className="w-full bg-slate-50"
        />

        {/* Date Filter Dropdown */}
        <CustomSelect
          value={filters.dateFilter}
          onChange={(val) => onFilterChange({ ...filters, dateFilter: val })}
          options={[
            { label: 'All Time', value: 'ALL' },
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
            onClick={() => onFilterChange({ ...filters, dateFilter: filters.dateFilter === 'deleted' ? 'ALL' : 'deleted' })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer border shadow-sm ${
              filters.dateFilter === 'deleted' 
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {filters.dateFilter === 'deleted' ? <RotateCcw className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5 text-slate-400" />}
            {filters.dateFilter === 'deleted' ? 'Back to Offers' : 'Trash'}
          </button>
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
