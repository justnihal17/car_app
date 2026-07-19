import { useState } from 'react';
import { Save, Upload, Globe, Clock, Monitor } from 'lucide-react';

export function GeneralSettings() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">General Settings</h2>
          <p className="text-sm text-slate-400 mt-1">Manage your platform's core configuration</p>
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

      <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg p-6 space-y-8">
        
        {/* Branding */}
        <section>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-emerald-500" /> Platform Branding
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Platform Name</label>
              <input 
                type="text" 
                defaultValue="CAFU Admin"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Platform URL</label>
              <input 
                type="text" 
                defaultValue="https://admin.cafu-clone.com"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Platform Logo</label>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center">
                  <span className="text-emerald-500 font-bold text-xl">C</span>
                </div>
                <div className="flex-1">
                  <button className="px-4 py-2 bg-slate-900 border border-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Upload New Logo
                  </button>
                  <p className="text-xs text-slate-500 mt-2">Recommended size: 256x256px. PNG or SVG only.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-slate-800/60 w-full"></div>

        {/* Support */}
        <section>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-500" /> Contact & Localization
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Support Email</label>
              <input 
                type="email" 
                defaultValue="support@cafu-clone.com"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Support Phone</label>
              <input 
                type="text" 
                defaultValue="+971 800 2238"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Default Language</label>
              <select className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors">
                <option>English (US)</option>
                <option>Arabic</option>
                <option>French</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Default Currency</label>
              <select className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors">
                <option>AED - UAE Dirham</option>
                <option>USD - US Dollar</option>
                <option>EUR - Euro</option>
              </select>
            </div>
          </div>
        </section>

        <div className="h-px bg-slate-800/60 w-full"></div>

        {/* Date & Time */}
        <section>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500" /> Date & Time
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Timezone</label>
              <select className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors">
                <option>(UTC+04:00) Abu Dhabi, Muscat</option>
                <option>(UTC+00:00) London</option>
                <option>(UTC-05:00) Eastern Time (US & Canada)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date Format</label>
              <select className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors">
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Time Format</label>
              <select className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors">
                <option>12-hour (1:00 PM)</option>
                <option>24-hour (13:00)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Business Hours</label>
              <input 
                type="text" 
                defaultValue="24/7"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
