import React from 'react';
import { Upload, User, ChevronDown, Check, Eye, EyeOff, X, Shield, Lock, Activity, Copy } from 'lucide-react';
import { SafeImage } from '../../common/SafeImage';
import toast from 'react-hot-toast';

export const getCompactDrawerClass = (): string => {
  return "sub-admin-drawer-container animate-in slide-in-from-right duration-300";
};

export interface ActiveToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

export const SectionActiveToggle: React.FC<ActiveToggleProps> = ({
  checked,
  onChange,
  disabled
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-slate-700">Active Account</span>
      <button 
        type="button" 
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${checked ? 'bg-red-600' : 'bg-slate-200'} ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  );
};

export interface SubAdminFormFieldsProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  isView: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  previewUrl: string | null;
  imgError: boolean;
  setImgError: (v: boolean) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  isRoleDropdownOpen: boolean;
  setIsRoleDropdownOpen: (v: boolean) => void;
  roleDropdownRef: React.RefObject<HTMLDivElement>;
  roles: any[];
  formatRoleName: (name: string) => string;
  isAccessDropdownOpen: boolean;
  setIsAccessDropdownOpen: (v: boolean) => void;
  accessDropdownRef: React.RefObject<HTMLDivElement>;
  selectedModules: string[];
  allAccessModules: string[];
}

