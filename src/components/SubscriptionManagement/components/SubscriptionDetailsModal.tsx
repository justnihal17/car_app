import React from 'react';
import { 
  X, Crown, Check, Clock, Calendar, CreditCard, Tag, 
  ShieldCheck, Layers, Award, CheckCircle2, XCircle, ArrowRight, Wrench
} from 'lucide-react';
import { SubscriptionPlan } from '../types/subscription.types';

interface SubscriptionDetailsModalProps {
  plan: SubscriptionPlan;
  onClose: () => void;
  onEdit?: (plan: SubscriptionPlan) => void;
}

const getServiceName = (serviceVal: any): string => {
  if (!serviceVal) return 'Service';
  if (typeof serviceVal === 'string') return serviceVal;
  if (typeof serviceVal === 'object') {
    return serviceVal.name || serviceVal.title || serviceVal.serviceName || serviceVal._id || 'Service';
  }
  return String(serviceVal);
};

const getSubServiceName = (subVal: any): string => {
  if (!subVal) return 'Sub-Service';
  if (typeof subVal === 'string') return subVal;
  if (typeof subVal === 'object') {
    return subVal.name || subVal.title || subVal.subServiceName || subVal._id || 'Sub-Service';
  }
  return String(subVal);
};

export function SubscriptionDetailsModal({ plan, onClose, onEdit }: SubscriptionDetailsModalProps) {
  // Lock body scroll when modal is mounted
  React.useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const descriptions = Array.isArray(plan.description) 
    ? plan.description 
    : typeof plan.description === 'string' 
    ? (plan.description as string).split('\n').filter(Boolean) 
    : [];

  const benefits = Array.isArray(plan.benefits) ? plan.benefits : [];

  const applicableServices = plan.applicableServices || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-inner shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{plan.name}</h3>
                <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  plan.isActive !== false 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {plan.isActive !== false ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {plan.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {plan.frequency || 'Monthly'} Plan • {plan.duration} {plan.durationUnit?.toLowerCase() || 'months'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Key Metric Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
              <span className="text-lg font-extrabold text-slate-900 mt-1 block">AED {plan.price?.toLocaleString()}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Credits</span>
              <span className="text-lg font-extrabold text-slate-900 mt-1 block">{plan.totalCredits} Credits</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
              <span className="text-lg font-extrabold text-slate-900 mt-1 block">{plan.duration} {plan.durationUnit?.toLowerCase()}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Discount</span>
              <span className="text-lg font-extrabold text-emerald-600 mt-1 block">{plan.additionalServiceDiscount || 0}% Off</span>
            </div>
          </div>

          {/* Priority & Perks */}
          <div className="flex flex-wrap gap-2.5">
            {plan.priorityBooking && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold border border-red-100">
                <Award className="w-3.5 h-3.5" />
                Priority Booking Enabled
              </span>
            )}
            {plan.additionalServiceDiscount ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                <Tag className="w-3.5 h-3.5" />
                {plan.additionalServiceDiscount}% Discount on Extra Services
              </span>
            ) : null}
          </div>

          {/* Applicable Services Coverage */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              Covered Applicable Services ({applicableServices.length})
            </h4>

            {applicableServices.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No specific services defined for this plan.</p>
            ) : (
              <div className="space-y-2.5">
                {applicableServices.map((item, idx) => {
                  const serviceTitle = getServiceName(item.serviceId);
                  const subList = Array.isArray(item.subServiceIds) ? item.subServiceIds : [];

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                          <Wrench className="w-4 h-4 text-red-500" />
                          <span>{serviceTitle}</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-600 shadow-2xs">
                          {subList.length > 0 
                            ? `${subList.length} Sub-Service${subList.length > 1 ? 's' : ''}` 
                            : 'Full Service Covered'}
                        </span>
                      </div>

                      {subList.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1.5">
                          {subList.map((sub, sIdx) => {
                            const subName = getSubServiceName(sub);
                            const priceVal = typeof sub === 'object' ? sub?.price : undefined;

                            return (
                              <span
                                key={sIdx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{subName}</span>
                                {priceVal !== undefined && priceVal !== null && (
                                  <span className="text-[10px] text-slate-400 font-bold ml-1">AED {priceVal}</span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Plan Highlights */}
          {descriptions.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Plan Highlights</h4>
              <div className="space-y-1.5">
                {descriptions.map((desc, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                    <span>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member Benefits */}
          {benefits.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Member Benefits</h4>
              <div className="space-y-1.5">
                {benefits.map((b, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit(plan);
              }}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              Edit Plan
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
