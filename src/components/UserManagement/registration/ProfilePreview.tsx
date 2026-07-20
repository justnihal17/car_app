import React from 'react';
import { UserRegistrationFormValues } from './UserRegistrationSchema';
import { MapPin, Car, Mail, Phone, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProfilePreview({ formData }: { formData: UserRegistrationFormValues }) {
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const addressCount = formData.addresses?.length || 0;
  const vehicleCount = formData.vehicles?.length || 0;

  // Calculate profile completion
  let completion = 0;
  if (formData.fullName) completion += 25;
  if (formData.email) completion += 25;
  if (formData.phone) completion += 25;
  if (addressCount > 0 && vehicleCount > 0) completion += 25;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col items-center">
      <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-inner">
        {getInitials(formData.fullName)}
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 text-center mb-1 line-clamp-1">
        {formData.fullName || 'New User'}
      </h3>
      <p className="text-sm text-slate-500 mb-6 flex items-center justify-center gap-1">
        {formData.active ? (
          <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Active Account</>
        ) : (
          <><XCircle className="w-3 h-3 text-slate-400" /> Inactive Account</>
        )}
      </p>

      <div className="w-full space-y-4">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <span className="text-slate-700 truncate">{formData.email || 'No email provided'}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
            <Phone className="w-4 h-4" />
          </div>
          <span className="text-slate-700 truncate">{formData.phone || 'No phone provided'}</span>
        </div>
      </div>

      <div className="w-full border-t border-slate-100 my-6"></div>

      <div className="w-full grid grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <MapPin className="w-5 h-5 text-red-500 mb-2" />
          <span className="text-2xl font-bold text-slate-900">{addressCount}</span>
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium mt-1">Addresses</span>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <Car className="w-5 h-5 text-red-500 mb-2" />
          <span className="text-2xl font-bold text-slate-900">{vehicleCount}</span>
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium mt-1">Vehicles</span>
        </div>
      </div>

      <div className="w-full mt-6 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-500">Profile Completion</span>
          <span className="text-red-600">{completion}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${completion}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded-full ${completion === 100 ? 'bg-emerald-500' : 'bg-red-500'}`}
          />
        </div>
      </div>
    </div>
  );
}
