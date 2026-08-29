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
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs mb-3.5 space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {/* Search by Title */}
        <div className="relative group flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 group-focus-within:text-slate-600 transition-colors pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search by Title Name..."
            className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-900 font-normal placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all shadow-2xs h-8 leading-normal"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-3 h-3" />
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
          className="w-full bg-white border-slate-200 hover:border-slate-300 rounded-lg text-xs"
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
          className="w-full bg-white border-slate-200 hover:border-slate-300 rounded-lg text-xs"
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
          className="w-full bg-white border-slate-200 hover:border-slate-300 rounded-lg text-xs"
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
          className="w-full bg-white border-slate-200 hover:border-slate-300 rounded-lg text-xs"
        />
      </div>

      {/* Buttons toolbar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="text-slate-500 font-normal">
          {isFiltered ? (
            <span className="text-red-600 font-medium">Active filters applied</span>
          ) : (
            <span>Showing all promotional campaigns</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-red-600 font-medium transition-colors cursor-pointer text-xs"
            >
              <X className="w-3 h-3" /> Clear Filters
            </button>
          )}
          <button
            onClick={() => onFilterChange({ ...filters, dateFilter: filters.dateFilter === 'deleted' ? 'ALL' : 'deleted' })}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer border shadow-2xs text-xs ${
              filters.dateFilter === 'deleted' 
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {filters.dateFilter === 'deleted' ? <RotateCcw className="w-3 h-3" /> : <Trash2 className="w-3 h-3 text-slate-400" />}
            {filters.dateFilter === 'deleted' ? 'Back to Offers' : 'Trash'}
          </button>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 font-medium bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-xs"
          >
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
