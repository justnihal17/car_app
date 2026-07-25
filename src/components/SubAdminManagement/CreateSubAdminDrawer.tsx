import React, { useState, useRef, useEffect } from 'react';
import { X, Eye, EyeOff, Save, User, Shield, Upload, Check, ChevronDown } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { uploadImage } from '../../services/uploadService';
import { ImageCropModal } from '../common/ImageCropModal';
import { getLoggedInAdminName, ALL_ACCESS_MODULES } from './subAdminDrawerUtils';
import { getCompactDrawerClass, SubAdminFormFields } from './utils/subAdminFormUtils';

const formatRoleName = (roleName: string) => {
  if (!roleName) return '';
  if (roleName.toLowerCase() === 'super_admin' || roleName.toLowerCase() === 'superadmin') return 'Super Admin';
  return roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();
};

export function CreateSubAdminDrawer({ mode, admin, onSave, onClose }: CreateSubAdminDrawerProps) {
  const loggedInAdminName = getLoggedInAdminName();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isAccessDropdownOpen, setIsAccessDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);

  const [roles, setRoles] = useState<any[]>([]);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const accessDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (accessDropdownRef.current && !accessDropdownRef.current.contains(event.target as Node)) {
        setIsAccessDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'admin',
    password: '',
    imageUrl: '',
    active: true,
    blocked: false,
    permissions: {
      dashboard: true,
      users: false,
      serviceagents: false,
      services: false,
      categories: false,
      bookings: false,
      payments: false,
      reports: false,
      settings: false,
    }
  });

  useEffect(() => {
    if (admin) {
      const nameParts = (admin.name || '').split(' ');
      const firstName = admin.firstName || nameParts[0] || '';
      const lastName = admin.lastName || nameParts.slice(1).join(' ') || '';
      const perms = admin.permissions || {};

      setFormData({
        firstName,
        lastName,
        email: admin.email || '',
        phone: admin.phone || '',
        role: admin.role || 'admin',
        password: admin.password || '••••••••',
        imageUrl: admin.imageUrl || admin.profileUrl || '',
        active: admin.status ? admin.status === 'Active' : (admin.active !== undefined ? admin.active : true),
        blocked: admin.blocked || false,
        permissions: {
          dashboard: perms.dashboard !== undefined ? perms.dashboard : true,
          users: perms.users !== undefined ? perms.users : (perms.userManagement !== undefined ? perms.userManagement : false),
          serviceagents: perms.serviceagents !== undefined ? perms.serviceagents : (perms.serviceAgents !== undefined ? perms.serviceAgents : false),
          services: perms.services !== undefined ? perms.services : false,
          categories: perms.categories !== undefined ? perms.categories : false,
          bookings: perms.bookings !== undefined ? perms.bookings : false,
          payments: perms.payments !== undefined ? perms.payments : false,
          reports: perms.reports !== undefined ? perms.reports : false,
          settings: perms.settings !== undefined ? perms.settings : false,
        }
      });
      setSelectedFile(null);
      setPreviewUrl(null);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'admin',
        password: '',
        imageUrl: '',
        active: true,
        blocked: false,
        permissions: {
          dashboard: true,
          users: false,
          serviceagents: false,
          services: false,
          categories: false,
          bookings: false,
          payments: false,
          reports: false,
          settings: false,
        }
      });
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [admin, mode]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isView = mode === 'view';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawSelectedFile(file);
      const localUrl = URL.createObjectURL(file);
      setRawPreviewUrl(localUrl);
      setCropModalOpen(true);
      setImgError(false);
    }
  };

  const handleCropComplete = (croppedFile: File, croppedPreviewUrl: string) => {
    setSelectedFile(croppedFile);
    setPreviewUrl(croppedPreviewUrl);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    
    if (mode === 'create') {
      if (!formData.password) newErrors.password = 'Password is required';
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

    let finalProfileUrl = formData.imageUrl || 'https://example.com/profile.jpg';

    if (selectedFile) {
      setStatusMessage('Uploading Image...');
      try {
        finalProfileUrl = await uploadImage(selectedFile);
      } catch (uploadErr: any) {
        setLoading(false);
        setStatusMessage('');
        const errText = uploadErr.message || 'Image upload failed';
        setApiError(errText);
        toast.error(errText);
        return;
      }
    }

    setStatusMessage('Saving Data...');

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
      profileUrl: finalProfileUrl,
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
          profileUrl: finalProfileUrl,
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

  const selectedModules = ALL_ACCESS_MODULES.filter(m => {
    const key = m.toLowerCase().replace(' ', '');
    return !!formData.permissions[key];
  });

  const isSubAdminFormValid = Boolean(
    formData.firstName?.trim() &&
    formData.lastName?.trim() &&
    formData.email?.trim() &&
    formData.phone?.trim() &&
    formData.role?.trim() &&
    (mode === 'edit' || formData.password)
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end transition-all duration-300">
      <div className={getCompactDrawerClass()}>
        {/* Drawer Header with Clean Compact Design */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-red-600 via-red-700 to-red-700 text-white flex items-center justify-between border-b border-red-500/30 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 border border-white/20 rounded-xl text-white shadow-inner backdrop-blur-md">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white capitalize">
                {(mode === 'view' || mode === 'edit')
                  ? (`${formData.firstName || ''} ${formData.lastName || ''}`.trim() || admin?.name || 'Admin Details')
                  : 'Create Sub Admin'}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-red-100 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content with space-y-3.5 matching email & first name spacing */}
        <form className="flex-1 space-y-3.5 overflow-y-auto p-5 custom-scrollbar" onSubmit={handleSubmit}>
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

          {/* Form Fields Component from utils/subAdminFormUtils */}
          <SubAdminFormFields
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            isView={isView}
            fileInputRef={fileInputRef}
            previewUrl={previewUrl}
            imgError={imgError}
            setImgError={setImgError}
            handleFileChange={handleFileChange}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isRoleDropdownOpen={isRoleDropdownOpen}
            setIsRoleDropdownOpen={setIsRoleDropdownOpen}
            roleDropdownRef={roleDropdownRef}
            roles={roles}
            formatRoleName={formatRoleName}
            isAccessDropdownOpen={isAccessDropdownOpen}
            setIsAccessDropdownOpen={setIsAccessDropdownOpen}
            accessDropdownRef={accessDropdownRef}
            selectedModules={selectedModules}
            allAccessModules={ALL_ACCESS_MODULES}
          />

          {/* Form Actions Footer - Unified Cancel & Register/Update Buttons */}
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
              disabled={isView || loading} 
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95 text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
            >
              <Save className="w-4 h-4" /> {loading ? 'Saving...' : (mode === 'edit' ? 'Update' : 'Register')}
            </button>
          </div>
        </form>
      </div>

      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={rawPreviewUrl}
        file={rawSelectedFile}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
