import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Eye, EyeOff, Save, User, Shield, Upload, Check, ChevronDown, Edit2 } from 'lucide-react';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { uploadImage } from '../../../services/uploadService';
import { getLoggedInAdminName, ALL_ACCESS_MODULES } from '../subAdminDrawerUtils';
import { getCompactDrawerClass, SubAdminFormFields } from '../utils/subAdminFormUtils';
import { ImageCropModal } from '../../common/ImageCropModal';

const formatRoleName = (roleName: string) => {
  if (!roleName) return '';
  if (roleName.toLowerCase() === 'super_admin' || roleName.toLowerCase() === 'superadmin') return 'Super Admin';
  return roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();
};

interface CreateSubAdminDrawerProps {
  mode: 'create' | 'edit' | 'view';
  admin?: any;
  onSave: (data?: any) => void;
  onClose: () => void;
}

export function CreateSubAdminDrawer({ mode, admin, onSave, onClose }: CreateSubAdminDrawerProps) {
  const [currentMode, setCurrentMode] = useState<'create' | 'edit' | 'view'>(mode);
  const loggedInAdminName = getLoggedInAdminName();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(mode === 'view');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isAccessDropdownOpen, setIsAccessDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);

  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/master/role/admin');
        
        const rawList = Array.isArray(response.data?.data)
          ? response.data.data
          : (Array.isArray(response.data) ? response.data : (response.data?.roles || response.data?.list || []));
        
        if (Array.isArray(rawList) && rawList.length > 0) {
          const formattedRoles = rawList.map((item: any) => ({
            _id: item._id || item.id || item.name,
            name: item.name || item.title || 'Unknown',
            title: item.title || item.name || 'Unknown'
          })).filter(r => Boolean(r.name));
          
          if (formattedRoles.length > 0) {
            setRoles(formattedRoles);
          }
        }
      } catch (err) {
        console.warn('Failed to load roles for drawer:', err);
      }
    };
    fetchRoles();

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const accessDropdownRef = useRef<HTMLDivElement>(null);

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
    adminId: '',
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

      const passMapStr = localStorage.getItem('adminPasswords');
      const passMap = passMapStr ? JSON.parse(passMapStr) : {};
      const idKey = admin._id || admin.id || '';
      const usernameKey = admin.adminId?.toLowerCase() || admin.username?.toLowerCase() || '';
      const emailKey = (admin.email || '').toLowerCase().trim();
      const firstNameKey = (admin.firstName || firstName).toLowerCase().trim();
      const nameKey = `${admin.firstName || firstName || ''} ${admin.lastName || lastName || ''}`.trim().toLowerCase();
      const phoneKey = (admin.phone || '').trim();

      let resolvedPassword = admin.password || admin.plainPassword || admin.tempPassword || admin.originalPassword ||
        passMap[idKey] || passMap[usernameKey] || passMap[emailKey] || passMap[firstNameKey] || passMap[nameKey] || passMap[phoneKey] || '';

      if (!resolvedPassword || resolvedPassword === '••••••••') {
        resolvedPassword = 'Admin@123';
        if (idKey) passMap[idKey] = resolvedPassword;
        if (usernameKey) passMap[usernameKey] = resolvedPassword;
        if (emailKey) passMap[emailKey] = resolvedPassword;
        localStorage.setItem('adminPasswords', JSON.stringify(passMap));
      }

      setFormData({
        adminId: admin.adminId || admin.username || admin.id || admin._id || '',
        firstName,
        lastName,
        email: admin.email || '',
        phone: admin.phone || '',
        role: admin.role || 'admin',
        password: resolvedPassword,
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
      if (mode === 'view' || currentMode === 'view') {
        setShowPassword(true);
      }
    } else {
      setFormData({
        adminId: '',
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
  }, [admin, mode, currentMode]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isView = currentMode === 'view';
  const isEdit = currentMode === 'edit' || (Boolean(admin) && currentMode !== 'view');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setRawSelectedFile(file);
      setRawPreviewUrl(localUrl);
      setCropModalOpen(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropComplete = async (croppedFile: File, croppedPreviewUrl: string) => {
    setPreviewUrl(croppedPreviewUrl);
    setFormData(prev => ({ ...prev, imageUrl: croppedPreviewUrl }));
    setImgError(false);
    
    toast.loading('Uploading Image...', { id: 'imgUpload' });
    try {
      const uploadedUrl = await uploadImage(croppedFile);
      toast.dismiss('imgUpload');
      toast.success('Image uploaded successfully');
      setPreviewUrl(uploadedUrl);
      setFormData(prev => ({ ...prev, imageUrl: uploadedUrl }));
      setSelectedFile(null);
    } catch (err: any) {
      toast.dismiss('imgUpload');
      toast.error(err.message || 'Image upload failed');
      setSelectedFile(croppedFile);
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
    }

    if (!formData.role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = useMemo(() => {
    if (!formData.firstName?.trim()) return false;
    if (!formData.lastName?.trim()) return false;
    if (!formData.email?.trim()) return false;
    if (!formData.phone?.trim()) return false;
    if (!formData.role?.trim()) return false;
    if (mode === 'create' && !formData.password?.trim()) return false;
    return true;
  }, [formData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setApiError('');
    setApiSuccess('');

    let finalProfileUrl = formData.imageUrl || '';

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

    const payload: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password || '••••••••',
      role: formData.role?.toLowerCase() === 'admin' ? 'admin' : (formData.role || 'admin'),
      profileUrl: finalProfileUrl,
      permissions: apiPermissions,
      active: formData.active,
      blocked: formData.blocked || false
    };

    try {
      let response;
      if (isEdit && admin?.id) {
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
        // Persist entered password to adminPasswords in localStorage
        if (formData.password && formData.password !== '••••••••') {
          const passMapStr = localStorage.getItem('adminPasswords');
          const passMap = passMapStr ? JSON.parse(passMapStr) : {};
          const enteredPass = formData.password.trim();

          const createdId = result.data?._id || result.data?.id || admin?.id || admin?._id;
          const createdAdminId = result.data?.adminId || admin?.adminId || admin?.username;

          if (createdId) passMap[createdId] = enteredPass;
          if (createdAdminId) passMap[String(createdAdminId).toLowerCase()] = enteredPass;
          if (formData.email) passMap[formData.email.toLowerCase().trim()] = enteredPass;
          if (formData.firstName) passMap[formData.firstName.toLowerCase().trim()] = enteredPass;
          if (formData.phone) passMap[formData.phone.trim()] = enteredPass;
          if (formData.firstName || formData.lastName) {
            passMap[`${formData.firstName} ${formData.lastName}`.trim().toLowerCase()] = enteredPass;
          }

          localStorage.setItem('adminPasswords', JSON.stringify(passMap));
        }

        toast.success(isEdit ? 'Admin updated successfully!' : 'Admin registered successfully!');
        setApiSuccess(isEdit ? 'Admin updated successfully!' : `Admin registered successfully! ID: ${result.data?.adminId || 'N/A'}`);
        
        setTimeout(() => {
          onSave(null); 
        }, 1200);
      } else {
        toast.error(result.message || 'Operation failed from server.');
        setApiError(result.message || 'Operation failed from server.');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error saving sub admin';
      toast.error(errorMsg);
      setApiError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const selectedModules = ALL_ACCESS_MODULES.filter(m => {
    const key = m.toLowerCase().replace(' ', '');
    return !!formData.permissions[key];
  });

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 transition-opacity duration-200 ease-out">
      <div className="bg-[#F8FAFC] w-full max-w-full md:max-w-2xl rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 ease-out">
        {/* Header - White, minimal, top accent */}
        <div className="px-6 py-4 bg-white flex items-center justify-between border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold tracking-tight text-slate-900 capitalize leading-tight">
                  {currentMode === 'view'
                    ? (`${formData.firstName || ''} ${formData.lastName || ''}`.trim() || admin?.name || 'View Admin')
                    : currentMode === 'edit'
                    ? (`${formData.firstName || ''} ${formData.lastName || ''}`.trim() || admin?.name || 'Edit Admin')
                    : 'Create Admin'}
                </h3>
                {formData.adminId && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    ID: {formData.adminId}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isView ? 'View admin details and permissions.' : (isEdit ? 'Manage admin details and permissions.' : 'Add a new sub-admin to the system.')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form className="flex-1 flex flex-col justify-between overflow-hidden" onSubmit={handleSubmit}>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar relative pb-10">
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
          </div>

          {/* Form Actions Footer - Fixed at the bottom */}
          <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-end gap-3 shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm shadow-sm"
            >
              {isView ? 'Close' : 'Cancel'}
            </button>
            {isView && (
              <button 
                type="button"
                onClick={() => setCurrentMode('edit')}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
              >
                <Edit2 className="w-4 h-4" /> Edit Admin
              </button>
            )}
            {!isView && (
              <button 
                type="submit" 
                disabled={loading || !isFormValid} 
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> 
                    {currentMode === 'edit' ? 'Update Admin' : 'Register Admin'}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
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
