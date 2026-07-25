import React, { useState } from "react";
import { LogOut } from "lucide-react";
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
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('adminProfile');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      setIsAuthenticated(false);
      setIsLogoutModalOpen(false);
    }
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    localStorage.setItem('currentView', view);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex">
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
        className={`transition-all duration-300 flex-1 w-full min-w-0 flex flex-col ${collapsed ? 'pl-20' : 'pl-64'}`}
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
  );
}
