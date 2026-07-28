import { Search, Bell, MessageSquare, Moon, Globe, ChevronRight, LogOut } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export function Header({ sidebarCollapsed, onViewChange, onLogout }: { sidebarCollapsed: boolean, onViewChange: (view: string) => void, onLogout: () => void }) {
  const { toggleNotification, toggleMessage } = useUIStore();
  return (
    <header 
      className={`fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 transition-all duration-300 flex items-center justify-between px-6
        ${sidebarCollapsed ? 'left-20' : 'left-64'}
      `}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
          <span className="hover:text-red-700 cursor-pointer transition-colors">Admin</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-medium">Dashboard</span>
        </div>


      </div>

      <div className="flex items-center gap-3 ml-4">
        <button onClick={toggleNotification} className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>
        <button onClick={onLogout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>

        <button onClick={() => onViewChange('profile')} className="flex items-center gap-3 pl-2">
          {(() => {
            const profileString = localStorage.getItem('adminProfile');
            const profile = profileString ? JSON.parse(profileString) : null;
            const fullName = profile ? `${profile.firstName} ${profile.lastName}` : 'Admin User';
            const roleLabel = profile ? (profile.superAdmin ? 'Superadmin' : profile.role || 'Admin') : 'Superadmin';
            const avatarUrl = profile?.profileUrl && !profile.profileUrl.includes('example.com') 
              ? profile.profileUrl 
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=fff&color=2563eb`;
            return (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900 leading-tight">{fullName}</p>
                  <p className="text-xs text-red-600 capitalize">{roleLabel}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-red-600 p-[2px]">
                  <div className="w-full h-full bg-white rounded-full overflow-hidden border border-slate-200">
                    <img src={avatarUrl} alt="Admin" className="w-full h-full object-cover" />
                  </div>
                </div>
              </>
            );
          })()}
        </button>
      </div>
    </header>
  );
}
