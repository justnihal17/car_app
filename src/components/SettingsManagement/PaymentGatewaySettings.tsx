import { useState } from 'react';
import { Save, CreditCard, DollarSign, Key, Webhook } from 'lucide-react';

export function PaymentGatewaySettings() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Payment Gateways</h2>
          <p className="text-sm text-slate-400 mt-1">Configure payment providers and API keys</p>
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

      <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden">
        
        {/* Stripe Configuration */}
        <div className="p-6 border-b border-slate-800/60">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Stripe Configuration</h3>
                <p className="text-xs text-slate-400">Primary payment processor for cards</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input type="radio" name="stripe-mode" className="text-emerald-500 bg-slate-900 border-slate-700" defaultChecked /> Test Mode
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input type="radio" name="stripe-mode" className="text-emerald-500 bg-slate-900 border-slate-700" /> Live Mode
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Key className="w-3 h-3"/> Publishable Key</label>
              <input 
                type="text" 
                defaultValue="pk_test_your_publishable_key"
                className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Key className="w-3 h-3"/> Secret Key</label>
              <input 
                type="password" 
                defaultValue="sk_test_your_secret_key"
                className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Webhook className="w-3 h-3"/> Webhook Secret</label>
              <input 
                type="password" 
                defaultValue="whsec_your_webhook_secret"
                className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Cash Configuration */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cash on Delivery</h3>
                <p className="text-xs text-slate-400">Allow customers to pay drivers with cash</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
