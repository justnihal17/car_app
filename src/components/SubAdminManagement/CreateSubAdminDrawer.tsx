import React, { useState, useRef, useEffect } from 'react';
import { X, Eye, EyeOff, Save, User, Sparkles, Shield, Upload, Check, ChevronDown } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const PERMISSIONS = [
  'Dashboard', 'Users', 'Service Agents', 'Services', 'Categories',
  'Bookings', 'Payments', 'Reports', 'Settings'
];

const formatRoleName = (roleName: string) => {
  if (!roleName) return '';
  if (roleName.toLowerCase() === 'super_admin' || roleName.toLowerCase() === 'superadmin') return 'Super Admin';
  return roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();
};

export function CreateSubAdminDrawer({ onClose, onSave, mode, admin }: { onClose: () => void, onSave: (admin: any) => void, mode: 'create' | 'edit' | 'view', admin?: any }) {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [roles, setRoles] = useState<any[]>([]);
  const [imgError, setImgError] = useState(false);

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/master/role');
        if (response.data?.success) {
          setRoles(response.data.data);
        }
      } catch (e) {
        console.error("Failed to fetch roles", e);
      }
    };
    fetchRoles();
  }, []);

  const [formData, setFormData] = useState(() => {
    if (admin) {
      const perms = admin.permissions || {};
      const passMapStr = localStorage.getItem('adminPasswords');
      const passMap = passMapStr ? JSON.parse(passMapStr) : {};
      const savedPass = passMap[admin.id] || passMap[admin.username?.toLowerCase()] || passMap[admin.email?.toLowerCase()] || admin.password || '';

      const currentPassword = savedPass && savedPass !== '••••••••' ? savedPass : (admin.password || '••••••••');

      return {
        firstName: admin.firstName || '',
        lastName: admin.lastName || '',
        email: admin.email || '',
        phone: admin.phone || '',
        role: admin.role || '',
        imageUrl: admin.profileUrl || '',
        active: admin.active !== false,
        blocked: admin.blocked || false,
        password: currentPassword,
        confirmPassword: currentPassword,
        permissions: {
          dashboard: !!perms.dashboard,
          users: !!perms.users,
          serviceagents: !!perms.serviceAgents || !!perms.serviceagents,
          services: !!perms.services,
          categories: !!perms.categories,
          bookings: !!perms.bookings,
          payments: !!perms.payments,
          reports: !!perms.reports,
          settings: !!perms.settings,
        }
      };
    }
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      imageUrl: '',
      active: true,
      blocked: false,
      password: '',
      confirmPassword: '',
      permissions: {
        dashboard: false,
        users: false,
        serviceagents: false,
        services: false,
        categories: false,
        bookings: false,
        payments: false,
        reports: false,
        settings: false,
      }
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isView = mode === 'view';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setImgError(false);
              setFormData({...formData, imageUrl: reader.result as string});
          };
          reader.readAsDataURL(file);
      }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    
    if (mode === 'create') {
      if (!formData.password) newErrors.password = 'Password is required';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Re-enter password is required';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    } else if (formData.password && formData.password !== '••••••••') {
      if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setApiError('');
    setApiSuccess('');

    const apiPermissions = {
      dashboard: !!formData.permissions.dashboard,
      users: !!formData.permissions.users,
      serviceAgents: !!formData.permissions.serviceagents,
      services: !!formData.permissions.services,
      categories: !!formData.permissions.categories,
      bookings: !!formData.permissions.bookings,
      payments: !!formData.permissions.payments,
      reports: !!formData.permissions.reports,
      settings: !!formData.permissions.settings,
    };

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password || 'Admin@123',
      role: formData.role?.toLowerCase() === 'admin' ? 'admin' : (formData.role || 'admin'),
      profileUrl: formData.imageUrl || 'https://example.com/profile.jpg',
      active: formData.active,
      blocked: formData.blocked || false,
      permissions: apiPermissions
    };

    try {
      let response;
      if (mode === 'edit' && admin?.id) {
        const updatePayload: any = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role?.toLowerCase() === 'admin' ? 'admin' : (formData.role || 'admin'),
          profileUrl: formData.imageUrl || 'https://example.com/profile.jpg',
          permissions: apiPermissions,
          active: formData.active,
          blocked: formData.blocked || false
        };
        if (formData.password && formData.password !== '••••••••') {
          updatePayload.password = formData.password;
        }
        response = await api.put(`/admin/admin/${admin.id}`, updatePayload);
      } else {
        response = await api.post('/admin/admin/register', payload);
      }

      const result = response.data;

      if (result.success) {
        try {
          const passMap = JSON.parse(localStorage.getItem('adminPasswords') || '{}');
          if (formData.password && formData.password !== '••••••••') {
            const passVal = formData.password;
            if (formData.email) passMap[formData.email.toLowerCase()] = passVal;
            if (formData.firstName) passMap[formData.firstName.toLowerCase()] = passVal;
            if (result.data?.adminId) passMap[result.data.adminId.toLowerCase()] = passVal;
            if (result.data?._id) passMap[result.data._id] = passVal;
            if (admin?.id) passMap[admin.id] = passVal;
          }
          localStorage.setItem('adminPasswords', JSON.stringify(passMap));
        } catch (e) {}

        toast.success(mode === 'edit' ? 'Admin updated successfully!' : 'Admin registered successfully!');
        setApiSuccess(mode === 'edit' ? 'Admin updated successfully!' : `Admin registered successfully! ID: ${result.data?.adminId || 'N/A'}`);
        
        setTimeout(() => {
          onSave(null); 
        }, 1200);
      } else {
        toast.error(result.message || 'Operation failed from server.');
        setApiError(result.message || 'Operation failed from server.');
      }
    } catch (err: any) {
      console.warn('API operation failed:', err);
      const errMsg = err.response?.data?.message || 'Operation failed. Please try again.';
      toast.error(errMsg);
      setApiError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const ToggleSwitch = ({ label, checked, onChange, disabled }: { label: string, checked: boolean, onChange: (v: boolean) => void, disabled?: boolean }) => (
    <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 shadow-2xs">
      <div>
        <span className="text-xs font-bold text-slate-800 block">{label} Status</span>
        <span className="text-[11px] text-slate-400 font-medium">Enable or disable account access</span>
      </div>
      <button 
        type="button" 
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${checked ? 'bg-red-600' : 'bg-slate-300'} ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5.5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  const isSubAdminFormValid = Boolean(
    formData.firstName?.trim() &&
    formData.lastName?.trim() &&
    formData.email?.trim() &&
    formData.phone?.trim() &&
    formData.role?.trim() &&
    (mode === 'edit' || (
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword
    ))
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end transition-all duration-300">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200/80 animate-in slide-in-from-right duration-300">
        {/* Drawer Header with Project Blue Accent */}
        <div className="px-6 py-5 bg-gradient-to-r from-red-600 via-red-700 to-red-700 text-white flex items-center justify-between border-b border-red-500/30 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 border border-white/20 rounded-xl text-white shadow-inner backdrop-blur-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white capitalize">{mode} Sub Admin</h3>
              <p className="text-xs text-red-100/90 font-medium">Configure administrator credentials & permissions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-red-100 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form className="flex-1 space-y-6 overflow-y-auto p-6 custom-scrollbar" onSubmit={handleSubmit}>
          {apiSuccess && (
            <div className="p-4 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2 shadow-2xs">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              {apiSuccess}
            </div>
          )}
          {apiError && (
            <div className="p-4 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200/80 rounded-xl flex items-center gap-2 shadow-2xs">
              <X className="w-4 h-4 text-rose-600 shrink-0" />
              {apiError}
            </div>
          )}

          {/* Profile Image Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Profile Photo</label>
            <div 
              onClick={() => !isView && fileInputRef.current?.click()} 
              className={`border-2 border-dashed border-blue-200 hover:border-red-500 rounded-2xl p-6 flex flex-col items-center justify-center bg-gradient-to-b from-red-50/40 via-red-50/10 to-transparent transition-all group shadow-2xs ${isView ? 'cursor-default' : 'cursor-pointer hover:shadow-md hover:shadow-red-500/5'}`}
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-200/80 shadow-md mb-3 overflow-hidden group-hover:scale-105 transition-all relative">
                {formData.imageUrl && !imgError ? (
                  <img 
                    src={formData.imageUrl} 
                    alt="Admin Photo" 
                    onError={() => setImgError(true)} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User className="w-8 h-8 text-red-500" />
                )}
              </div>
              <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Upload Admin Photo
              </span>
              <span className="text-[11px] text-slate-400 font-medium mt-1">PNG, JPG or WEBP up to 5MB</span>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Basic Info Section */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 pt-2 pb-1">
              <div className="w-1.5 h-4 bg-red-600 rounded-full" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Basic Information</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">First Name</label>
                <input 
                  disabled={isView} 
                  value={formData.firstName} 
                  onChange={e => setFormData({...formData, firstName: e.target.value})} 
                  type="text" 
                  placeholder="First name" 
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-2xs" 
                />
                {errors.firstName && <p className="text-rose-500 text-xs font-bold mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Last Name</label>
                <input 
                  disabled={isView} 
                  value={formData.lastName} 
                  onChange={e => setFormData({...formData, lastName: e.target.value})} 
                  type="text" 
                  placeholder="Last name" 
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-2xs" 
                />
                {errors.lastName && <p className="text-rose-500 text-xs font-bold mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <input 
                  disabled={isView} 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  type="email" 
                  placeholder="admin@company.com" 
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-2xs" 
                />
                {errors.email && <p className="text-rose-500 text-xs font-bold mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                <input 
                  disabled={isView} 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  type="text" 
                  placeholder="+971 50 000 0000" 
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-2xs" 
                />
                {errors.phone && <p className="text-rose-500 text-xs font-bold mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Security & Role Section */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 pt-2 pb-1">
              <div className="w-1.5 h-4 bg-red-600 rounded-full" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Security & Access</h4>
            </div>

            {!isView && (
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                  <input 
                    type={showPass ? "text" : "password"} 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="Enter password" 
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-2xs pr-10" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)} 
                    className="absolute right-3 top-[29px] p-1 text-slate-400 hover:text-red-600 transition-colors z-10"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {errors.password && <p className="text-rose-500 text-xs font-bold mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Re-enter Password</label>
                  <input 
                    type="password" 
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="Re-enter password" 
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-2xs" 
                  />
                  {errors.confirmPassword && <p className="text-rose-500 text-xs font-bold mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {/* Custom Role Dropdown */}
            <div className="relative" ref={roleDropdownRef}>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Role</label>
              <button 
                type="button"
                disabled={isView}
                onClick={() => !isView && setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`w-full px-3.5 py-2.5 bg-slate-50/60 border rounded-xl text-xs font-semibold flex items-center justify-between text-left transition-all shadow-2xs ${
                  isRoleDropdownOpen ? 'border-red-500 bg-white ring-4 ring-red-500/10' : 'border-slate-200'
                } ${isView ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
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
                              setFormData({ ...formData, role: r.name });
                              setIsRoleDropdownOpen(false);
                            }}
                            className={`px-3.5 py-2.5 text-xs font-bold cursor-pointer flex items-center justify-between transition-colors ${
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

            <ToggleSwitch label="Active" checked={formData.active} onChange={v => setFormData({...formData, active: v})} disabled={isView} />
          </div>

          {/* Module Permissions Section */}
          <div className="space-y-3.5 pb-4">
            <div className="flex items-center justify-between pt-2 pb-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Module Permissions</h4>
              </div>
              {!isView && (
                <button 
                  type="button" 
                  onClick={() => {
                    const allTrue = PERMISSIONS.reduce((acc, p) => ({ ...acc, [p.toLowerCase().replace(' ', '')]: true }), {});
                    setFormData({...formData, permissions: allTrue});
                  }}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  Select All
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {PERMISSIONS.map(p => {
                const key = p.toLowerCase().replace(' ', '');
                const isChecked = !!formData.permissions[key];
                return (
                  <label 
                    key={p} 
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      isChecked 
                        ? 'bg-red-50/60 text-red-700 border-blue-200/80 shadow-2xs' 
                        : 'bg-slate-50/50 text-slate-600 border-slate-200/60 hover:bg-slate-100/50'
                    } ${isView ? 'cursor-default' : ''}`}
                  >
                    <input 
                      disabled={isView} 
                      type="checkbox" 
                      checked={isChecked} 
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            [key]: e.target.checked
                          }
                        });
                      }}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500" 
                    />
                    <span className="truncate">{p}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Form Actions Footer */}
          {!isView && (
            <div className="pt-4 border-t border-slate-200/80 flex items-center gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || !isSubAdminFormValid} 
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95 text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
              >
                <Save className="w-4 h-4" /> {loading ? 'Saving...' : (mode === 'create' ? 'Register Sub Admin' : 'Update Sub Admin')}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
