import { Shield, Mail, User, Clock, MapPin } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export function ProfileView() {
  const { toggleEditProfile } = useUIStore();
  const profileString = localStorage.getItem('adminProfile');
  const profile = profileString ? JSON.parse(profileString) : null;

  const firstName = profile?.firstName || 'Admin';
  const lastName = profile?.lastName || 'User';
  const fullName = `${firstName} ${lastName}`;
  const email = profile?.email || 'admin@carway.com';
  const phone = profile?.phone || '+971500000000';
  const roleLabel = profile ? (profile.superAdmin ? 'Superadmin' : profile.role || 'Admin') : 'Superadmin';
  const avatarUrl = profile?.profileUrl && !profile.profileUrl.includes('example.com') 
    ? profile.profileUrl 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2563eb&color=fff&size=256`;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Admin Profile</h2>
        <button onClick={toggleEditProfile} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Avatar and Basic Info */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 p-1 mb-6">
            <img src={avatarUrl} alt="Admin" className="w-full h-full rounded-full object-cover bg-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{fullName}</h3>
          <p className="text-blue-600 font-medium mb-4 capitalize">{roleLabel}</p>
          <div className="w-full pt-6 border-t border-slate-150 space-y-3 text-sm text-slate-500">
            <div className="flex items-center gap-2 justify-center"><MapPin className="w-4 h-4" /> Dubai, UAE</div>
          </div>
        </div>

        {/* Right: Detailed Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
            <h4 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> Personal Information
            </h4>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <label className="text-slate-500 font-medium">First Name</label>
                <p className="text-slate-800 mt-1 text-base">{firstName}</p>
              </div>
              <div>
                <label className="text-slate-500 font-medium">Last Name</label>
                <p className="text-slate-800 mt-1 text-base">{lastName}</p>
              </div>
              <div>
                <label className="text-slate-500 font-medium">Email Address</label>
                <p className="text-slate-800 mt-1 text-base">{email}</p>
              </div>
              <div>
                <label className="text-slate-500 font-medium">Phone</label>
                <p className="text-slate-800 mt-1 text-base">{phone}</p>
              </div>
              <div>
                <label className="text-slate-500 font-medium">Role</label>
                <p className="text-slate-800 mt-1 text-base capitalize">{profile?.role || 'Administrator'}</p>
              </div>
              <div>
                <label className="text-slate-500 font-medium">Admin ID</label>
                <p className="text-slate-800 mt-1 text-base font-mono">{profile?.adminId || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
            <h4 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" /> Security & Activity
            </h4>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <label className="text-slate-500 font-medium">Last Login</label>
                <p className="text-slate-800 mt-1 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400"/> {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : 'Today, 00:00'}</p>
              </div>
              <div>
                <label className="text-slate-500 font-medium">Account Status</label>
                <div>
                  <span className="inline-block px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs mt-1 border border-green-200">
                    {profile?.active ? 'Active' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

