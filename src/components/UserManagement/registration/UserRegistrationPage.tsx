import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRegistrationFormValues, userRegistrationSchema } from './UserRegistrationSchema';
import { AddressSection } from './AddressSection';
import { VehicleSection } from './VehicleSection';
import { ProfilePreview } from './ProfilePreview';
import { Save, X, Calendar as CalendarIcon, User, Mail, Phone, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { SafeImage } from '../../common/SafeImage';
import { ImageCropModal } from '../../common/ImageCropModal';

export function UserRegistrationPage({ onViewChange }: { onViewChange: (view: string) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setRawSelectedFile(file);
    setRawPreviewUrl(URL.createObjectURL(file));
    setCropModalOpen(true);
  };

  const handleCropComplete = (croppedFile: File, croppedPreviewUrl: string) => {
    setUserPhoto(croppedPreviewUrl);
  };

  const form = useForm<UserRegistrationFormValues>({
    resolver: zodResolver(userRegistrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      active: true,
      notificationEnabled: true,
      addresses: [{ id: Date.now().toString(), label: 'Home', street: '', city: 'Dubai', country: 'United Arab Emirates', isDefault: true }],
      vehicles: [{ id: Date.now().toString(), brand: '', model: '', registrationNumber: '' }],
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form;

  const onSubmit = async (data: UserRegistrationFormValues) => {
    try {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Payload:', JSON.stringify(data, null, 2));
      toast.success('User registered successfully');
      onViewChange('users');
    } catch (error) {
      toast.error('Failed to register user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formData = watch();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Registration</h1>
            <p className="text-sm text-slate-500 mt-1">Create a new customer account with multiple addresses and vehicles.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onViewChange('users')}
              className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-medium rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-red-600 text-white hover:bg-red-700 font-medium rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSubmitting ? 'Registering...' : 'Register User'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1600px] mx-auto w-full p-6 flex gap-8 items-start">
        {/* Main Form Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 space-y-8 pb-32"
        >
          {/* Section 1: Personal Information */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600 font-medium">Active Status</span>
                <button
                  type="button"
                  onClick={() => setValue('active', !formData.active)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${formData.active ? 'bg-red-600' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formData.active ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
            {/* Image Upload Box */}
            <div className="mb-6 space-y-2">
              <div 
                onClick={() => fileInputRef.current?.click()} 
                className="border-2 border-dashed border-blue-200 hover:border-red-500 rounded-2xl p-6 flex flex-col items-center justify-center bg-linear-to-b from-red-50/40 via-red-50/10 to-transparent transition-all group shadow-2xs cursor-pointer hover:shadow-md hover:shadow-red-500/5"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-200/80 shadow-md mb-3 overflow-hidden group-hover:scale-105 transition-all relative">
                  {userPhoto ? (
                    <SafeImage src={userPhoto} className="w-full h-full object-cover" alt="User Photo" />
                  ) : (
                    <User className="w-8 h-8 text-red-500" />
                  )}
                </div>
                <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> Upload Image
                </span>
                <span className="text-[11px] text-slate-400 font-medium mt-1">PNG, JPG or WEBP up to 5MB</span>
              </div>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                    e.target.value = '';
                  }
                }} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    {...register('fullName')}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.fullName ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-red-500'} rounded-xl text-slate-900 outline-none transition-colors`}
                    placeholder="Enter full name"
                  />
                </div>
                {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    {...register('email')}
                    type="email"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-red-500'} rounded-xl text-slate-900 outline-none transition-colors`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    {...register('phone')}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.phone ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-red-500'} rounded-xl text-slate-900 outline-none transition-colors`}
                    placeholder="+971 50 123 4567"
                  />
                </div>
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Created At</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    disabled
                    value={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-400">Automatically populated.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Addresses */}
          <AddressSection form={form} />

          {/* Section 3: Vehicles */}
          <VehicleSection form={form} />

          {/* Section 4: Notification Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Notification Settings</h2>
              <p className="text-sm text-slate-500 mt-1">Receive booking updates and promotional notifications.</p>
            </div>
            <button
              type="button"
              onClick={() => setValue('notificationEnabled', !formData.notificationEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative ${formData.notificationEnabled ? 'bg-red-600' : 'bg-slate-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formData.notificationEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </motion.div>

        {/* Right Sidebar */}
        <div className="w-80 shrink-0 sticky top-28">
          <ProfilePreview formData={formData} />
        </div>
      </div>

      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={rawPreviewUrl}
        file={rawSelectedFile}
        aspectRatio={1}
        isCircular={false}
        onClose={() => {
          setCropModalOpen(false);
          setRawSelectedFile(null);
          setRawPreviewUrl(null);
        }}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
