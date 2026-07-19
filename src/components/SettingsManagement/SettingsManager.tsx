import { useState } from 'react';
import { 
  Settings, Building2, Users, Shield, Key, CreditCard, Bell, 
  Mail, MessageSquare, Webhook, Globe, Receipt, Coins, Map, 
  MapPin, DatabaseBackup, Activity, HeartPulse, Wrench, Palette, Puzzle
} from 'lucide-react';
import { GeneralSettings } from './GeneralSettings';
import { AdminManagement } from './AdminManagement';
import { AuditLogs } from './AuditLogs';
import { SystemHealth } from './SystemHealth';
import { CompanyProfile } from './CompanyProfile';
import { PaymentGatewaySettings } from './PaymentGatewaySettings';
import { RolesPermissions } from './RolesPermissions';
import { MaintenanceMode } from './MaintenanceMode';

const MENU_GROUPS = [
  {
    title: 'Platform',
    items: [
      { id: 'general', label: 'General Settings', icon: Settings },
      { id: 'company', label: 'Company Profile', icon: Building2 },
      { id: 'theme', label: 'Theme & Branding', icon: Palette },
    ]
  },
  {
    title: 'Access Control',
    items: [
      { id: 'admins', label: 'Admin Accounts', icon: Users },
      { id: 'roles', label: 'Roles & Permissions', icon: Shield },
      { id: 'security', label: 'Security', icon: Key },
    ]
  },
  {
    title: 'Configuration',
    items: [
      { id: 'payments', label: 'Payment Gateway', icon: CreditCard },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'localization', label: 'Localization', icon: Globe },
      { id: 'taxes', label: 'Taxes', icon: Receipt },
      { id: 'currencies', label: 'Currencies', icon: Coins },
    ]
  },
  {
    title: 'Service Areas',
    items: [
      { id: 'cities', label: 'Cities', icon: MapPin },
      { id: 'zones', label: 'Service Zones', icon: Map },
    ]
  },
  {
    title: 'System & Logs',
    items: [
      { id: 'audit', label: 'Audit Logs', icon: Activity },
      { id: 'health', label: 'System Health', icon: HeartPulse },
      { id: 'backup', label: 'Backup & Restore', icon: DatabaseBackup },
      { id: 'maintenance', label: 'Maintenance Mode', icon: Wrench },
      { id: 'integrations', label: 'Integrations', icon: Puzzle },
    ]
  }
];

export function SettingsManager() {
  const [activeTab, setActiveTab] = useState('general');

  const renderContent = () => {
    const currentItem = MENU_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab);
    const Icon = currentItem?.icon || Settings;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{currentItem?.label || 'Settings'}</h2>
            <p className="text-slate-400 text-sm">Configure system preferences for {currentItem?.label.toLowerCase()}.</p>
          </div>
        </div>
        
        <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg p-8">
          {switchContent()}
        </div>
      </div>
    );
  };

  const switchContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'company':
        return <CompanyProfile />;
      case 'admins':
        return <AdminManagement />;
      case 'roles':
        return <RolesPermissions />;
      case 'payments':
        return <PaymentGatewaySettings />;
      case 'audit':
        return <AuditLogs />;
      case 'health':
        return <SystemHealth />;
      case 'maintenance':
        return <MaintenanceMode />;
      default:
        return (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <Settings className="w-16 h-16 text-slate-800 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Configuration Module</h2>
            <p className="text-slate-500 max-w-md">
              This module provides configuration options. Implementation is in progress for this section.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Settings Left Sidebar */}
      <div className="w-64 flex-shrink-0 bg-slate-900/50 border-r border-slate-800/60 overflow-y-auto custom-scrollbar flex flex-col">
        <div className="p-4 border-b border-slate-800/60 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
          <h2 className="font-bold text-white tracking-tight">System Settings</h2>
          <p className="text-xs text-slate-400 mt-0.5">Enterprise Configuration</p>
        </div>
        
        <div className="p-3 space-y-6">
          {MENU_GROUPS.map((group, gIdx) => (
            <div key={gIdx}>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Settings Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
