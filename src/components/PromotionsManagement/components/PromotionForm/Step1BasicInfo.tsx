import React from 'react';
import { Tag, Zap, Share2, Wallet, RefreshCw, Copy, Check } from 'lucide-react';
import { Promotion, PromoType } from '../../types/promotion.types';

interface Step1Props {
  formData: Partial<Promotion>;
  onChange: (updated: Partial<Promotion>) => void;
  errors: Record<string, string>;
}

export function Step1BasicInfo({ formData, onChange, errors }: Step1Props) {
  const [copied, setCopied] = React.useState(false);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'OFFER';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    onChange({ code: result });
  };

  const copyCode = () => {
    if (formData.code) {
      navigator.clipboard.writeText(formData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const PROMO_TYPES: { type: PromoType; title: string; desc: string; icon: any }[] = [
    {
      type: 'COUPON',
      title: 'Coupon',
      desc: 'Customers enter a promotional code during checkout.',
      icon: Tag,
    },
    {
      type: 'AUTOMATIC',
      title: 'Automatic Offer',
      desc: 'The offer is automatically applied when eligibility conditions are met.',
      icon: Zap,
    },
    {
      type: 'REFERRAL',
      title: 'Referral',
      desc: 'Rewards are provided through customer referrals.',
      icon: Share2,
    },
    {
      type: 'CASHBACK',
      title: 'Cashback',
      desc: 'A cashback amount is credited after an eligible booking.',
      icon: Wallet,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900">Step 1: Basic Information</h2>
        <p className="text-xs text-slate-500">Define the core title, campaign type, and promotional code.</p>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">
          Promotion Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Example: Welcome Discount"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
        />
        {errors.title && <p className="text-[11px] font-semibold text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-700">
            Description <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] font-medium text-slate-400">
            {(formData.description || '').length} / 250
          </span>
        </div>
        <textarea
          rows={3}
          maxLength={250}
          value={formData.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe this promotion and its benefits"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
        />
        {errors.description && <p className="text-[11px] font-semibold text-red-500">{errors.description}</p>}
      </div>

      {/* Promotion Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700">
          Promotion Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PROMO_TYPES.map((item) => {
            const Icon = item.icon;
            const isSelected = formData.promoType === item.type;

            return (
              <div
                key={item.type}
                onClick={() => {
                  const updates: Partial<Promotion> = { promoType: item.type };
                  if (item.type === 'AUTOMATIC') {
                    updates.autoApply = true;
                    updates.code = '';
                  }
                  onChange(updates);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-red-500 bg-red-50/30 ring-2 ring-red-500/20 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                      isSelected ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Promo Code (Only for Coupon) */}
      {formData.promoType === 'COUPON' && (
        <div className="space-y-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100 ">
          <label className="text-xs font-bold text-slate-800">
            Promo Code <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={formData.code || ''}
              onChange={(e) =>
                onChange({
                  code: e.target.value.toUpperCase().replace(/\s+/g, ''),
                })
              }
              placeholder="WELCOME20"
              className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 tracking-wider"
            />
            <button
              type="button"
              onClick={generateCode}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Generate
            </button>
            {formData.code && (
              <button
                type="button"
                onClick={copyCode}
                className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
                title="Copy Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
          {errors.code && <p className="text-[11px] font-semibold text-red-500">{errors.code}</p>}
          <p className="text-[11px] text-slate-500">
            Uppercase letters, numbers, hyphens and underscores allowed.
          </p>
        </div>
      )}

      {/* Status */}
      <div className="space-y-1.5 max-w-xs">
        <label className="text-xs font-bold text-slate-700">Status</label>
        <select
          value={formData.status || 'ACTIVE'}
          onChange={(e) => onChange({ status: e.target.value as any })}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
}
