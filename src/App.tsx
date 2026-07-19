import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardContent } from "./components/DashboardContent";
import { LoginPage } from "./components/auth/LoginPage";
import { NotificationPanel } from "./components/NotificationPanel";
import { MessagePanel } from "./components/MessagePanel";
import { EditProfileModal } from "./components/EditProfileModal";
import { useUIStore } from "./store/uiStore";
import api from "./api/axios";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('accessToken');
  });
  const [collapsed, setCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const { isNotificationOpen, isMessageOpen, isEditProfileOpen, toggleNotification, toggleMessage, toggleEditProfile } = useUIStore();

  const handleLogout = async () => {
    try {
      await api.post('/admin/admin/logout');
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      localStorage.removeItem('adminProfile');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
      {isNotificationOpen && <NotificationPanel onClose={toggleNotification} />}
      {isMessageOpen && <MessagePanel onClose={toggleMessage} />}
      {isEditProfileOpen && <EditProfileModal />}
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        currentView={currentView}
        onViewChange={(view) => {
          if (view === 'logout') {
            handleLogout();
          } else {
            setCurrentView(view);
          }
        }}
      />
      
      <div 
        className={`transition-all duration-300 ${collapsed ? 'pl-20' : 'pl-64'}`}
      >
        <Header sidebarCollapsed={collapsed} onViewChange={setCurrentView} onLogout={handleLogout} />
        <main className="pt-16">
          <DashboardContent currentView={currentView} onViewChange={setCurrentView} />
        </main>
      </div>
    </div>
  );
}
