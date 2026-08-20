import { useEffect, useState } from 'react';
import { Upload, ChevronRight, ArrowLeft, Fuel, Car, Info, MapPin, Tag, Percent, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { uploadImage } from '../../services/uploadService';
import { ImageCropModal } from '../common/ImageCropModal';

const STEPS = [
  { id: 1, label: 'Basic Information' },
  { id: 2, label: 'Pricing' },
  { id: 3, label: 'Configuration' },
  { id: 4, label: 'Availability' },
  { id: 5, label: 'Confirmation' },
];

const initialFormState = {
  name: '',
  code: '',
  shortDescription: '',
  detailedDescription: '',
  category: 'Fuel Delivery',
  subcategory: 'Premium Fuel',
  image: '',
  price: '',
  tax: '5',
  discountType: 'Percentage (%)',
  discountValue: '0',
  commission: '20',
  platformFee: '10',
  duration: '45',
  maxDistance: '25',
  cities: ['Dubai', 'Abu Dhabi'],
  startTime: '08:00',
  endTime: '22:00',
  active: true,
};

export function CreateService({
  onBack,
  onSaved,
  initialService,
}: {
  onBack: () => void;
  onSaved?: () => void;
  initialService?: any;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialService) {
      setFormData({
        ...initialFormState,
        name: initialService.name || '',
        code: initialService.code || '',
        shortDescription: initialService.shortDescription || initialService.description || '',
        detailedDescription: initialService.detailedDescription || initialService.description || '',
        category: initialService.category || 'Fuel Delivery',
        subcategory: initialService.subcategory || 'Premium Fuel',
        image: initialService.image || '',
        price: initialService.price?.toString() || '',
        tax: initialService.tax?.toString() || '5',
        discountType: initialService.discountType || 'Percentage (%)',
        discountValue: initialService.discountValue?.toString() || '0',
        commission: initialService.commission?.toString() || '20',
        platformFee: initialService.platformFee?.toString() || '10',
        duration: initialService.duration?.toString() || '45',
        maxDistance: initialService.maxDistance?.toString() || '25',
        cities: initialService.cities || ['Dubai', 'Abu Dhabi'],
        startTime: initialService.startTime || '08:00',
        endTime: initialService.endTime || '22:00',
        active: initialService.active !== false,
      });
    }
  }, [initialService]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleCity = (city: string) => {
    setFormData((prev) => {
      const hasCity = prev.cities.includes(city);
      return {
        ...prev,
        cities: hasCity ? prev.cities.filter((c) => c !== city) : [...prev.cities, city],
      };
    });
  };

  const handleFileSelect = (file: File) => {
    setRawSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setRawPreviewUrl(objectUrl);
    setCropModalOpen(true);
  };

  const handleCropComplete = async (croppedFile: File, croppedPreviewUrl: string) => {
    setUploadingImage(true);
    try {
      setImagePreview(croppedPreviewUrl);
      const url = await uploadImage(croppedFile);
      handleInputChange('image', url);
      toast.success('Image cropped and uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const imageUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, image: imageUrl }));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Service name is required');
      setCurrentStep(1);
      return;
    }
    if (!formData.price.trim() || Number.isNaN(Number(formData.price))) {
      toast.error('Valid price is required');
      setCurrentStep(2);
      return;
    }
    if (!formData.image.trim()) {
      toast.error('Service image URL is required');
      setCurrentStep(1);
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        name: formData.name,
        price: Number(formData.price),
        image: formData.image,
        active: formData.active,
        category: formData.category,
        code: formData.code || undefined,
        description: formData.detailedDescription || formData.shortDescription || undefined,
        shortDescription: formData.shortDescription || formData.detailedDescription || undefined,
        detailedDescription: formData.detailedDescription || formData.shortDescription || undefined,
      };

      if (initialService?.id) {
        await api.put(`/master/service/${initialService.id}`, payload);
        toast.success('Service updated successfully');
      } else {
        await api.post('/master/service', payload);
        toast.success('Service created successfully');
      }
      onSaved?.();
      onBack();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to save service');
    } finally {
      setIsSaving(false);
    }
  };

  const imagePreview = formData.image || '';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{initialService ? 'Edit Service' : 'Create Service'}</h1>
            <p className="text-sm text-slate-400 mt-1">Configure a new service offering</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || uploadingImage}
            className="px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm shadow-sm"
          >
            {initialService ? 'Update Service' : 'Save Draft'}
          </button>
          {currentStep === 5 && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || uploadingImage}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/20 transition-all text-sm"
            >
              {isSaving ? 'Saving...' : initialService ? 'Update Service' : 'Publish Service'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Progress Stepper Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-[#0f1218] p-5 rounded-xl border border-slate-800/60 shadow-lg sticky top-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Service Setup</h3>
            <div className="space-y-4">
              {STEPS.map((step, index) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                return (
                  <div key={step.id} className="relative">
                    {index !== STEPS.length - 1 && (
                      <div className={`absolute left-3.5 top-8 w-px h-full -ml-px ${isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
                    )}
                    <button
                      type="button"
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex items-center gap-4 w-full text-left group ${step.id > currentStep ? 'opacity-50' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors z-10
                        ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-[#0f1218]' : 
                          isCurrent ? 'bg-[#0f1218] border-emerald-500 text-emerald-400' : 
                          'bg-[#0f1218] border-slate-700 text-slate-500'}
                      `}>
                        {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{step.id}</span>}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${isCurrent ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                          {step.label}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-3">
          <div className="bg-[#0f1218] p-6 md:p-8 rounded-xl border border-slate-800/60 shadow-lg min-h-125 flex flex-col">
            {currentStep === 1 && (
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">IMAGE</label>
                  <label className="block w-full border-2 border-dashed border-slate-700 rounded-3xl p-8  flex-col items-center justify-center bg-slate-950/50 hover:border-emerald-400 transition-all cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          const file = e.target.files[0];
                          handleFileSelect(file);
                          e.target.value = '';
                        }
                      }}
                    />
                    <div className="w-18 h-18 bg-slate-900 rounded-3xl flex items-center justify-center mb-4">
                      <Upload className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div className="text-sm font-semibold text-white mb-1">Upload Image</div>
                    <div className="text-xs text-slate-500">PNG, JPG or WEBP up to 5MB</div>
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="Paste image URL or upload a file"
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                  {imagePreview && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-slate-700">
                      <img src={imagePreview} alt="Service" className="w-full h-56 object-cover" />
                    </div>
                  )}
                  {uploadingImage && <div className="text-xs text-slate-400">Uploading image…</div>}
                </div>

                <h2 className="text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-4">Basic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Service Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g. Super98 Fuel Delivery"
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Service Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      placeholder="e.g. FUEL-98"
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Short Description</label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    placeholder="Brief tagline for the service card"
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Detailed Description</label>
                  <textarea
                    rows={4}
                    value={formData.detailedDescription}
                    onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                    placeholder="Full description of what the service includes..."
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Subcategory</label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none"
                  >
                    <option>Premium Fuel</option>
                    <option>Standard Fuel</option>
                    <option>Diesel</option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex-1 space-y-6">
                <h2 className="text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-4">Pricing Configuration</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Base Price (AED) <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">د.إ</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Tax (%)</label>
                    <div className="relative">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">%</span>
                      <input
                        type="number"
                        value={formData.tax}
                        onChange={(e) => handleInputChange('tax', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Tag className="w-4 h-4 text-emerald-400" /> Promotional Pricing
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400">Discount Type</label>
                      <select
                        value={formData.discountType}
                        onChange={(e) => handleInputChange('discountType', e.target.value)}
                        className="w-full bg-[#0f1218] border border-slate-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none text-sm"
                      >
                        <option>Percentage (%)</option>
                        <option>Fixed Amount (AED)</option>
                        <option>No Discount</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400">Discount Value</label>
                      <input
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) => handleInputChange('discountValue', e.target.value)}
                        placeholder="0"
                        className="w-full bg-[#0f1218] border border-slate-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Driver Commission (%)</label>
                    <div className="relative">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">%</span>
                      <input
                        type="number"
                        value={formData.commission}
                        onChange={(e) => handleInputChange('commission', e.target.value)}
                        placeholder="20"
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Platform Fee (%)</label>
                    <div className="relative">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">%</span>
                      <input
                        type="number"
                        value={formData.platformFee}
                        onChange={(e) => handleInputChange('platformFee', e.target.value)}
                        placeholder="10"
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex-1 space-y-6">
                <h2 className="text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-4">Service Configuration</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Estimated Duration (Mins)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="45"
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Maximum Service Distance (KM)</label>
                    <input
                      type="number"
                      value={formData.maxDistance}
                      onChange={(e) => handleInputChange('maxDistance', e.target.value)}
                      placeholder="25"
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">Supported Vehicle Types</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Sedan', 'SUV', 'Truck', 'Motorcycle'].map((type) => (
                      <label key={type} className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer hover:bg-slate-800 transition-colors">
                        <input
                          type="checkbox"
                          checked={['Sedan', 'SUV'].includes(type)}
                          readOnly
                          className="w-4 h-4 rounded bg-[#0f1218] border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-[#0f1218]"
                        />
                        <span className="text-sm text-slate-200 font-medium">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">Required Driver Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {['Hazmat Certified', 'Heavy Duty License', 'Basic Mechanic', 'Pressure Washing'].map((skill) => (
                      <span key={skill} className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-sm text-slate-300 flex items-center gap-2 cursor-default">
                        {skill}
                      </span>
                    ))}
                    <button className="px-3 py-1.5 rounded-full border border-dashed border-slate-600 text-sm text-slate-400 hover:text-white hover:border-slate-500 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add Skill
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="flex-1 space-y-6">
                <h2 className="text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-4">Availability & Scheduling</h2>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">Available Operating Cities</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah'].map((city) => (
                      <label key={city} className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer hover:bg-slate-800 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.cities.includes(city)}
                          onChange={() => handleToggleCity(city)}
                          className="w-4 h-4 rounded bg-[#0f1218] border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-[#0f1218]"
                        />
                        <MapPin className={`w-4 h-4 ${formData.cities.includes(city) ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className="text-sm text-slate-200 font-medium">{city}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Operating Hours Start</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Operating Hours End</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mt-4">
                  <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-400 mb-1">Emergency 24/7 Mode</h4>
                    <p className="text-xs text-blue-400/80">If enabled, this service ignores operating hours and can be requested at any time. Night surcharges may automatically apply.</p>
                    <label className="flex items-center gap-2 mt-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => handleInputChange('active', e.target.checked)}
                        className="w-4 h-4 rounded bg-blue-900/50 border-red-700 text-red-500 focus:ring-red-500 focus:ring-offset-[#0f1218]"
                      />
                      <span className="text-sm font-medium text-blue-300">Enable 24/7 Emergency Mode</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="flex-1 space-y-6">
                <h2 className="text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-4">Review & Publish</h2>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Service Preview</h3>

                  <div className="flex justify-center md:justify-start">
                    <ServiceCard
                      image={imagePreview || undefined}
                      title={formData.name || 'Untitled Service'}
                      className="w-full sm:w-[340px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Tax Included</div>
                    <div className="text-sm font-medium text-white">{formData.tax}%</div>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Driver Commission</div>
                    <div className="text-sm font-medium text-white">{formData.commission}%</div>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Service Cities</div>
                    <div className="text-sm font-medium text-white">{formData.cities.length} Selected</div>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Operating Hours</div>
                    <div className="text-sm font-medium text-white">{formData.startTime} - {formData.endTime}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Navigation */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="px-5 py-2.5 bg-slate-900 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Previous Step
              </button>

              {currentStep < 5 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/20 transition-all text-sm"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={rawPreviewUrl}
        file={rawSelectedFile}
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