export const SubAdminFormFields: React.FC<SubAdminFormFieldsProps> = ({
  formData,
  setFormData,
  errors,
  isView,
  fileInputRef,
  previewUrl,
  imgError,
  setImgError,
  handleFileChange,
  showPassword,
  setShowPassword,
  isRoleDropdownOpen,
  setIsRoleDropdownOpen,
  roleDropdownRef,
  roles,
  formatRoleName,
  allAccessModules
}) => {
  const [showImageModal, setShowImageModal] = React.useState(false);
  
  return (
    <>
      {/* 1. Personal Information Section */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white border border-slate-200 rounded-md text-slate-600 shadow-2xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Personal Information</h4>
              <p className="text-[10px] text-slate-500">Basic contact and profile details.</p>
            </div>
          </div>
        </div>
        <div className="p-3 space-y-3">
          {/* Profile Photo Horizontal Row */}
          <div className="flex items-center gap-3.5 pb-1">
            <div 
              onClick={() => {
                if (previewUrl || (formData.imageUrl && !imgError)) {
                  setShowImageModal(true);
                } else if (!isView) {
                  fileInputRef.current?.click();
                }
              }}
              className={`w-12 h-12 shrink-0 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 shadow-2xs overflow-hidden transition-all relative ${previewUrl || formData.imageUrl ? 'cursor-pointer hover:scale-105' : (!isView ? 'cursor-pointer hover:bg-slate-100' : '')}`}
            >
              {(previewUrl || (formData.imageUrl && !imgError)) ? (
                <SafeImage 
                  src={previewUrl || formData.imageUrl} 
                  alt="Admin Photo" 
                  onError={() => setImgError(true)} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="w-5 h-5 text-slate-400" />
              )}
            </div>
            {!isView && (
              <div className="flex flex-col gap-1">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors w-fit flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Upload className="w-3 h-3 text-slate-500" /> Change Photo
                </button>
                <span className="text-[10px] text-slate-400">PNG, JPG or WEBP up to 5MB</span>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-0.5">First Name</label>
              <input 
                disabled={isView} 
                value={formData.firstName} 
                onChange={e => setFormData({...formData, firstName: e.target.value})} 
                type="text" 
                placeholder="First name" 
                className="w-full h-8 px-2.5 py-1 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-500 transition-colors shadow-2xs" 
              />
              {errors.firstName && <p className="text-rose-500 text-[10px] font-medium mt-0.5">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Last Name</label>
              <input 
                disabled={isView} 
                value={formData.lastName} 
                onChange={e => setFormData({...formData, lastName: e.target.value})} 
                type="text" 
                placeholder="Last name" 
                className="w-full h-8 px-2.5 py-1 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-500 transition-colors shadow-2xs" 
              />
              {errors.lastName && <p className="text-rose-500 text-[10px] font-medium mt-0.5">{errors.lastName}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Email Address</label>
              <input 
                disabled={isView} 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                type="email" 
                placeholder="Enter email" 
                className="w-full h-8 px-2.5 py-1 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-500 transition-colors shadow-2xs" 
              />
              {errors.email && <p className="text-rose-500 text-[10px] font-medium mt-0.5">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Phone Number</label>
              <input 
                disabled={isView} 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                type="text" 
                placeholder="Enter phone number" 
                className="w-full h-8 px-2.5 py-1 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-500 transition-colors shadow-2xs" 
              />
              {errors.phone && <p className="text-rose-500 text-[10px] font-medium mt-0.5">{errors.phone}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Account & Role Section */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs">
        <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white border border-slate-200 rounded-md text-slate-600 shadow-2xs">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Account & Role</h4>
              <p className="text-[10px] text-slate-500">Authentication and system role assignment.</p>
            </div>
          </div>
          <SectionActiveToggle 
            checked={formData.active} 
            onChange={v => setFormData({...formData, active: v})} 
            disabled={isView} 
          />
        </div>
        <div className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[11px] font-medium text-slate-700">Admin ID</label>
                {formData.adminId && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(formData.adminId || '');
                      toast.success('Admin ID copied to clipboard!');
                    }}
                    className="text-[10px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Copy Admin ID"
                  >
                    <Copy className="w-2.5 h-2.5" /> Copy
                  </button>
                )}
              </div>
              <input 
                disabled={true} 
                value={formData.adminId || (isView ? 'N/A' : 'Auto-generated on creation')} 
                type="text" 
                placeholder="Auto-generated" 
                className="w-full h-8 px-2.5 py-1 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 font-mono font-medium disabled:bg-slate-50 disabled:text-slate-600 transition-colors select-all shadow-2xs" 
              />
            </div>

            <div className="relative" ref={roleDropdownRef}>
              <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Role</label>
              <button 
                type="button"
                onClick={() => !isView && setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`w-full h-8 px-2.5 py-1 border rounded-lg text-xs flex items-center justify-between text-left transition-all shadow-2xs ${
                  isView ? 'bg-slate-50 text-slate-500 cursor-default' : 'bg-white cursor-pointer hover:bg-slate-50'
                } ${isRoleDropdownOpen ? 'border-slate-300 ring-1 ring-slate-200' : 'border-slate-200'}`}
              >
                <span className={formData.role ? 'text-slate-900' : 'text-slate-400'}>
                  {formData.role ? formatRoleName(formData.role) : 'Select Role'}
                </span>
                {!isView && <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180 text-red-600' : ''}`} />}
              </button>

              {isRoleDropdownOpen && !isView && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <div className="max-h-48 overflow-y-auto custom-scrollbar p-1">
                    {roles.length === 0 ? (
                      <div className="px-3 py-1.5 text-xs text-slate-400 text-center">No roles found</div>
                    ) : (
                      roles.map(r => {
                        const isSelected = formData.role?.toLowerCase() === r.name?.toLowerCase();
                        return (
                          <div
                            key={r._id}
                            onClick={() => {
                              setFormData({ ...formData, role: r.name });
                              setIsRoleDropdownOpen(false);
                            }}
                            className={`px-2.5 py-1.5 text-xs rounded-md flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-red-50 text-red-700 font-medium' 
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span>{formatRoleName(r.name)}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-red-600" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
              {errors.role && <p className="text-rose-500 text-[10px] font-medium mt-0.5">{errors.role}</p>}
            </div>

            <div className="relative sm:col-span-2">
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[11px] font-medium text-slate-700">Password</label>
                {isView && formData.password && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(formData.password || '');
                      toast.success('Password copied to clipboard!');
                    }}
                    className="text-[10px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Copy Password"
                  >
                    <Copy className="w-2.5 h-2.5" /> Copy
                  </button>
                )}
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={formData.password || ''}
                  onChange={e => !isView && setFormData({...formData, password: e.target.value})}
                  disabled={isView}
                  placeholder={isView ? "No password available" : "Enter password"} 
                  className={`w-full h-8 px-2.5 py-1 border border-slate-200 rounded-lg text-xs transition-colors pr-9 shadow-2xs ${
                    isView 
                      ? 'bg-slate-50 text-slate-700 font-normal select-all' 
                      : 'placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 font-normal'
                  }`} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 transition-colors z-10 cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {!isView && errors.password && <p className="text-rose-500 text-[10px] font-medium mt-0.5">{errors.password}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Access Permissions Section */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs">
        <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white border border-slate-200 rounded-md text-slate-600 shadow-2xs">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Access Permissions</h4>
              <p className="text-[10px] text-slate-500">Define which modules this admin can access.</p>
            </div>
          </div>
          {!isView && (
            <button 
              type="button" 
              onClick={() => {
                const allTrue = allAccessModules.reduce((acc, p) => ({ ...acc, [p.toLowerCase().replace(' ', '')]: true }), {});
                setFormData({...formData, permissions: allTrue});
              }}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-md transition-colors border border-red-100 cursor-pointer"
            >
              Grant All
            </button>
          )}
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allAccessModules.map(moduleName => {
              const key = moduleName.toLowerCase().replace(' ', '');
              const isChecked = !!formData.permissions[key];
              
              return (
                <div
                  key={moduleName}
                  onClick={() => {
                    if (!isView) {
                      setFormData({
                        ...formData,
                        permissions: {
                          ...formData.permissions,
                          [key]: !isChecked
                        }
                      });
                    }
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                    isView ? 'cursor-default' : 'cursor-pointer'
                  } ${
                    isChecked 
                      ? 'border-red-200 bg-red-50 text-red-900 shadow-2xs' 
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center border transition-colors ${
                    isChecked ? 'bg-red-600 border-red-600' : 'border-slate-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-xs font-medium truncate ${isChecked ? 'text-red-800 font-semibold' : 'text-slate-700'}`}>
                    {moduleName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {showImageModal && (previewUrl || formData.imageUrl) && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowImageModal(false); }}
              className="absolute -top-12 right-0 md:-right-12 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors border border-white/20 backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
            <SafeImage 
              src={previewUrl || formData.imageUrl} 
              alt="Admin Photo Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/20"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </>
  );
};

