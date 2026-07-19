import { FileText, Plus } from 'lucide-react';

export function WelcomeSection({ onViewChange }: { onViewChange: (view: string) => void }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative z-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Good Morning, Admin 👋</h1>
        <p className="text-slate-500 text-sm mb-4">{today}</p>
        
        <div className="flex items-center gap-6 text-sm">
          <div className="flex flex-col">
            <span className="text-slate-500">Business Status</span>
            <span className="text-emerald-600 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All systems optimal
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="flex flex-col">
            <span className="text-slate-500">Active Fleet</span>
            <span className="text-slate-900 font-medium">1,248 vehicles</span>
          </div>
          <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
          <div className="flex flex-col hidden sm:flex">
            <span className="text-slate-500">Daily Target</span>
            <span className="text-slate-900 font-medium">84% achieved</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 relative z-10">
        <button onClick={() => onViewChange('reports')} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl border border-slate-200 transition-all shadow-sm">
          <FileText className="w-4 h-4" />
          View Reports
        </button>
        <button onClick={() => onViewChange('orders')} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-900/10 transition-all group">
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          Create New Order
        </button>
      </div>
    </section>
  );
}
