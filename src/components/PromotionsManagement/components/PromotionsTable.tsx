import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Copy, Power, Trash2, MoreHorizontal, Zap, RotateCcw } from 'lucide-react';
import { Promotion } from '../types/promotion.types';
import { PromoTypeBadge, PromotionStatusBadge, DiscountBadge, PriorityBadge } from './PromotionBadges';

interface PromotionsTableProps {
  promotions: Promotion[];
  loading?: boolean;
  onView: (promo: Promotion) => void;
  onEdit: (promo: Promotion) => void;
  onDuplicate: (promo: Promotion) => void;
  onToggleStatus: (promo: Promotion) => void;
  onDelete: (promo: Promotion) => void;
  onRestore?: (promo: Promotion) => void;
}

export function PromotionsTable({
  promotions,
  loading,
  onView,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onDelete,
  onRestore,
}: PromotionsTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenuId && !(event.target as HTMLElement).closest('.action-menu-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-slate-200 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-3 bg-slate-200 rounded w-1/3" />
            </div>
            <div className="w-20 h-6 bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3 shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center font-bold text-xl">
          🏷️
        </div>
        <h3 className="text-base font-bold text-slate-800">No Promotions Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No promotions match your search and filter criteria. Try adjusting your filters or create a new promotion.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-visible">
      <div className={`overflow-visible ${activeMenuId ? 'pb-32' : ''}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-4">Promotion</th>
              <th className="px-4 py-4">Promo Code</th>
              <th className="px-4 py-4">Discount</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {promotions.map((promo, index) => {
              const usageLimitText = promo.usageLimit ? promo.usageLimit.toString() : 'Unlimited';
              const usagePercent = promo.usageLimit ? Math.min(100, Math.round((promo.usedCount / promo.usageLimit) * 100)) : 0;
              const rowId = promo.id || (promo as any)._id || index;

              return (
                <tr key={rowId} className="hover:bg-slate-50/70 transition-colors group">
                  {/* Title & Description */}
                  <td className="px-5 py-4 max-w-xs">
                    <div className="font-bold text-slate-900 leading-snug truncate">{promo.title}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{promo.description}</div>
                  </td>

                  {/* Promo Code */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {promo.promoType === 'AUTOMATIC' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        <Zap className="w-3 h-3 text-purple-600" /> Auto Applied
                      </span>
                    ) : promo.code ? (
                      <span className="font-mono font-extrabold px-2.5 py-1 bg-slate-100 text-slate-900 border border-slate-300 rounded-md text-xs tracking-wider">
                        {promo.code}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">-</span>
                    )}
                  </td>

                  {/* Discount */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <DiscountBadge
                      discountType={promo.discountType}
                      discountValue={promo.discountValue}
                      walletCashback={promo.walletCashback}
                      referralReward={promo.referralReward}
                    />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {promo.isDeleted ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        Deleted
                      </span>
                    ) : (
                      <PromotionStatusBadge status={promo.status} endDate={promo.endDate} />
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end relative action-menu-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === rowId ? null : rowId);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>

                      {activeMenuId === rowId && (
                        <div className={`absolute right-0 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-99 animate-in fade-in zoom-in-95 duration-100 text-left ${index >= Math.max(0, promotions.length - 3) ? 'bottom-full mb-1 origin-bottom-right' : 'top-10 origin-top-right'}`}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onView(promo); }} 
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Eye className="w-4 h-4 text-slate-500" /> View Details
                          </button>
                          
                          {promo.isDeleted ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onRestore?.(promo); }} 
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" /> Restore
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onEdit(promo); }} 
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-slate-500" /> Edit
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onToggleStatus(promo); }} 
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <Power className="w-4 h-4 text-slate-500" /> {promo.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              </button>
                              <div className="border-t border-slate-100 my-1"></div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onDelete(promo); }} 
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </>
                          )}
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
  );
}
