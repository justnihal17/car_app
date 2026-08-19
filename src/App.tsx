import React, { useState, useEffect, Suspense } from "react";
import { LogOut, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { AppRoutes } from "./components/AppRoutes";
import { LoginPage } from "./components/auth/LoginPage";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { useUIStore } from "./store/uiStore";
import api from "./api/axios";
import { Toaster } from "react-hot-toast";
import { notificationService } from "./services/notification.service";
import { NotificationProvider } from "./context/NotificationContext";
import { NotificationPermissionGuard } from "./components/NotificationPermissionGuard";

// Lazy-load overlay panels (only rendered when user opens them)
const NotificationPanel = React.lazy(() => import("./components/NotificationPanel").then(m => ({ default: m.NotificationPanel })));
const MessagePanel = React.lazy(() => import("./components/MessagePanel").then(m => ({ default: m.MessagePanel })));
const EditProfileModal = React.lazy(() => import("./components/EditProfileModal").then(m => ({ default: m.EditProfileModal })));

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!sessionStorage.getItem('accessToken');
  });
  const [collapsed, setCollapsed] = useState(false);
  const { isNotificationOpen, isMessageOpen, isEditProfileOpen, toggleNotification, toggleMessage, toggleEditProfile } = useUIStore();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

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
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('adminProfile');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userEmail');
      sessionStorage.removeItem('userName');
      localStorage.removeItem('currentView');
      setIsAuthenticated(false);
      setIsLogoutModalOpen(false);
    }
  };

  useEffect(() => {
    const handleNavigate = (e: any) => {
      const view = typeof e.detail === 'string' ? e.detail : e.detail?.view;
      if (view) {
        navigate(view.startsWith('/') ? view : `/${view}`);
      }
    };
    const handleUnauthorized = () => {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('adminProfile');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userEmail');
      sessionStorage.removeItem('userName');
      localStorage.removeItem('currentView');
      setIsAuthenticated(false);
    };
    window.addEventListener('navigate_view', handleNavigate as EventListener);
    window.addEventListener('auth_unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('navigate_view', handleNavigate as EventListener);
      window.removeEventListener('auth_unauthorized', handleUnauthorized);
    };
  }, [navigate]);

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
      <Suspense fallback={null}>
        {isNotificationOpen && <NotificationPanel onClose={toggleNotification} />}
        {isMessageOpen && <MessagePanel onClose={toggleMessage} />}
        {isEditProfileOpen && <EditProfileModal />}
      </Suspense>
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        onLogout={handleLogoutRequest}
      />
      
      <div 
        className={`transition-all duration-300 flex-1 w-full min-w-0 flex flex-col ${collapsed ? 'pl-20' : 'xl:pl-sidebar lg:pl-64 pl-sidebar'}`}
      >
        <Header sidebarCollapsed={collapsed} onLogout={handleLogoutRequest} />
        <main className="pt-14 2xl:pt-header flex-1 w-full min-w-0">
          <div className="max-w-[1600px] mx-auto w-full">
            <AppRoutes />
          </div>
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
