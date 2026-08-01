import React, { useState } from 'react';
import { Eye, Edit2, Copy, Power, Trash2, MoreVertical, Zap } from 'lucide-react';
import { Promotion } from '../types/promotion.types';
import { PromoTypeBadge, PromotionStatusBadge, DiscountBadge, PriorityBadge } from './PromotionBadges';

interface PromotionsTableProps {
  promotions: Promotion[];
  onView: (promo: Promotion) => void;
  onEdit: (promo: Promotion) => void;
  onDuplicate: (promo: Promotion) => void;
  onToggleStatus: (promo: Promotion) => void;
  onDelete: (promo: Promotion) => void;
}

export function PromotionsTable({
  promotions,
  onView,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onDelete,
}: PromotionsTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-4">Promotion</th>
              <th className="px-4 py-4">Promo Code</th>
              <th className="px-4 py-4">Type</th>
              <th className="px-4 py-4">Discount</th>
              <th className="px-4 py-4">Validity</th>
              <th className="px-4 py-4">Usage</th>
              <th className="px-4 py-4 text-center">Priority</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {promotions.map((promo) => {
              const usageLimitText = promo.usageLimit ? promo.usageLimit.toString() : 'Unlimited';
              const usagePercent = promo.usageLimit ? Math.min(100, Math.round((promo.usedCount / promo.usageLimit) * 100)) : 0;

              return (
                <tr key={promo.id} className="hover:bg-slate-50/70 transition-colors group">
                  {/* Title & Description */}
                  <td className="px-5 py-4 max-w-xs">
                    <div className="font-bold text-slate-900 leading-snug truncate">{promo.title}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{promo.description}</div>
                  </td>

                  {/* Promo Code */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {promo.promoType === 'automatic' ? (
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

                  {/* Type */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <PromoTypeBadge type={promo.promoType} />
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

                  {/* Validity */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-slate-800 font-medium">{promo.startDate}</div>
                    <div className="text-[11px] text-slate-400">
                      {promo.endDate ? `to ${promo.endDate}` : 'No End Date'}
                    </div>
                  </td>

                  {/* Usage */}
                  <td className="px-4 py-4 whitespace-nowrap min-w-[130px]">
                    <div className="font-bold text-slate-800">
                      {promo.usedCount} <span className="text-slate-400 font-normal">/ {usageLimitText}</span>
                    </div>
                    {promo.usageLimit && (
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${usagePercent >= 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <PriorityBadge priority={promo.priority} />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <PromotionStatusBadge status={promo.status} endDate={promo.endDate} />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right whitespace-nowrap relative">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onView(promo)}
                        title="View Details"
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onEdit(promo)}
                        title="Edit"
                        className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === promo.id ? null : promo.id)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === promo.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20 text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-100">
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onDuplicate(promo);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Copy className="w-3.5 h-3.5 text-slate-500" /> Duplicate
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onToggleStatus(promo);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Power className="w-3.5 h-3.5 text-slate-500" />
                                {promo.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                              <div className="my-1 border-t border-slate-100" />
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onDelete(promo);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
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
