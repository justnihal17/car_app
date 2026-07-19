import { useState } from 'react';
import { Save, Upload, MapPin, Building, Briefcase } from 'lucide-react';

export function CompanyProfile() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Company Profile</h2>
          <p className="text-sm text-slate-400 mt-1">Manage corporate information and billing details</p>
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
        
        {/* Core Info */}
        <section>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-500" /> Corporate Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Legal Company Name</label>
              <input 
                type="text" 
                defaultValue="CAFU Tech LLC"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Registration Number</label>
              <input 
                type="text" 
                defaultValue="REG-9948212"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tax/VAT Number</label>
              <input 
                type="text" 
                defaultValue="TRN-100293482"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Corporate Website</label>
              <input 
                type="url" 
                defaultValue="https://cafu-clone.com"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>
        </section>

        <div className="h-px bg-slate-800/60 w-full"></div>

        {/* Address */}
        <section>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-500" /> Headquarters Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Street Address</label>
              <input 
                type="text" 
                defaultValue="101 Innovation Hub, Dubai Internet City"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">City</label>
              <input 
                type="text" 
                defaultValue="Dubai"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">State/Emirate</label>
              <input 
                type="text" 
                defaultValue="Dubai"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Postal Code</label>
              <input 
                type="text" 
                defaultValue="500001"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Country</label>
              <select className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors">
                <option>United Arab Emirates</option>
                <option>Saudi Arabia</option>
                <option>Oman</option>
              </select>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
