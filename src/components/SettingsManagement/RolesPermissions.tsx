import { useState } from 'react';
import { Save, Shield, Check, X, Users } from 'lucide-react';

export function RolesPermissions() {
  const [activeRole, setActiveRole] = useState('Operations Manager');
  const [isSaving, setIsSaving] = useState(false);

  const roles = ['Super Admin', 'Operations Manager', 'Finance Manager', 'Customer Support', 'Driver Manager'];
  
  const permissions = [
    { module: 'Dashboard', actions: ['View', 'Export'] },
    { module: 'User Management', actions: ['View', 'Create', 'Update', 'Delete'] },
    { module: 'Driver Management', actions: ['View', 'Create', 'Update', 'Delete', 'Approve'] },
    { module: 'Order Management', actions: ['View', 'Create', 'Update', 'Delete', 'Assign'] },
    { module: 'Payment Management', actions: ['View', 'Update', 'Export', 'Refund'] },
    { module: 'Settings', actions: ['View', 'Update'] },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Roles & Permissions</h2>
          <p className="text-sm text-slate-400 mt-1">Configure access control for admin accounts</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/20 transition-all text-sm"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Roles List */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center justify-between group ${
                activeRole === role
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-[#0f1218] border border-slate-800/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className="font-medium text-sm">{role}</span>
              {role === 'Super Admin' && <Shield className="w-4 h-4 opacity-50" />}
              {role !== 'Super Admin' && <Users className="w-4 h-4 opacity-50" />}
            </button>
          ))}
          <button className="w-full text-left px-4 py-3 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:text-white hover:border-slate-500 transition-colors font-medium text-sm text-center">
            + Create Custom Role
          </button>
        </div>

        {/* Permissions Matrix */}
        <div className="flex-1 bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden">
          <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
             <h3 className="text-sm font-bold text-white flex items-center gap-2">
               <Shield className="w-4 h-4 text-emerald-500" />
               {activeRole} Permissions
             </h3>
             {activeRole === 'Super Admin' && (
               <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">Full Access Granted</span>
             )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="px-5 py-4 font-medium w-1/3">Module</th>
                  <th className="px-5 py-4 font-medium">Permissions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-800">
                {permissions.map((perm, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-300">
                      {perm.module}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-3">
                        {perm.actions.map(action => {
                          // Mock logic for disabled/checked state
                          const isSuperAdmin = activeRole === 'Super Admin';
                          const isChecked = isSuperAdmin || Math.random() > 0.3;
                          
                          return (
                            <label key={action} className={`flex items-center gap-2 cursor-pointer ${isSuperAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}>
                              <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                                isChecked 
                                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                                  : 'bg-slate-900 border-slate-700'
                              }`}>
                                {isChecked && <Check className="w-3 h-3" />}
                              </div>
                              <span className="text-xs font-medium text-slate-400">{action}</span>
                            </label>
                          )
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
