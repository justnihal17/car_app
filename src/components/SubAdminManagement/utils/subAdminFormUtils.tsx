import React from 'react';
import { Upload, User, ChevronDown, Check, Eye, EyeOff } from 'lucide-react';
import './subAdminForm.css';

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
      <span className="text-xs font-bold text-slate-600">Active</span>
      <button 
        type="button" 
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${checked ? 'bg-red-600' : 'bg-slate-300'} ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
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
  isAccessDropdownOpen,
  setIsAccessDropdownOpen,
  accessDropdownRef,
  selectedModules,
  allAccessModules
}) => {
  return (
    <>
      {/* Profile Photo Section (Labeled as IMAGE) */}
      <div className="space-y-2">
        <div 
          onClick={() => !isView && fileInputRef.current?.click()} 
          className={`border-2 border-dashed border-blue-200 hover:border-red-500 rounded-2xl p-6 flex flex-col items-center justify-center bg-gradient-to-b from-red-50/40 via-red-50/10 to-transparent transition-all group shadow-2xs ${isView ? 'cursor-default' : 'cursor-pointer hover:shadow-md hover:shadow-red-500/5'}`}
        >
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-200/80 shadow-md mb-3 overflow-hidden group-hover:scale-105 transition-all relative">
            {(previewUrl || (formData.imageUrl && !imgError)) ? (
              <img 
                src={previewUrl || formData.imageUrl} 
                alt="Admin Photo" 
                onError={() => setImgError(true)} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <User className="w-8 h-8 text-red-500" />
            )}
          </div>
          {!isView && (
            <>
              <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Upload Image
              </span>
              <span className="text-[11px] text-slate-400 font-medium mt-1">PNG, JPG or WEBP up to 5MB</span>
            </>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Information Section with Active Toggle Opposite */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <div className="sub-admin-section-badge" />
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Information</h4>
          </div>
          <SectionActiveToggle 
            checked={formData.active} 
            onChange={v => setFormData({...formData, active: v})} 
            disabled={isView} 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="sub-admin-form-label">First Name</label>
            <input 
              disabled={isView} 
              value={formData.firstName} 
              onChange={e => setFormData({...formData, firstName: e.target.value})} 
              type="text" 
              placeholder="First name" 
              className="sub-admin-form-input" 
            />
            {errors.firstName && <p className="text-rose-500 text-xs font-bold mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="sub-admin-form-label">Last Name</label>
            <input 
              disabled={isView} 
              value={formData.lastName} 
              onChange={e => setFormData({...formData, lastName: e.target.value})} 
              type="text" 
              placeholder="Last name" 
              className="sub-admin-form-input" 
            />
            {errors.lastName && <p className="text-rose-500 text-xs font-bold mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="sub-admin-form-label">Email Address</label>
            <input 
              disabled={isView} 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              type="email" 
              placeholder="Enter email" 
              className="sub-admin-form-input" 
            />
            {errors.email && <p className="text-rose-500 text-xs font-bold mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="sub-admin-form-label">Phone Number</label>
            <input 
              disabled={isView} 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
              type="text" 
              placeholder="Enter phone number" 
              className="sub-admin-form-input" 
            />
            {errors.phone && <p className="text-rose-500 text-xs font-bold mt-1">{errors.phone}</p>}
          </div>
        </div>
      </div>

      {/* Security Section (Password & Role side-by-side) */}
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-4">
          {/* Password Field */}
          {!isView ? (
            <div className="relative">
              <label className="sub-admin-form-label">Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="Enter password" 
                className="sub-admin-form-input pr-10" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-[29px] p-1 text-slate-400 hover:text-red-600 transition-colors z-10"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {errors.password && <p className="text-rose-500 text-xs font-bold mt-1">{errors.password}</p>}
            </div>
          ) : (
            <div>
              <label className="sub-admin-form-label">Password</label>
              <input 
                disabled 
                type="password" 
                value="••••••••" 
                className="sub-admin-form-input opacity-80" 
              />
            </div>
          )}

          {/* Role Dropdown */}
          <div className="relative" ref={roleDropdownRef}>
            <label className="sub-admin-form-label">Role</label>
            <button 
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className={`w-full px-3.5 py-2.5 bg-slate-50/60 border rounded-xl text-xs font-semibold flex items-center justify-between text-left transition-all shadow-2xs cursor-pointer ${
                isRoleDropdownOpen ? 'border-red-500 bg-white ring-4 ring-red-500/10' : 'border-slate-200'
              }`}
            >
              <span className={formData.role ? 'text-slate-900 font-bold' : 'text-slate-400 font-semibold'}>
                {formData.role ? formatRoleName(formData.role) : 'Select Role'}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180 text-red-600' : ''}`} />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-30 py-1.5 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="px-3.5 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Available System Roles
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                  {roles.length === 0 ? (
                    <div className="px-3.5 py-2.5 text-xs text-slate-400 font-medium">No roles found</div>
                  ) : (
                    roles.map(r => {
                      const isSelected = formData.role?.toLowerCase() === r.name?.toLowerCase();
                      return (
                        <div
                          key={r._id}
                          onClick={() => {
                            if (!isView) {
                              setFormData({ ...formData, role: r.name });
                            }
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`px-3.5 py-2.5 text-xs font-bold flex items-center justify-between transition-colors ${
                            isView ? 'cursor-default' : 'cursor-pointer'
                          } ${
                            isSelected 
                              ? 'bg-red-50/80 text-red-600 font-black' 
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span>{formatRoleName(r.name)}</span>
                          {isSelected && <Check className="w-4 h-4 text-red-600" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
            {errors.role && <p className="text-rose-500 text-xs font-bold mt-1">{errors.role}</p>}
          </div>
        </div>
      </div>

      {/* Modules Access Section */}
      <div className="space-y-3.5 pb-2">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Access</h4>
          </div>
          {!isView && (
            <button 
              type="button" 
              onClick={() => {
                const allTrue = allAccessModules.reduce((acc, p) => ({ ...acc, [p.toLowerCase().replace(' ', '')]: true }), {});
                setFormData({...formData, permissions: allTrue});
              }}
              className="text-xs text-red-600 font-bold hover:underline"
            >
              Grant All Access
            </button>
          )}
        </div>

        {/* Access Selection Dropdown List */}
        <div className="relative" ref={accessDropdownRef}>
          <button 
            type="button"
            onClick={() => setIsAccessDropdownOpen(!isAccessDropdownOpen)}
            className={`w-full px-3.5 py-2.5 bg-slate-50/60 border rounded-xl text-xs font-semibold flex items-center justify-between text-left transition-all shadow-2xs cursor-pointer ${
              isAccessDropdownOpen ? 'border-red-500 bg-white ring-4 ring-red-500/10' : 'border-slate-200'
            }`}
          >
            <div className="flex flex-wrap gap-1.5 pr-2">
              {selectedModules.length === 0 ? (
                <span className="text-slate-400 font-semibold">Select Access Modules...</span>
              ) : (
                selectedModules.map(m => (
                  <span key={m} className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200/80 rounded-md text-[11px] font-bold">
                    {m}
                  </span>
                ))
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isAccessDropdownOpen ? 'rotate-180 text-red-600' : ''}`} />
          </button>

          {isAccessDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-30 py-1.5 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="px-3.5 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                <span>System Access List</span>
                <span className="text-red-600">{selectedModules.length} / {allAccessModules.length} Selected</span>
              </div>
              <div className="max-h-52 overflow-y-auto custom-scrollbar p-1">
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
                      className={`px-3 py-2 text-xs font-bold rounded-xl flex items-center justify-between transition-colors ${
                        isView ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        isChecked 
                          ? 'bg-red-50 text-red-700 font-black' 
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          readOnly 
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500 pointer-events-none" 
                        />
                        {moduleName}
                      </span>
                      {isChecked && <Check className="w-4 h-4 text-red-600" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
