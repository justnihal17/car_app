import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, RefreshCw, Crown, CreditCard, 
  Clock, CheckCircle2, XCircle, Edit2, Trash2, Eye, 
  Layers, Tag, Award, AlertCircle, Calendar, ShieldCheck, Wrench
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { SubscriptionPlan, SubscriptionFilterState } from './types/subscription.types';
import { SubscriptionForm } from './components/SubscriptionForm';
import { SubscriptionDetailsModal } from './components/SubscriptionDetailsModal';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';

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
      const endpoints = [
        '/admin/subscriptions/service-tree',
        '/admin/subscriptions/services-tree',
        '/master/service/admin',
        '/master/service'
      ];
      for (const ep of endpoints) {
        try {
          const res = await api.get(ep);
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
            break;
          }
        } catch (e) {}
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
    <div className="flex-1 p-4 lg:p-6 2xl:p-content space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
            Subscription
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPlans}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl shadow-xs transition-all active:scale-95"
            title="Refresh Plans"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-600' : ''}`} />
          </button>

          <button
            onClick={() => {
              setEditingPlan(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs lg:text-sm font-bold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Create Plan
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Packages</span>
            <p className="text-2xl font-black text-slate-900">{metrics.total}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 text-slate-600">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Plans</span>
            <p className="text-2xl font-black text-emerald-600">{metrics.active}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Price</span>
            <p className="text-2xl font-black text-slate-900">AED {metrics.avgPrice.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-red-50 text-red-600">
            <Tag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search plans by name or highlight..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs lg:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs lg:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>

          {/* Frequency Filter */}
          <div>
            <select
              value={filters.frequency}
              onChange={(e) => setFilters(prev => ({ ...prev, frequency: e.target.value as any }))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs lg:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            >
              <option value="ALL">All Frequencies</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
              <option value="WEEKLY">Weekly</option>
              <option value="ONE_TIME">One Time</option>
            </select>
          </div>

          {/* Duration Unit Filter */}
          <div>
            <select
              value={filters.durationUnit}
              onChange={(e) => setFilters(prev => ({ ...prev, durationUnit: e.target.value as any }))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs lg:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            >
              <option value="ALL">All Duration Units</option>
              <option value="MONTH">Months</option>
              <option value="YEAR">Years</option>
              <option value="WEEK">Weeks</option>
              <option value="DAY">Days</option>
            </select>
          </div>

        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded-md w-1/2"></div>
              <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
              <div className="space-y-2 pt-2">
                <div className="h-3 bg-slate-100 rounded-md w-full"></div>
                <div className="h-3 bg-slate-100 rounded-md w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {!loading && error && (
        <div className="p-8 border border-red-200 bg-red-50/50 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm font-bold text-slate-900">{error}</p>
          <button
            onClick={fetchPlans}
            className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredPlans.length === 0 && (
        <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-white text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100 shadow-inner">
            <Crown className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Subscription Plans Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Create First Plan
          </button>
        </div>
      )}

      {/* Subscription Plans Grid */}
      {!loading && !error && filteredPlans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlans.map(plan => {
            const planId = plan._id || plan.id;
            const isActive = plan.isActive !== false;
            const descriptions = Array.isArray(plan.description)
              ? plan.description
              : typeof plan.description === 'string'
              ? (plan.description as string).split('\n').filter(Boolean)
              : [];
            const applicableCount = plan.applicableServices?.length || 0;

            return (
              <div
                key={planId}
                className={`rounded-2xl border transition-all duration-200 bg-white flex flex-col justify-between overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 ${
                  isActive ? 'border-slate-200/90' : 'border-slate-200 bg-slate-50/40 opacity-80'
                }`}
              >
                {/* Plan Card Top Header */}
                <div className="p-5.5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight group-hover:text-red-600 transition-colors">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {plan.duration} {plan.durationUnit?.toLowerCase()} • {plan.frequency || 'Monthly'}
                      </p>
                    </div>

                    {/* Active Status Badge */}
                    <button
                      type="button"
                      disabled={statusUpdatingId === planId}
                      onClick={() => handleToggleStatus(plan)}
                      className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                      title="Click to toggle status"
                    >
                      {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {statusUpdatingId === planId ? 'Updating...' : isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  {/* Pricing and Credits Bar */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
                      <span className="text-xl font-black text-slate-900">AED {plan.price?.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Credits</span>
                      <span className="text-sm font-extrabold text-slate-800">{plan.totalCredits} Services</span>
                    </div>
                  </div>

                  {/* Highlights Summary */}
                  {descriptions.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {descriptions.slice(0, 3).map((desc, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                          <span className="truncate">{desc}</span>
                        </div>
                      ))}
                      {descriptions.length > 3 && (
                        <p className="text-[11px] text-slate-400 font-semibold pl-3.5">
                          +{descriptions.length - 3} more highlights
                        </p>
                      )}
                    </div>
                  )}

                  {/* Badges Bar (Covered Services Names & Perks) */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    {plan.applicableServices && plan.applicableServices.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {plan.applicableServices.map((item, idx) => {
                          const sName = getServiceName(item.serviceId, serviceNamesMap);
                          const subCount = item.subServiceIds?.length || 0;
                          return (
                            <span 
                              key={idx} 
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/80 shadow-2xs"
                              title={sName || 'Covered Service'}
                            >
                              <Wrench className="w-3 h-3 text-red-500 shrink-0" />
                              <span className="truncate max-w-[170px]">{sName || `${applicableCount} Covered Service`}</span>
                              {subCount > 0 && (
                                <span className="text-[10px] bg-white px-1.5 py-0.5 rounded-md text-slate-500 font-bold border border-slate-200 shrink-0">
                                  {subCount} sub
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5">
                      {plan.priorityBooking && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700">
                          <Award className="w-3 h-3 text-red-500" />
                          Priority
                        </span>
                      )}

                      {Boolean(plan.additionalServiceDiscount) && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                          <Tag className="w-3 h-3 text-emerald-600" />
                          {plan.additionalServiceDiscount}% Off
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 border-t border-slate-100">
                  <button
                    onClick={() => setViewingPlan(plan)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingPlan(plan);
                        setIsFormOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit Plan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeletingPlan(plan)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Plan Modal */}
      {isFormOpen && (
        <SubscriptionForm
          plan={editingPlan}
          onClose={() => {
            setIsFormOpen(false);
            setEditingPlan(null);
          }}
          onSuccess={fetchPlans}
        />
      )}

      {/* View Plan Details Modal */}
      {viewingPlan && (
        <SubscriptionDetailsModal
          plan={viewingPlan}
          onClose={() => setViewingPlan(null)}
          onEdit={(planToEdit) => {
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
