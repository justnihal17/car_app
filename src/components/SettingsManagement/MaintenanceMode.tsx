import { useState } from 'react';
import { Save, Wrench, AlertTriangle, Clock, MapPin } from 'lucide-react';

export function MaintenanceMode() {
  const [isSaving, setIsSaving] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Maintenance Mode</h2>
          <p className="text-sm text-slate-400 mt-1">Temporarily disable access to the platform for updates</p>
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

      <div className={`rounded-xl border ${isMaintenance ? 'bg-red-500/5 border-red-500/30' : 'bg-[#0f1218] border-slate-800/60'} shadow-lg overflow-hidden transition-colors`}>
        <div className="p-6 border-b border-slate-800/60">
          <div className="flex items-start justify-between gap-4">
             <div className="flex gap-4">
                <div className={`p-3 rounded-xl border ${isMaintenance ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                   <Wrench className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-white tracking-tight">Enable Maintenance Mode</h3>
                   <p className="text-sm text-slate-400 mt-1 max-w-md">When enabled, the user-facing application will display a maintenance page. Admin panel will remain accessible.</p>
                </div>
             </div>
             <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input type="checkbox" className="sr-only peer" checked={isMaintenance} onChange={(e) => setIsMaintenance(e.target.checked)} />
              <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
        </div>

        <div className={`p-6 space-y-6 transition-all duration-300 ${isMaintenance ? 'opacity-100' : 'opacity-50 pointer-events-none grayscale'}`}>
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
               <AlertTriangle className="w-3 h-3"/> Maintenance Message
             </label>
             <textarea 
               rows={3}
               defaultValue="We are currently undergoing scheduled maintenance to improve our services. We will be back shortly!"
               className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
             />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                 <Clock className="w-3 h-3"/> Estimated Finish Time
               </label>
               <input 
                 type="datetime-local" 
                 className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                 <MapPin className="w-3 h-3"/> Allowed IP Addresses (Whitelist)
               </label>
               <input 
                 type="text" 
                 placeholder="e.g. 192.168.1.1, 10.0.0.5"
                 defaultValue="127.0.0.1"
                 className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm font-mono"
               />
               <p className="text-xs text-slate-500 mt-1">Comma separated list of IPs that can bypass maintenance mode.</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
