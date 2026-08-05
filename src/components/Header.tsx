import { useState, useRef, useEffect } from 'react';
import { Search, Bell, MessageSquare, Moon, Globe, ChevronRight, LogOut, Settings as SettingsIcon, ChevronDown, Check, CheckCircle2, Circle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { markAsRead, markAllAsRead, fetchNotifications } from '../store/notificationSlice';
import { SafeImage } from './common/SafeImage';
import { formatDistanceToNow } from 'date-fns';

export function Header({ sidebarCollapsed, onViewChange, onLogout }: { sidebarCollapsed: boolean, onViewChange: (view: string) => void, onLogout: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (id: string, actionUrl?: string, referenceId?: string, entityId?: string) => {
    dispatch(markAsRead(id));
    setIsNotifOpen(false);
    
    if (actionUrl) {
      if (actionUrl === '/orders' || actionUrl.includes('orders')) {
        const targetId = entityId || referenceId;
        if (targetId) {
          localStorage.setItem('pending_order_id', targetId);
        }
        onViewChange('orders');
        if (targetId) {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('select_order', { detail: targetId }));
          }, 100);
        }
      } else {
        onViewChange(actionUrl);
      }
    }
  };

  const profileString = localStorage.getItem('adminProfile');
  const profile = profileString ? JSON.parse(profileString) : null;
  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : 'Suaib';
  const email = profile ? profile.email : 'suaib@sellmybooks.com';
  const avatarUrl = profile?.profileUrl && !profile.profileUrl.includes('example.com') 
    ? profile.profileUrl 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1e293b&color=fff`;

  return (
    <header 
      className={`fixed top-0 right-0 h-header bg-[#F8FAFC] border-b border-slate-200 z-40 transition-all duration-300 flex items-center justify-between px-6
        ${sidebarCollapsed ? 'left-20' : 'left-sidebar'}
      `}
    >
      <div className="flex items-center gap-4 flex-1">
      </div>

      <div className="flex items-center gap-4 ml-4">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)} 
            className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors" 
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full ring-2 ring-[#F8FAFC] px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-[3.25rem] w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200 z-50 overflow-hidden flex flex-col max-h-[85vh]">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => dispatch(markAllAsRead())}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>
              
              <div className="overflow-y-auto custom-scrollbar flex-1">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                      <Bell className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">No notifications yet</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-[200px]">New order and system alerts will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.slice(0, 5).map(notif => (
                      <div 
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif.id, notif.actionUrl, notif.referenceId, notif.entityId)}
                        className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer group flex items-start gap-3 ${!notif.isRead ? 'bg-red-50/30' : ''}`}
                      >
                        <div className={`mt-0.5 shrink-0 ${!notif.isRead ? 'text-red-500' : 'text-slate-400'}`}>
                          {!notif.isRead ? <Circle fill="currentColor" className="w-2.5 h-2.5 mt-1" /> : <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm tracking-tight truncate ${!notif.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {notif.title}
                          </p>
                          <p className={`text-xs mt-0.5 line-clamp-2 ${!notif.isRead ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                            {notif.message}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-1.5 uppercase tracking-wider">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                <button 
                  onClick={() => {
                    setIsNotifOpen(false);
                    onViewChange('notifications');
                  }}
                  className="w-full py-2 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-center"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Profile Dropdown */}
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
