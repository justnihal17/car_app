import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../api/axios';
import { ApplicableService, ServiceTreeNode, ServiceTreeSubService } from '../types/subscription.types';
import { Search, ChevronDown, ChevronRight, Check, AlertCircle, RefreshCw, Layers, Wrench, Crown } from 'lucide-react';

interface ApplicableServicesTreeProps {
  value: ApplicableService[];
  onChange: (updated: ApplicableService[]) => void;
  error?: string;
}

// Global in-memory cache for the service tree response during session
let cachedServiceTree: ServiceTreeNode[] | null = null;

const extractMongoId = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') {
    if (val === '[object Object]') return '';
    return val.trim();
  }
  if (typeof val === 'object') {
    return String(val._id || val.id || val.$oid || '');
  }
  return String(val);
};

export function ApplicableServicesTree({ value = [], onChange, error }: ApplicableServicesTreeProps) {
  const [services, setServices] = useState<ServiceTreeNode[]>(cachedServiceTree || []);
  const [loading, setLoading] = useState<boolean>(!cachedServiceTree);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedServices, setExpandedServices] = useState<Record<string, boolean>>({});

  const fetchServiceTree = async (forceRefresh = false) => {
    if (cachedServiceTree && !forceRefresh) {
      setServices(cachedServiceTree);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);

    const endpoints = [
      '/admin/subscriptions/service-tree',
      '/admin/subscriptions/services-tree',
      '/admin/subscription/service-tree',
      '/admin/subscription/services-tree',
      '/master/service/admin',
      '/master/service'
    ];

    let success = false;

    for (const ep of endpoints) {
      try {
        const res = await api.get(ep);
        const raw = res.data?.data || res.data || [];
        const list: any[] = Array.isArray(raw) ? raw : (raw.services || raw.list || raw.tree || []);
        
        if (Array.isArray(list) && list.length > 0) {
          const normalized: ServiceTreeNode[] = list.map((s: any) => {
            const sId = extractMongoId(s._id || s.id);
            const sName = s.name || s.title || s.serviceName || 'Untitled Service';
            const rawSub = s.subServices || s.sub_services || s.subservices || [];
            
            const subServices: ServiceTreeSubService[] = Array.isArray(rawSub)
              ? rawSub.map((sub: any) => ({
                  _id: extractMongoId(sub._id || sub.id),
                  id: extractMongoId(sub._id || sub.id),
                  name: sub.name || sub.title || sub.subServiceName || 'Untitled Sub-Service',
                  price: sub.price ?? sub.amount ?? sub.basePrice,
                  duration: sub.duration,
                  description: sub.description,
                  status: sub.status ?? sub.isActive ?? true
                }))
              : [];

            return {
              _id: sId,
              id: sId,
              name: sName,
              title: sName,
              description: s.description,
              category: s.category,
              icon: s.icon,
              image: s.image,
              subServices
            };
          }).filter(s => s._id);

          if (normalized.length > 0) {
            cachedServiceTree = normalized;
            setServices(normalized);
            success = true;
            break;
          }
        }
      } catch (err) {
        // Try next fallback endpoint
      }
    }

    if (!success) {
      setFetchError('Unable to load services. Please try again.');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchServiceTree();
  }, []);

  // Helper to get normalized ID
  const getServiceId = (service: ServiceTreeNode): string => {
    return extractMongoId(service._id || service.id);
  };

  const getSubServiceId = (sub: ServiceTreeSubService): string => {
    return extractMongoId(sub._id || sub.id);
  };

  // Check if a main service or its sub-services are selected
  const getSelectedEntry = (serviceId: string): ApplicableService | undefined => {
    const cleanId = extractMongoId(serviceId);
    return value.find(item => extractMongoId(item.serviceId) === cleanId);
  };

  const isSubServiceSelected = (serviceId: string, subServiceId: string): boolean => {
    const entry = getSelectedEntry(serviceId);
    if (!entry) return false;
    const cleanSubId = extractMongoId(subServiceId);
    return (Array.isArray(entry.subServiceIds) ? entry.subServiceIds : []).some(id => extractMongoId(id) === cleanSubId);
  };

  const isServiceWithoutChildrenSelected = (serviceId: string): boolean => {
    const entry = getSelectedEntry(serviceId);
    return !!entry;
  };

  // Toggle selection for a service WITHOUT sub-services
  const handleToggleServiceWithoutChildren = (serviceId: string) => {
    const cleanId = extractMongoId(serviceId);
    const exists = getSelectedEntry(cleanId);
    if (exists) {
      // Deselect -> Remove completely
      const updated = value.filter(item => extractMongoId(item.serviceId) !== cleanId);
      onChange(updated);
    } else {
      // Select -> Store with empty subServiceIds array
      const updated = [...value.filter(item => extractMongoId(item.serviceId) !== cleanId), { serviceId: cleanId, subServiceIds: [] }];
      onChange(updated);
    }
  };

  // Toggle selection for a specific sub-service
  const handleToggleSubService = (serviceId: string, subServiceId: string) => {
    const cleanServiceId = extractMongoId(serviceId);
    const cleanSubId = extractMongoId(subServiceId);
    const entry = getSelectedEntry(cleanServiceId);
    
    if (!entry) {
      // First sub-service selected for this parent
      const updated = [...value, { serviceId: cleanServiceId, subServiceIds: [cleanSubId] }];
      onChange(updated);
    } else {
      const alreadySelected = entry.subServiceIds.some(id => extractMongoId(id) === cleanSubId);
      let newSubIds: string[];
      
      if (alreadySelected) {
        newSubIds = entry.subServiceIds.filter(id => extractMongoId(id) !== cleanSubId);
      } else {
        newSubIds = [...entry.subServiceIds, cleanSubId];
      }

      if (newSubIds.length === 0) {
        // Last sub-service deselected -> Completely remove the parent entry
        const updated = value.filter(item => extractMongoId(item.serviceId) !== cleanServiceId);
        onChange(updated);
      } else {
        // Update sub-service list for this parent
        const updated = value.map(item => {
          if (extractMongoId(item.serviceId) === cleanServiceId) {
            return { ...item, serviceId: cleanServiceId, subServiceIds: newSubIds };
          }
          return item;
        });
        onChange(updated);
      }
    }
  };

  // Toggle Accordion expansion for a service
  const toggleAccordion = (serviceId: string) => {
    setExpandedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  // Filter services by search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    const query = searchQuery.toLowerCase().trim();

    return services.filter(service => {
      const serviceMatches = (service.name || '').toLowerCase().includes(query);
      const subServiceMatches = (service.subServices || []).some(sub => 
        (sub.name || '').toLowerCase().includes(query)
      );
      return serviceMatches || subServiceMatches;
    });
  }, [services, searchQuery]);

  // If search matches a sub-service, automatically auto-expand its parent
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const newExpanded: Record<string, boolean> = {};
      services.forEach(service => {
        const sId = getServiceId(service);
        const hasMatchingSub = (service.subServices || []).some(sub => 
          (sub.name || '').toLowerCase().includes(query)
        );
        if (hasMatchingSub) {
          newExpanded[sId] = true;
        }
      });
      setExpandedServices(prev => ({ ...prev, ...newExpanded }));
    }
  }, [searchQuery, services]);

  // Calculate total selected count summary
  const totalSelectedCount = useMemo(() => {
    return value.length;
  }, [value]);

  const totalSubServicesSelectedCount = useMemo(() => {
    return value.reduce((sum, item) => sum + (item.subServiceIds?.length || 0), 0);
  }, [value]);

  return (
    <div className="space-y-4">
      {/* Header with Title and Selected Count Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Applicable Services</h4>
            <p className="text-xs text-slate-500">Select services and sub-services covered by this plan</p>
          </div>
        </div>

        {/* Selected Count Indicator */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            totalSelectedCount > 0 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs' 
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}>
            <Crown className="w-3.5 h-3.5" />
            {totalSelectedCount === 0
              ? '0 Services Selected'
              : `${totalSelectedCount} Service${totalSelectedCount > 1 ? 's' : ''} Selected ${
                  totalSubServicesSelectedCount > 0 ? `(${totalSubServicesSelectedCount} Sub-Services)` : ''
                }`}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search services or sub-services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold bg-slate-200/60 rounded-md px-1.5 py-0.5"
          >
            Clear
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-8 border border-slate-100 rounded-2xl bg-slate-50/60 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-8 h-8 border-3 border-slate-200 border-t-red-500 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading service tree hierarchy...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && fetchError && (
        <div className="p-6 border border-red-100 bg-red-50/40 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900">{fetchError}</p>
            <p className="text-xs text-slate-500">Could not retrieve available services from the server.</p>
          </div>
          <button
            type="button"
            onClick={() => fetchServiceTree(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !fetchError && filteredServices.length === 0 && (
        <div className="p-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/40 text-center space-y-2">
          <Wrench className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No Services Found</p>
          <p className="text-xs text-slate-400">
            {searchQuery ? `No services or sub-services match "${searchQuery}"` : 'No services are currently configured in Master Management.'}
          </p>
        </div>
      )}

      {/* Hierarchical Service Tree Container */}
      {!loading && !fetchError && filteredServices.length > 0 && (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredServices.map(service => {
            const sId = getServiceId(service);
            const subServices = service.subServices || [];
            const hasSubServices = subServices.length > 0;
            const entry = getSelectedEntry(sId);
            const selectedSubCount = entry?.subServiceIds?.length || 0;
            const totalSubCount = subServices.length;
            const isExpanded = !!expandedServices[sId];
            const isSelectedNoChildren = isServiceWithoutChildrenSelected(sId);

            if (hasSubServices) {
              // -------------------------------------------------------------
              // CASE A: Service WITH Sub-Services (Parent Accordion + Children)
              // -------------------------------------------------------------
              return (
                <div
                  key={sId}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    selectedSubCount > 0
                      ? 'border-red-200 bg-white shadow-xs'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Parent Service Accordion Header */}
                  <div
                    onClick={() => toggleAccordion(sId)}
                    className="w-full flex items-center justify-between p-3.5 cursor-pointer select-none hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                        aria-label="Toggle Sub-services"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      <div>
                        <span className="text-sm font-bold text-slate-900">{service.name}</span>
                        {service.category && (
                          <span className="ml-2 text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                            {service.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sub-services Selection Counter Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          selectedSubCount > 0
                            ? 'bg-red-50 text-red-700 border-red-200 font-extrabold'
                            : 'bg-slate-50 text-slate-500 border-slate-200/80'
                        }`}
                      >
                        {selectedSubCount} / {totalSubCount} Selected
                      </span>
                    </div>
                  </div>

                  {/* Accordion Content: Child Sub-Services List */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-1.5 border-t border-slate-100 bg-slate-50/50">
                      <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                        Select Sub-Services:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {subServices.map(sub => {
                          const subId = getSubServiceId(sub);
                          const isChecked = isSubServiceSelected(sId, subId);

                          return (
                            <div
                              key={subId}
                              onClick={() => handleToggleSubService(sId, subId)}
                              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                                isChecked
                                  ? 'bg-red-50/50 border-red-500 text-slate-900 shadow-2xs ring-1 ring-red-500/20'
                                  : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all ${
                                  isChecked
                                    ? 'bg-red-600 text-white shadow-2xs'
                                    : 'border border-slate-300 bg-white hover:border-slate-400'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className={`text-xs leading-tight ${isChecked ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                  {sub.name}
                                </p>
                                {sub.price !== undefined && sub.price !== null && (
                                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                                    AED {sub.price}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            } else {
              // -------------------------------------------------------------
              // CASE B: Service WITHOUT Sub-Services (Direct Selectable Row)
              // -------------------------------------------------------------
              return (
                <div
                  key={sId}
                  onClick={() => handleToggleServiceWithoutChildren(sId)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                    isSelectedNoChildren
                      ? 'bg-white border-red-500 text-slate-900 shadow-2xs ring-1 ring-red-500/20'
                      : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                        isSelectedNoChildren
                          ? 'bg-red-600 text-white'
                          : 'border border-slate-300 bg-white hover:border-slate-400'
                      }`}
                    >
                      {isSelectedNoChildren && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <input
                      type="checkbox"
                      checked={isSelectedNoChildren}
                      onChange={() => handleToggleServiceWithoutChildren(sId)}
                      className="sr-only"
                    />

                    <div>
                      <span className="text-sm font-bold text-slate-900">{service.name}</span>
                      {service.category && (
                        <span className="ml-2 text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                          {service.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selected Badge */}
                  <div>
                    {isSelectedNoChildren ? (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        Selected
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 px-2 py-1">
                        Click to select
                      </span>
                    )}
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}

      {/* Validation Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold pt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
