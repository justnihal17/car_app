import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, RefreshCw, Crown, CreditCard, 
  Clock, CheckCircle2, XCircle, Edit2, Trash2, Eye, 
  Layers, Tag, Award, AlertCircle, Calendar, ShieldCheck, Wrench, ChevronRight,
  LayoutGrid, Table, MoreHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { SubscriptionPlan, SubscriptionFilterState } from './types/subscription.types';
import { SubscriptionForm } from './components/SubscriptionForm';
import { SubscriptionDetailsModal } from './components/SubscriptionDetailsModal';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';
import { CustomSelect } from '../common/CustomSelect';

const getServiceName = (serviceVal: any, serviceNamesMap: Record<string, string>): string => {
  if (!serviceVal) return '';
  if (typeof serviceVal === 'object') {
    return serviceVal.name || serviceVal.title || serviceVal.serviceName || serviceNamesMap[serviceVal._id] || '';
  }
  const idStr = String(serviceVal);
  return serviceNamesMap[idStr] || '';
};

export function SubscriptionManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [serviceNamesMap, setServiceNamesMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close action menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest('.action-menu-container')) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter State
  const [filters, setFilters] = useState<SubscriptionFilterState>({
    search: '',
    status: 'ALL',
    frequency: 'ALL',
    durationUnit: 'ALL',
  });

  // Modal / Drawer States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [viewingPlan, setViewingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const fetchServicesMap = async () => {
    try {
      let res;
      try {
        res = await api.get('/admin/subscriptions/services-tree');
      } catch {
        res = await api.get('/master/service/admin');
      }
      const raw = res.data?.data || res.data || [];
      const list: any[] = Array.isArray(raw) ? raw : (raw.services || raw.list || raw.tree || []);
      if (Array.isArray(list) && list.length > 0) {
        const map: Record<string, string> = {};
        list.forEach((s: any) => {
          const id = String(s._id || s.id || '');
          const name = s.name || s.title || s.serviceName || '';
          if (id && name) map[id] = name;
        });
        setServiceNamesMap(map);
      }
    } catch (e) {}
  };

  // Fetch all subscription plans
  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      try {
        res = await api.get('/admin/subscriptions');
      } catch (err: any) {
        if (err.response?.status === 404) {
          res = await api.get('/admin/subscription');
        } else {
          throw err;
        }
      }

      const responsePayload = res.data;
      const rawData = responsePayload?.data !== undefined ? responsePayload.data : responsePayload;
      
      let list: SubscriptionPlan[] = [];
      if (Array.isArray(rawData)) {
        list = rawData;
      } else if (rawData && typeof rawData === 'object') {
        if (Array.isArray(rawData.docs)) {
          list = rawData.docs;
        } else if (Array.isArray(rawData.plans)) {
          list = rawData.plans;
        } else if (Array.isArray(rawData.subscriptions)) {
          list = rawData.subscriptions;
        } else if (Array.isArray(rawData.list)) {
          list = rawData.list;
        } else if (Array.isArray(rawData.data)) {
          list = rawData.data;
        }
      }

      setPlans(list);
    } catch (err: any) {
      console.error('Failed to fetch subscription plans:', err);
      setError(err.response?.data?.message || 'Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchServicesMap();
  }, []);

  // Toggle Active/Inactive status via PATCH /admin/subscriptions/:id/status
  const handleToggleStatus = async (plan: SubscriptionPlan) => {
    const planId = plan._id || plan.id;
    if (!planId) return;

    const newStatus = !(plan.isActive !== false);
    setStatusUpdatingId(planId);

    try {
      try {
        await api.patch(`/admin/subscriptions/${planId}/status`, { isActive: newStatus });
      } catch (err: any) {
        if (err.response?.status === 404) {
          await api.patch(`/admin/subscription/${planId}/status`, { isActive: newStatus });
        } else {
          throw err;
        }
      }

      toast.success(`Plan ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      // Update local state
      setPlans(prev => prev.map(p => {
        if ((p._id || p.id) === planId) {
          return { ...p, isActive: newStatus };
        }
        return p;
      }));
    } catch (err: any) {
      console.error('Status update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update plan status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Delete Subscription Plan via DELETE /admin/subscriptions/:id
  const handleDeletePlan = async () => {
    if (!deletingPlan) return;
    const planId = deletingPlan._id || deletingPlan.id;
    if (!planId) return;

    try {
      try {
        await api.delete(`/admin/subscriptions/${planId}`);
      } catch (err: any) {
        if (err.response?.status === 404) {
          await api.delete(`/admin/subscription/${planId}`);
        } else {
          throw err;
        }
      }

      toast.success('Subscription plan deleted successfully!');
      setPlans(prev => prev.filter(p => (p._id || p.id) !== planId));
      setDeletingPlan(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete subscription plan');
    }
  };

  // Filtered Plans list
  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      // Search filter
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const nameMatch = (plan.name || '').toLowerCase().includes(query);
        const descMatch = Array.isArray(plan.description)
          ? plan.description.some(d => d.toLowerCase().includes(query))
          : typeof plan.description === 'string'
          ? (plan.description as string).toLowerCase().includes(query)
          : false;
        if (!nameMatch && !descMatch) return false;
      }

      // Status filter
      if (filters.status !== 'ALL') {
        const isActive = plan.isActive !== false;
        if (filters.status === 'ACTIVE' && !isActive) return false;
        if (filters.status === 'INACTIVE' && isActive) return false;
      }

      // Frequency filter
      if (filters.frequency !== 'ALL') {
        if ((plan.frequency || '').toUpperCase() !== filters.frequency) return false;
      }

      // Duration unit filter
      if (filters.durationUnit !== 'ALL') {
        if ((plan.durationUnit || '').toUpperCase() !== filters.durationUnit) return false;
      }

      return true;
    });
  }, [plans, filters]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = plans.length;
    const active = plans.filter(p => p.isActive !== false).length;
    const avgPrice = total > 0 
      ? Math.round(plans.reduce((acc, p) => acc + (p.price || 0), 0) / total) 
      : 0;
    return { total, active, avgPrice };
  }, [plans]);

  return (
    <div className="p-3.5 sm:p-4 lg:p-5 space-y-3.5 sm:space-y-4 w-full bg-slate-50/60 min-h-screen animate-in fade-in duration-200">
      {isFormOpen ? (
        <SubscriptionForm
          plan={editingPlan}
          onClose={() => {
            setIsFormOpen(false);
            setEditingPlan(null);
          }}
          onSuccess={fetchPlans}
        />
      ) : (
        <>
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          <button 
            type="button"
            className="cursor-pointer hover:text-red-600 transition-colors font-medium uppercase tracking-wider"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate_view', { detail: 'dashboard' }))}
          >
            Dashboard
          </button> 
          <ChevronRight className="w-3 h-3 text-slate-400" /> 
          <span className="text-red-600 font-semibold">
            Subscription
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPlans}
            disabled={loading}
            className="p-1.5 bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer h-8 w-8 flex items-center justify-center"
            title="Refresh Plans"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : ''}`} />
          </button>

          <button
            onClick={() => {
              setEditingPlan(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-semibold rounded-lg shadow-xs transition-all active:scale-95 text-xs cursor-pointer h-8"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2]" /> Create Plan
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-3.5 w-full">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl transition-all duration-200 flex flex-col justify-between group cursor-pointer hover:-translate-y-0.5 min-h-[88px] sm:min-h-[92px] border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10.5px] font-semibold tracking-wider transition-colors uppercase leading-none text-slate-500 group-hover:text-slate-800">Total Packages</span>
            <div className="p-1.5 rounded-lg border text-slate-600 bg-[#F8FAFC] border-slate-200 shadow-2xs">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>
          <div className="flex items-baseline justify-between w-full mt-3">
            <span className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight leading-none">{metrics.total}</span>
            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Packages</span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl transition-all duration-200 flex flex-col justify-between group cursor-pointer hover:-translate-y-0.5 min-h-[88px] sm:min-h-[92px] border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10.5px] font-semibold tracking-wider transition-colors uppercase leading-none text-slate-500 group-hover:text-slate-800">Active Plans</span>
            <div className="p-1.5 rounded-lg border text-slate-600 bg-[#F8FAFC] border-slate-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between w-full mt-3">
            <span className="text-xl sm:text-2xl font-semibold text-emerald-600 tracking-tight leading-none">{metrics.active}</span>
            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Active</span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl transition-all duration-200 flex flex-col justify-between group cursor-pointer hover:-translate-y-0.5 min-h-[88px] sm:min-h-[92px] border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10.5px] font-semibold tracking-wider transition-colors uppercase leading-none text-slate-500 group-hover:text-slate-800">Average Price</span>
            <div className="p-1.5 rounded-lg border text-slate-600 bg-[#F8FAFC] border-slate-200 shadow-2xs">
              <Tag className="w-3.5 h-3.5 text-red-500" />
            </div>
          </div>
          <div className="flex items-baseline justify-between w-full mt-3">
            <span className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight leading-none">AED {metrics.avgPrice.toLocaleString()}</span>
            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Average</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs mb-3.5 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Search Box */}
          <div className="relative group flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search plans by name..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-normal text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all shadow-2xs h-8"
            />
          </div>

          {/* Status Filter */}
          <CustomSelect
            value={filters.status}
            onChange={(val) => setFilters(prev => ({ ...prev, status: val as any }))}
            options={[
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Active Only', value: 'ACTIVE' },
              { label: 'Inactive Only', value: 'INACTIVE' },
            ]}
            placeholder="Status"
            className="w-full"
          />

          {/* Frequency Filter */}
          <CustomSelect
            value={filters.frequency}
            onChange={(val) => setFilters(prev => ({ ...prev, frequency: val as any }))}
            options={[
              { label: 'All Frequencies', value: 'ALL' },
              { label: 'Monthly', value: 'MONTHLY' },
              { label: 'Yearly', value: 'YEARLY' },
              { label: 'Weekly', value: 'WEEKLY' },
              { label: 'One Time', value: 'ONE_TIME' },
            ]}
            placeholder="Frequency"
            className="w-full"
          />

          {/* Duration Unit Filter */}
          <CustomSelect
            value={filters.durationUnit}
            onChange={(val) => setFilters(prev => ({ ...prev, durationUnit: val as any }))}
            options={[
              { label: 'All Duration Units', value: 'ALL' },
              { label: 'Months', value: 'MONTH' },
              { label: 'Years', value: 'YEAR' },
              { label: 'Weeks', value: 'WEEK' },
              { label: 'Days', value: 'DAY' },
            ]}
            placeholder="Duration Unit"
            className="w-full"
          />
        </div>

        {/* View Mode & Result Count Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100/90 text-xs">
          <span className="text-slate-500 font-normal text-xs">
            Showing <span className="font-semibold text-slate-800">{filteredPlans.length}</span> {filteredPlans.length === 1 ? 'plan' : 'plans'}
          </span>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle Switch */}
            <div className="bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/80 flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Table View"
              >
                <Table className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-3.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3.5 bg-slate-100 rounded w-1/2"></div>
              <div className="h-8 bg-slate-100 rounded-lg w-full"></div>
              <div className="space-y-1.5 pt-1">
                <div className="h-2.5 bg-slate-100 rounded w-full"></div>
                <div className="h-2.5 bg-slate-100 rounded w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {!loading && error && (
        <div className="p-6 border border-red-200 bg-red-50/50 rounded-xl text-center space-y-2">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
          <p className="text-xs font-semibold text-slate-800">{error}</p>
          <button
            onClick={fetchPlans}
            className="px-3.5 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg shadow-2xs cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredPlans.length === 0 && (
        <div className="p-8 border border-dashed border-slate-200 rounded-2xl bg-white text-center space-y-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100 shadow-inner">
            <Crown className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-slate-800">No Subscription Plans Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {filters.search || filters.status !== 'ALL'
                ? 'No subscription plans match your active filter criteria.'
                : 'Get started by creating your first subscription package for customers.'}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingPlan(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Create First Plan
          </button>
        </div>
      )}

      {/* Subscription Plans List: Card Grid View */}
      {!loading && !error && filteredPlans.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-3.5">
          {filteredPlans.map(plan => {
            const planId = plan._id || plan.id;
            const isActive = plan.isActive !== false;
            const applicableCount = plan.applicableServices?.length || 0;

            return (
              <div
                key={planId}
                className={`rounded-xl border transition-all duration-200 bg-white flex flex-col justify-between overflow-hidden group hover:shadow-xs hover:border-slate-300 shadow-2xs ${
                  isActive ? 'border-slate-200/90' : 'border-slate-200 bg-slate-50/40 opacity-80'
                }`}
              >
                {/* Plan Card Top Header */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[14px] font-semibold text-red-600 tracking-tight group-hover:text-red-700 transition-colors">
                      {plan.name}
                    </h3>

                    {/* Active Status Badge */}
                    <button
                      type="button"
                      disabled={statusUpdatingId === planId}
                      onClick={() => handleToggleStatus(plan)}
                      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200/60 hover:bg-slate-200'
                      }`}
                      title="Click to toggle status"
                    >
                      {statusUpdatingId === planId ? 'Updating...' : isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  {/* Pricing and Credits Bar */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100/90 flex items-center justify-between">
                    <div>
                      <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider block">Price</span>
                      <span className="text-base font-semibold text-slate-900">AED {plan.price?.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider block">Credits</span>
                      <span className="text-xs font-semibold text-slate-800">{plan.totalCredits} Services</span>
                    </div>
                  </div>

                  {/* Badges Bar (Covered Services Names & Perks) */}
                  <div className="space-y-1.5 pt-0.5">
                    {plan.applicableServices && plan.applicableServices.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        {plan.applicableServices.map((item, idx) => {
                          const sName = getServiceName(item.serviceId, serviceNamesMap);
                          const subCount = item.subServiceIds?.length || 0;
                          return (
                            <span 
                              key={idx} 
                              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs"
                              title={sName || 'Covered Service'}
                            >
                              <Wrench className="w-3 h-3 text-red-500 shrink-0" />
                              <span className="truncate max-w-[150px]">{sName || `${applicableCount} Covered Service`}</span>
                              {subCount > 0 && (
                                <span className="text-[9px] bg-white px-1 py-0.2 rounded text-slate-500 font-medium border border-slate-200 shrink-0">
                                  {subCount} sub
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-1">
                      {plan.priorityBooking && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-100">
                          <Award className="w-3 h-3 text-red-500" />
                          Priority
                        </span>
                      )}

                      {Boolean(plan.additionalServiceDiscount) && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <Tag className="w-3 h-3 text-emerald-600" />
                          {plan.additionalServiceDiscount}% Off
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/60 border-t border-slate-100">
                  <button
                    onClick={() => setViewingPlan(plan)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingPlan(plan);
                        setIsFormOpen(true);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Plan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeletingPlan(plan)}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Subscription Plans List: Table / Row View */}
      {!loading && !error && filteredPlans.length > 0 && viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4 pl-5">Plan Name</th>
                  <th className="py-2.5 px-4">Price</th>
                  <th className="py-2.5 px-4">Credits</th>
                  <th className="py-2.5 px-4">Duration & Frequency</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPlans.map((plan, index) => {
                  const planId = plan._id || plan.id;
                  const isActive = plan.isActive !== false;
                  return (
                    <tr key={planId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 pl-5">
                        <span className="font-semibold text-red-600 text-[13px] block">{plan.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 text-[13px]">AED {plan.price?.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 text-[13px]">{plan.totalCredits}</span> <span className="text-slate-400">Services</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-700 font-medium">{plan.duration} {plan.durationUnit?.toLowerCase()}</span>
                        <span className="text-[10.5px] text-slate-400 block font-normal">{plan.frequency || 'Monthly'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          disabled={statusUpdatingId === planId}
                          onClick={() => handleToggleStatus(plan)}
                          className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200/60 hover:bg-slate-200'
                          }`}
                        >
                          {statusUpdatingId === planId ? 'Updating...' : isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-2.5 px-4 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end relative action-menu-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === planId ? null : planId);
                            }}
                            className="w-7.5 h-7.5 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {activeMenuId === planId && (
                            <div className={`absolute right-0 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-[99] animate-in fade-in zoom-in-95 duration-100 text-left ${index >= Math.max(0, filteredPlans.length - 2) ? 'bottom-full mb-1 origin-bottom-right' : 'top-8 origin-top-right'}`}>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); setViewingPlan(plan); }} 
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" /> View Details
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); setEditingPlan(plan); setIsFormOpen(true); }} 
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-500" /> Edit
                              </button>
                              <div className="border-t border-slate-100 my-0.5"></div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); setDeletingPlan(plan); }} 
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

        </>
      )}

      {/* View Plan Details Modal */}
      {viewingPlan && (
        <SubscriptionDetailsModal
          plan={viewingPlan}
          onClose={() => setViewingPlan(null)}
          onEdit={(planToEdit) => {
            setViewingPlan(null);
            setEditingPlan(planToEdit);
            setIsFormOpen(true);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingPlan && (
        <DeleteConfirmationModal
          isOpen={true}
          name={deletingPlan.name}
          title="Delete Subscription Plan?"
          description="Are you sure you want to delete this subscription plan? Existing active subscribers will not be affected, but new customers won't be able to purchase it."
          onCancel={() => setDeletingPlan(null)}
          onConfirm={handleDeletePlan}
        />
      )}

    </div>
  );
}
export default SubscriptionManagement;
