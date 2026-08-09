import { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import api from '../api/axios';
import toast from 'react-hot-toast';

export function EditProfileModal() {
  const { isEditProfileOpen, toggleEditProfile } = useUIStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const profileString = sessionStorage.getItem('adminProfile');
  const profile = profileString ? JSON.parse(profileString) : null;

  useEffect(() => {
    if (isEditProfileOpen && profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        password: '',
      });
    }
  }, [isEditProfileOpen]);

  if (!isEditProfileOpen || !profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: profile.role || 'admin',
        profileUrl: profile.profileUrl || '',
        active: profile.active !== false,
        blocked: !!profile.blocked,
        permissions: profile.permissions || {}
      };
      if (formData.password) {
        payload.password = formData.password;
      }
      
      const response = await api.put(`/admin/admin/${profile._id}`, payload);
      if (response.data?.success) {
        toast.success(response.data?.message || 'Profile updated successfully');
        const updatedProfile = response.data.data;
        sessionStorage.setItem('adminProfile', JSON.stringify(updatedProfile));
        toggleEditProfile();
        
        window.dispatchEvent(new Event('storage'));
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-lg shadow-xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sans">Edit Profile</h2>
          <p className="text-sm text-slate-500 mt-1">Update your personal account information.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input 
                type="text" 
                required 
                value={formData.firstName} 
                onChange={e => setFormData({ ...formData, firstName: e.target.value })} 
                placeholder="First Name" 
                className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input 
                type="text" 
                required 
                value={formData.lastName} 
                onChange={e => setFormData({ ...formData, lastName: e.target.value })} 
                placeholder="Last Name" 
                className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              required 
              value={formData.email} 
              onChange={e => setFormData({ ...formData, email: e.target.value })} 
              placeholder="Email Address" 
              className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input 
              type="text" 
              required 
              value={formData.phone} 
              onChange={e => setFormData({ ...formData, phone: e.target.value })} 
              placeholder="Phone Number" 
              className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={e => setFormData({ ...formData, password: e.target.value })} 
              placeholder="Enter password" 
              className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white" 
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              disabled={loading} 
              onClick={toggleEditProfile} 
              className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold text-sm shadow-md shadow-blue-200"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
