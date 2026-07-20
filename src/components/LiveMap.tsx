import { Map, Navigation, User, Car } from 'lucide-react';

export function LiveMap() {
  return (
    <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden flex flex-col h-[400px]">
      <div className="p-5 border-b border-slate-800/60 flex items-center justify-between z-10 bg-[#0f1218]">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Map className="w-5 h-5 text-emerald-400" />
          Live Fleet Tracking
        </h2>
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-full">
            <Car className="w-3 h-3 text-emerald-400" /> 142 Active
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-full">
            <User className="w-3 h-3 text-blue-400" /> 315 Customers
          </span>
        </div>
      </div>
      
      <div className="flex-1 relative bg-[#05070a] overflow-hidden">
        {/* Placeholder Map Background - Using SVG patterns and gradients for a sleek dark map look */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#34d399 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>
        
        {/* Map Elements / Roads (Abstract) */}
        <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
          <path d="M0,100 Q200,150 400,100 T800,200 T1200,100" stroke="#34d399" strokeWidth="4" fill="none" />
          <path d="M100,0 Q150,200 100,400 T200,800 T100,1200" stroke="#3b82f6" strokeWidth="4" fill="none" />
          <path d="M400,0 Q350,200 500,400 T400,800" stroke="#3b82f6" strokeWidth="4" fill="none" />
        </svg>

        {/* Mock Pins */}
        <div className="absolute top-[30%] left-[20%] animate-pulse">
          <div className="relative">
            <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.6)] border-2 border-[#111814]"></div>
            <div className="absolute -top-8 -left-8 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap border border-slate-700 font-medium">
              Driver: Smith
            </div>
          </div>
        </div>

        <div className="absolute top-[60%] left-[45%]">
          <div className="relative">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] border-2 border-[#111814]"></div>
          </div>
        </div>
        
        <div className="absolute top-[20%] left-[65%]">
          <div className="relative group cursor-pointer">
            <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.6)] border-2 border-[#111814]"></div>
            {/* Expanded details card on hover/active mock */}
            <div className="absolute top-6 -left-24 bg-[#0f1218] border border-slate-700 rounded-xl p-3 shadow-xl w-48 z-20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <Car className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Driver: K. Lee</div>
                  <div className="text-[10px] text-slate-400">ETA: 4 mins</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500">Service: Fuel</span>
                <span className="text-emerald-400 font-medium">On Way</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-[75%] left-[80%] animate-pulse">
          <div className="relative">
            <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.6)] border-2 border-[#111814]"></div>
          </div>
        </div>

        <div className="absolute top-[50%] left-[25%]">
          <div className="relative">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] border-2 border-[#111814]"></div>
          </div>
        </div>

        {/* Route Line Mock */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <line x1="65%" y1="20%" x2="45%" y2="60%" stroke="#34d399" strokeWidth="2" strokeDasharray="4 4" className="opacity-50" />
          <line x1="20%" y1="30%" x2="25%" y2="50%" stroke="#34d399" strokeWidth="2" strokeDasharray="4 4" className="opacity-50" />
        </svg>

        {/* Controls Overlay */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button className="w-8 h-8 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800">
            <span className="text-lg leading-none mb-0.5">+</span>
          </button>
          <button className="w-8 h-8 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800">
            <span className="text-xl leading-none mb-0.5">-</span>
          </button>
          <button className="w-8 h-8 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-slate-800 mt-2">
            <Navigation className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
