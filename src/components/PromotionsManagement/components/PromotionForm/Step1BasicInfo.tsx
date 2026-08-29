import React from 'react';
import { Tag, Zap, Share2, Wallet, RefreshCw, Copy, Check } from 'lucide-react';
import { Promotion, PromoType } from '../../types/promotion.types';
import { CustomSelect } from '../../../common/CustomSelect';

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
      desc: 'Enter promo code at checkout.',
      icon: Tag,
    },
    {
      type: 'AUTOMATIC',
      title: 'Automatic Offer',
      desc: 'Auto-applied when eligible.',
      icon: Zap,
    },
    {
      type: 'REFERRAL',
      title: 'Referral',
      desc: 'Rewards for customer invites.',
      icon: Share2,
    },
    {
      type: 'CASHBACK',
      title: 'Cashback',
      desc: 'Wallet cashback after booking.',
      icon: Wallet,
    },
  ];

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
      <div className="border-b border-slate-100 pb-2.5">
        <h2 className="text-sm font-semibold text-slate-900">Step 1: Basic Information</h2>
        <p className="text-xs text-slate-400 font-normal mt-0.5">Define the core title, campaign type, and promotional code.</p>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700">
          Promotion Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Example: Welcome Discount"
          className="w-full h-8 px-3 bg-white border border-slate-200/90 rounded-lg text-xs font-normal text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 shadow-2xs transition-all"
        />
        {errors.title && <p className="text-[10.5px] font-medium text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-slate-700">
            Description <span className="text-red-500">*</span>
          </label>
          <span className="text-[10px] font-medium text-slate-400">
            {(formData.description || '').length} / 250
          </span>
        </div>
        <textarea
          rows={2.5 as any}
          maxLength={250}
          value={formData.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe this promotion and its benefits"
          className="w-full p-2.5 bg-white border border-slate-200/90 rounded-lg text-xs font-normal text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 shadow-2xs resize-none transition-all"
        />
        {errors.description && <p className="text-[10.5px] font-medium text-red-500">{errors.description}</p>}
      </div>

      {/* Promotion Type */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">
          Promotion Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-red-500 bg-red-50/40 ring-1 ring-red-500/30 shadow-2xs'
                    : 'border-slate-200/90 hover:border-slate-300 bg-slate-50/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7.5 h-7.5 rounded-md flex items-center justify-center font-semibold shrink-0 ${
                      isSelected ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Promo Code (Only for Coupon) */}
      {formData.promoType === 'COUPON' && (
        <div className="space-y-1.5 bg-blue-50/40 p-3 rounded-lg border border-blue-100">
          <label className="text-xs font-semibold text-slate-800">
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
              className="flex-1 h-8 px-3 bg-white border border-slate-200/90 rounded-lg text-xs font-mono font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 tracking-wider shadow-2xs"
            />
            <button
              type="button"
              onClick={generateCode}
              className="inline-flex items-center gap-1.5 h-8 px-3 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Generate
            </button>
            {formData.code && (
              <button
                type="button"
                onClick={copyCode}
                className="h-8 w-8 flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                title="Copy Code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          {errors.code && <p className="text-[10.5px] font-medium text-red-500">{errors.code}</p>}
          <p className="text-[10px] text-slate-400">
            Uppercase letters, numbers, hyphens and underscores allowed.
          </p>
        </div>
      )}

      {/* Status */}
      <div className="space-y-1 max-w-xs">
        <label className="text-xs font-semibold text-slate-700">Status</label>
        <CustomSelect
          value={formData.status || 'ACTIVE'}
          onChange={(val) => onChange({ status: val as any })}
          options={[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
          ]}
          size="sm"
        />
      </div>
    </div>
  );
}
