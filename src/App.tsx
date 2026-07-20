import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardContent } from "./components/DashboardContent";
import { LoginPage } from "./components/auth/LoginPage";
import { NotificationPanel } from "./components/NotificationPanel";
import { MessagePanel } from "./components/MessagePanel";
import { EditProfileModal } from "./components/EditProfileModal";
import { useUIStore } from "./store/uiStore";
import api from "./api/axios";
import { Toaster } from "react-hot-toast";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('accessToken');
  });
  const [collapsed, setCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('currentView') || "dashboard";
  });
  const { isNotificationOpen, isMessageOpen, isEditProfileOpen, toggleNotification, toggleMessage, toggleEditProfile } = useUIStore();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutRequest = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    try {
      await api.post('/admin/admin/logout');
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      localStorage.removeItem('adminProfile');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentView');
      setIsAuthenticated(false);
      setIsLogoutModalOpen(false);
    }
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    localStorage.setItem('currentView', view);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-center" />
        <LoginPage onLogin={() => setIsAuthenticated(true)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
      <Toaster position="top-center" />
      {isNotificationOpen && <NotificationPanel onClose={toggleNotification} />}
      {isMessageOpen && <MessagePanel onClose={toggleMessage} />}
      {isEditProfileOpen && <EditProfileModal />}
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        currentView={currentView}
        onViewChange={(view) => {
          if (view === 'logout') {
            handleLogoutRequest();
          } else {
            handleViewChange(view);
          }
        }}
      />
      
      <div 
        className={`transition-all duration-300 ${collapsed ? 'pl-20' : 'pl-64'}`}
      >
        <Header sidebarCollapsed={collapsed} onViewChange={handleViewChange} onLogout={handleLogoutRequest} />
        <main className="pt-16">
          <DashboardContent currentView={currentView} onViewChange={handleViewChange} />
        </main>
      </div>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 shadow-inner border border-red-100">
              <LogOut className="w-8 h-8 ml-1" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Logout</h3>
            <p className="text-slate-500 font-medium text-sm mb-8 px-4">
              Are you sure you want to logout from your account?
            </p>
            <div className="flex items-center gap-3 w-full">
              <button 
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-md shadow-red-500/20 transition-all active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
