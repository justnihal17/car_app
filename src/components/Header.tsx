import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, MessageSquare, Moon, Globe, ChevronRight, LogOut, Settings as SettingsIcon, ChevronDown, Check, CheckCircle2, Circle, Smartphone } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { usePushNotifications } from '../context/NotificationContext';
import { SafeImage } from './common/SafeImage';
import { formatDistanceToNow } from 'date-fns';

export function Header({ sidebarCollapsed, onLogout }: { sidebarCollapsed: boolean, onLogout: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, markRead, markAllRead } = usePushNotifications();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

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
    markRead(id);
    setIsNotifOpen(false);
    
    if (actionUrl) {
      if (actionUrl === '/orders' || actionUrl === '/order' || actionUrl.includes('orders') || actionUrl.includes('order')) {
        const targetId = entityId || referenceId || (actionUrl.includes('orders/') ? actionUrl.split('orders/')[1] : (actionUrl.includes('order/') ? actionUrl.split('order/')[1] : null));
        if (targetId) {
          navigate(`/order/${targetId}`);
        } else {
          navigate('/order');
        }
      } else {
        navigate(actionUrl.startsWith('/') ? actionUrl : `/${actionUrl}`);
      }
    }
  };

  const profileString = sessionStorage.getItem('adminProfile');
  const profile = profileString ? JSON.parse(profileString) : null;
  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : 'Suaib';
  const email = profile ? profile.email : 'suaib@sellmybooks.com';
  const avatarUrl = profile?.profileUrl && !profile.profileUrl.includes('example.com') 
    ? profile.profileUrl 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1e293b&color=fff`;

  return (
    <header 
      className={`fixed top-0 right-0 h-13 bg-[#F8FAFC] border-b border-slate-200 z-40 transition-all duration-300 flex items-center justify-between px-3 sm:px-4
        ${sidebarCollapsed ? 'left-16' : 'left-sidebar'}
      `}
    >
      <div className="flex items-center gap-4 flex-1">
      </div>

      <div className="flex items-center gap-3 ml-4">
        {/* App / Website Toggle */}
        {(() => {
          const isWebsite = location.pathname.startsWith('/website');
          return (
            <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg border border-slate-200/80 h-7.5">
              <button 
                onClick={() => {
                  if (isWebsite) navigate('/');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] transition-all h-full cursor-pointer ${
                  !isWebsite
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
                title="Switch to App Administration"
              >
                <Smartphone className={`w-3.5 h-3.5 ${!isWebsite ? 'text-red-600' : 'text-slate-500'}`} />
                App
              </button>
              <button 
                onClick={() => {
                  if (!isWebsite) navigate('/website/home-services');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] transition-all h-full cursor-pointer ${
                  isWebsite
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
                title="Switch to Website CMS"
              >
                <Globe className={`w-3.5 h-3.5 ${isWebsite ? 'text-red-600' : 'text-slate-500'}`} />
                Website
              </button>
            </div>
          );
        })()}

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)} 
            className="relative p-1.5 text-slate-600 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors" 
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full ring-2 ring-[#F8FAFC] px-0.5">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-10 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200 z-50 overflow-hidden flex flex-col max-h-[80vh]">
              <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAllRead()}
                    className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>
              
              <div className="overflow-y-auto custom-scrollbar flex-1">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                      <Bell className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-xs font-semibold text-slate-900">No notifications yet</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 max-w-44">New order and system alerts will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.slice(0, 5).map(notif => (
                      <div 
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif.id, notif.actionUrl, notif.referenceId, notif.entityId)}
                        className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer group flex items-start gap-2.5 ${!notif.isRead ? 'bg-red-50/30' : ''}`}
                      >
                        <div className={`mt-0.5 shrink-0 ${!notif.isRead ? 'text-red-500' : 'text-slate-400'}`}>
                          {!notif.isRead ? <Circle fill="currentColor" className="w-2 h-2 mt-1" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs tracking-tight truncate ${!notif.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {notif.title}
                          </p>
                          <p className={`text-[11px] mt-0.5 line-clamp-2 ${!notif.isRead ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                            {notif.message}
                          </p>
                          <p className="text-[9px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-1.5 border-t border-slate-100 bg-slate-50/50">
                <button 
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate('/notifications');
                  }}
                  className="w-full py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors text-center"
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
            className="flex items-center gap-1.5 pl-1.5"
          >
            <div className="w-7.5 h-7.5 rounded-full bg-[#1A1C20] flex items-center justify-center overflow-hidden border border-slate-200 text-white font-medium text-xs">
              {profile?.profileUrl ? (
                <SafeImage src={avatarUrl} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                fullName.charAt(0).toUpperCase()
              )}
            </div>
            <ChevronDown className="w-3 h-3 text-slate-600" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-10 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-3.5 py-2">
                <p className="text-xs font-bold text-slate-900">{fullName}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{email}</p>
              </div>
              <div className="border-t border-slate-100 my-1"></div>
              
              <button 
                onClick={() => { setIsDropdownOpen(false); navigate('/profile'); }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Settings</span>
              </button>
              
              <button 
                onClick={() => { setIsDropdownOpen(false); onLogout(); }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span className="font-semibold">Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
