import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Power, Trash2, MoreHorizontal, Zap, RotateCcw } from 'lucide-react';
import { Promotion } from '../types/promotion.types';
import { PromotionStatusBadge, DiscountBadge } from './PromotionBadges';

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
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 bg-slate-200 rounded-lg" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 bg-slate-200 rounded w-1/4" />
              <div className="h-2.5 bg-slate-200 rounded w-1/3" />
            </div>
            <div className="w-16 h-5 bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 p-8 text-center space-y-2 shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center font-semibold text-lg">
          🏷️
        </div>
        <h3 className="text-sm font-semibold text-slate-800">No Promotions Found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No promotions match your search and filter criteria. Try adjusting your filters or create a new promotion.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-visible">
      <div className="overflow-visible">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="px-4 py-3 pl-5">Promotion</th>
              <th className="px-4 py-3">Promo Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {promotions.map((promo, index) => {
              const rowId = promo.id || (promo as any)._id || index;

              return (
                <tr 
                  key={rowId} 
                  className="hover:bg-slate-50/70 transition-colors duration-150 group cursor-pointer border-b border-slate-100 last:border-0"
                  onClick={() => onView(promo)}
                >
                  {/* Title & Description */}
                  <td className="px-4 py-2.5 pl-5 max-w-xs">
                    <div className="font-medium text-slate-900 text-[13px] leading-snug truncate">{promo.title}</div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">{promo.description}</div>
                  </td>

                  {/* Promo Code */}
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {promo.promoType === 'AUTOMATIC' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        <Zap className="w-3 h-3 text-purple-600" /> Auto Applied
                      </span>
                    ) : promo.code ? (
                      <span className="font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded text-xs">
                        {promo.code}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-xs">-</span>
                    )}
                  </td>

                  {/* Discount */}
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <DiscountBadge
                      discountType={promo.discountType}
                      discountValue={promo.discountValue}
                      walletCashback={promo.walletCashback}
                      referralReward={promo.referralReward}
                    />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {promo.isDeleted ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        Deleted
                      </span>
                    ) : (
                      <PromotionStatusBadge status={promo.status} endDate={promo.endDate} />
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-2.5 pr-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end relative action-menu-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === rowId ? null : rowId);
                        }}
                        className="w-7.5 h-7.5 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {activeMenuId === rowId && (
                        <div className={`absolute right-0 w-40 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-[99] animate-in fade-in zoom-in-95 duration-100 text-left ${index >= Math.max(0, promotions.length - 3) ? 'bottom-full mb-1 origin-bottom-right' : 'top-8 origin-top-right'}`}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onView(promo); }} 
                            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" /> View Details
                          </button>
                          
                          {promo.isDeleted ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onRestore?.(promo); }} 
                              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Restore
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onEdit(promo); }} 
                                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-500" /> Edit
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onToggleStatus(promo); }} 
                                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                <Power className="w-3.5 h-3.5 text-slate-500" /> {promo.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              </button>
                              <div className="border-t border-slate-100 my-1"></div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onDelete(promo); }} 
                                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
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
