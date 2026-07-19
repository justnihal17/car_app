import React, { useState, useRef, useEffect } from 'react';
import { X, Eye, EyeOff, Save, Box } from 'lucide-react';
import api from '../../api/axios';

const PERMISSIONS = [
  'Dashboard', 'Users', 'Service Agents', 'Services', 'Categories',
  'Bookings', 'Payments', 'Reports', 'Settings'
];

export function CreateSubAdminDrawer({ onClose, onSave, mode, admin }: { onClose: () => void, onSave: (admin: any) => void, mode: 'create' | 'edit' | 'view', admin?: any }) {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [roles, setRoles] = useState<any[]>([]);

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
      const parts = admin.name ? admin.name.split(' ') : ['', ''];
      return {
        ...admin,
        firstName: admin.firstName || parts[0] || '',
        lastName: admin.lastName || parts.slice(1).join(' ') || '',
        password: admin.password || '',
        imageUrl: admin.imageUrl || admin.profileUrl || '',
        permissions: admin.permissions || PERMISSIONS.reduce((acc, p) => ({ ...acc, [p.toLowerCase().replace(' ', '')]: true }), {})
      };
    }
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      imageUrl: '',
      password: '',
      role: 'Staff', 
      superAdmin: false, 
      active: true,
      permissions: PERMISSIONS.reduce((acc, p) => ({ ...acc, [p.toLowerCase().replace(' ', '')]: true }), {})
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
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (mode === 'create' && !formData.password) newErrors.password = 'Password is required';
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

    // Prepare API permissions
    const apiPermissions = {
      dashboard: !!formData.permissions.dashboard,
      users: !!formData.permissions.users,
      serviceAgents: !!formData.permissions.serviceagents || !!formData.permissions.serviceAgents,
      services: !!formData.permissions.services,
      categories: !!formData.permissions.categories,
      bookings: !!formData.permissions.bookings,
      payments: !!formData.permissions.payments,
      reports: !!formData.permissions.reports,
      settings: !!formData.permissions.settings,
    };

    // Prepare Registration Payload
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password || 'Admin@123',
      role: formData.role?.toLowerCase() === 'admin' ? 'admin' : (formData.role || 'admin'),
      profileUrl: formData.imageUrl || 'https://example.com/profile.jpg',
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
        setApiSuccess(mode === 'edit' ? 'Admin updated successfully!' : `Admin registered successfully! ID: ${result.data?.adminId || 'N/A'}`);
        
        setTimeout(() => {
          onSave(null); // Passing null is fine since SubAdminList refreshes the list on save anyway
        }, 1500);
      } else {
        setApiError(result.message || 'Operation failed from server.');
      }
    } catch (err: any) {
      console.warn('API operation failed:', err);
      setApiError(err.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ToggleSwitch = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button 
        type="button" 
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 capitalize">{mode} Sub Admin</h3>
          <button onClick={onClose}><X className="w-6 h-6 text-slate-500" /></button>
        </div>
        <form className="flex-1 space-y-6 overflow-y-auto" onSubmit={handleSubmit}>
          {apiSuccess && (
            <div className="p-3 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
              {apiSuccess}
            </div>
          )}
          {apiError && (
            <div className="p-3 text-xs font-semibold text-red-800 bg-red-50 border border-red-200 rounded-lg">
              {apiError}
            </div>
          )}

          {/* Profile Image */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Profile Image</label>
            <div onClick={() => !isView && fileInputRef.current?.click()} className="border-2 border-dashed border-blue-300 rounded-xl p-8 flex flex-col items-center justify-center bg-blue-50/50 cursor-pointer hover:bg-blue-50 transition-colors">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm mb-3 overflow-hidden">
                    {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <Box className="w-8 h-8 text-blue-400" />
                    )}
                </div>
                <span className="text-sm font-semibold text-blue-600">Upload Admin Photo</span>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input disabled={isView} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} type="text" placeholder="John" className="w-full p-3 border border-slate-300 rounded-lg text-sm" />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input disabled={isView} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} type="text" placeholder="Smith" className="w-full p-3 border border-slate-300 rounded-lg text-sm" />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input disabled={isView} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" placeholder="admin@company.com" className="w-full p-3 border border-slate-300 rounded-lg text-sm" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input disabled={isView} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="text" placeholder="+971" className="w-full p-3 border border-slate-300 rounded-lg text-sm" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
            </div>
          </div>

          {/* Security & Access */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Security & Access</h4>
            {!isView && (
                <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input 
                      type={showPass ? "text" : "password"} 
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••" 
                      className="w-full p-3 border border-slate-300 rounded-lg text-sm pr-10" 
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-9 text-slate-400">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
            )}
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select disabled={isView} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm">
                <option value="" disabled>Select Role</option>
                {roles.map(r => (
                  <option key={r._id} value={r.name}>{r.name}</option>
                ))}
            </select>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
            <ToggleSwitch label="Active" checked={formData.active} onChange={v => setFormData({...formData, active: v})} />
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Permissions</h4>
                <button 
                  type="button" 
                  onClick={() => {
                    const allTrue = PERMISSIONS.reduce((acc, p) => ({ ...acc, [p.toLowerCase().replace(' ', '')]: true }), {});
                    setFormData({...formData, permissions: allTrue});
                  }}
                  className="text-xs text-blue-600 font-medium"
                >
                  Select All
                </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {PERMISSIONS.map(p => (
                    <label key={p} className="flex items-center gap-2 text-sm text-slate-700">
                        <input 
                            disabled={isView} 
                            type="checkbox" 
                            checked={formData.permissions[p.toLowerCase().replace(' ', '')]} 
                            onChange={(e) => {
                                const key = p.toLowerCase().replace(' ', '');
                                setFormData({
                                    ...formData,
                                    permissions: {
                                        ...formData.permissions,
                                        [key]: e.target.checked
                                    }
                                });
                            }}
                            className="rounded border-slate-300 text-blue-600" 
                        />
                        {p}
                    </label>
                ))}
            </div>
          </div>

          {/* Actions */}
          {!isView && (
            <div className="flex gap-4 pt-4 border-t border-slate-200">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                    <Save className="w-4 h-4" /> {loading ? 'Registering...' : (mode === 'create' ? 'Save' : 'Update')} Sub Admin
                </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
