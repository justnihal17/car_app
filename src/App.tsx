import React, { useState, useEffect } from "react";
import { LogOut, Trash2 } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardContent } from "./components/DashboardContent";
import { LoginPage } from "./components/auth/LoginPage";
import { NotificationPanel } from "./components/NotificationPanel";
import { MessagePanel } from "./components/MessagePanel";
import { EditProfileModal } from "./components/EditProfileModal";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { useUIStore } from "./store/uiStore";
import api from "./api/axios";
import { Toaster } from "react-hot-toast";
import { notificationService } from "./services/notification.service";
import { NotificationProvider } from "./context/NotificationContext";
import { NotificationPermissionGuard } from "./components/NotificationPermissionGuard";

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
      await notificationService.unregisterToken();
      await api.post('/admin/admin/logout');
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('adminProfile');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('currentView');
      setIsAuthenticated(false);
      setIsLogoutModalOpen(false);
    }
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    localStorage.setItem('currentView', view);
  };

  useEffect(() => {
    const handleNavigate = (e: any) => {
      if (e.detail && typeof e.detail === 'string') {
        handleViewChange(e.detail);
      } else if (e.detail && typeof e.detail === 'object' && e.detail.view) {
        handleViewChange(e.detail.view);
      }
    };
    const handleUnauthorized = () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('adminProfile');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('currentView');
      setIsAuthenticated(false);
    };
    window.addEventListener('navigate_view', handleNavigate as EventListener);
    window.addEventListener('auth_unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('navigate_view', handleNavigate as EventListener);
      window.removeEventListener('auth_unauthorized', handleUnauthorized);
    };
  }, []);

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <NotificationProvider>
      <NotificationPermissionGuard>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex">
          <Toaster 
            position="top-center" 
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#0f172a',
                borderRadius: '16px',
                padding: '14px 18px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                fontWeight: '500',
                maxWidth: '600px',
                lineHeight: '1.5',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#fff' },
                style: {
                  background: '#ffffff',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                },
              },
              error: {
                duration: 6000,
                icon: (
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0 mt-0.5">
                    <Trash2 className="w-4 h-4" />
                  </div>
                ),
                style: {
                  background: '#ffffff',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  alignItems: 'flex-start',
                  boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
                },
              },
            }}
          />
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
        className={`transition-all duration-300 flex-1 w-full min-w-0 flex flex-col ${collapsed ? 'pl-20' : 'pl-[285px]'}`}
      >
        <Header sidebarCollapsed={collapsed} onViewChange={handleViewChange} onLogout={handleLogoutRequest} />
        <main className="pt-16 flex-1 w-full min-w-0">
          <DashboardContent currentView={currentView} onViewChange={handleViewChange} />
        </main>
      </div>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        actionType="logout"
        onCancel={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </div>
    </NotificationPermissionGuard>
    </NotificationProvider>
  );
}
