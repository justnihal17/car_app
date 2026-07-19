import { ChevronLeft, Calendar, Tag, MapPin, BarChart2, DollarSign, Clock, Users } from 'lucide-react';
import { SERVICES } from '../../data/services';

export function ServiceDetails({ serviceId, onBack }: { serviceId: string, onBack: () => void }) {
  const service = SERVICES.find(s => s.id === serviceId);

  if (!service) return <div className="text-white p-8">Service not found</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Services
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg flex items-start gap-6">
            <img src={service.image} alt={service.name} className="w-32 h-32 rounded-xl border border-slate-700 object-cover" />
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{service.name}</h2>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{service.id}</span>
                <span className="flex items-center gap-1.5"><Tag className="w-4 h-4" /> {service.category}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${service.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  {service.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">Service Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-xs mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Revenue</div>
                <div className="text-xl font-bold text-white">{service.revenue}</div>
              </div>
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-xs mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Orders</div>
                <div className="text-xl font-bold text-white">{service.orders.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-xs mb-1 flex items-center gap-1"><BarChart2 className="w-3 h-3" /> Popularity</div>
                <div className="text-xl font-bold text-white">{service.popularity}%</div>
              </div>
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-xs mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Duration</div>
                <div className="text-xl font-bold text-white">{service.duration}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg space-y-6">
          <h3 className="text-lg font-bold text-white">Service Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Price</span>
              <span className="text-white font-medium">{service.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Discount</span>
              <span className="text-emerald-400 font-medium">{service.discount}</span>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-800">
            <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Available Cities</h4>
            <div className="flex gap-2 flex-wrap">
              {service.cities.map((city, idx) => (
                <span key={idx} className="text-xs bg-slate-900 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
