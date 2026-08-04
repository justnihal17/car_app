import { useState, useRef, useEffect } from 'react';
import { Search, Bell, MessageSquare, Moon, Globe, ChevronRight, LogOut, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { usePushNotifications } from '../context/NotificationContext';
import { SafeImage } from './common/SafeImage';

export function Header({ sidebarCollapsed, onViewChange, onLogout }: { sidebarCollapsed: boolean, onViewChange: (view: string) => void, onLogout: () => void }) {
  const { toggleNotification } = useUIStore();
  const { unreadCount } = usePushNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const profileString = localStorage.getItem('adminProfile');
  const profile = profileString ? JSON.parse(profileString) : null;
  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : 'Suaib';
  const email = profile ? profile.email : 'suaib@sellmybooks.com';
  const avatarUrl = profile?.profileUrl && !profile.profileUrl.includes('example.com') 
    ? profile.profileUrl 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1e293b&color=fff`;

  return (
    <header 
      className={`fixed top-0 right-0 h-16 bg-[#F8FAFC] border-b border-slate-200 z-40 transition-all duration-300 flex items-center justify-between px-6
        ${sidebarCollapsed ? 'left-20' : 'left-[285px]'}
      `}
    >
      <div className="flex items-center gap-4 flex-1">
      </div>

      <div className="flex items-center gap-4 ml-4">
        <button onClick={toggleNotification} className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors" title="Notifications">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[8px] h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
          )}
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            className="flex items-center gap-2 pl-2"
          >
            <div className="w-10 h-10 rounded-full bg-[#1A1C20] flex items-center justify-center overflow-hidden border border-slate-200 text-white font-medium text-base">
              {profile?.profileUrl ? (
                <SafeImage src={avatarUrl} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                fullName.charAt(0).toUpperCase()
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-700" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-[3.25rem] w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-4 py-3">
                <p className="text-[15px] font-semibold text-slate-900">{fullName}</p>
                <p className="text-sm text-slate-500 mt-0.5 truncate">{email}</p>
              </div>
              <div className="border-t border-slate-100 my-1"></div>
              
              <button 
                onClick={() => { setIsDropdownOpen(false); onViewChange('profile'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <SettingsIcon className="w-[18px] h-[18px] text-slate-500" />
                <span>Settings</span>
              </button>
              
              <button 
                onClick={() => { setIsDropdownOpen(false); onLogout(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] text-[#F91B4C] hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-[18px] h-[18px]" />
                <span className="font-medium">Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
