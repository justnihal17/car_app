import { useEffect, useState } from 'react';
import { ChevronLeft, Calendar, Tag, MapPin, BarChart2, DollarSign, Clock, Users, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { getAdminSubServicesByServiceId } from '../../services/subServiceService';

function normalizeService(item: any) {
  const rawPrice = item.price ?? item.amount ?? 0;
  const priceText = typeof rawPrice === 'number' ? `AED ${rawPrice}` : rawPrice?.toString() || 'AED 0';
  const cities = Array.isArray(item.cities) ? item.cities : item.cities ? [item.cities] : ['Dubai'];
  return {
    id: item._id || item.id || '',
    name: item.name || 'Untitled Service',
    category: item.category || 'General',
    duration: item.duration ? `${item.duration}` : 'TBD',
    price: priceText,
    discount: item.discount || '0%',
    cities,
    status: item.active === false ? 'Disabled' : 'Active',
    popularity: item.popularity ?? 0,
    orders: item.orders ?? 0,
    revenue: item.revenue ? (typeof item.revenue === 'string' ? item.revenue : `AED ${item.revenue}`) : 'AED 0',
    image: item.image || 'https://images.unsplash.com/photo-1555529733-0e67056058e1?auto=format&fit=crop&w=150&q=80',
    active: item.active !== false,
    ...item,
  };
}

export function ServiceDetails({ serviceId, onBack }: { serviceId: string; onBack: () => void }) {
  const [service, setService] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subServices, setSubServices] = useState<any[]>([]);
  const [loadingSubServices, setLoadingSubServices] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/master/service/${serviceId}`);
        const item = response.data?.data || response.data;
        setService(normalizeService(item));
      } catch (error: any) {
        console.error('Failed to load service details', error);
        toast.error(error.response?.data?.message || 'Unable to load service details');
      } finally {
        setLoading(false);
      }
    };
    const fetchSubServices = async () => {
      setLoadingSubServices(true);
      try {
        const res = await getAdminSubServicesByServiceId(serviceId);
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : (res?.subServices || res?.list || []));
        setSubServices(list);
      } catch (err: any) {
        console.error('Failed to load subservices for service', err);
      } finally {
        setLoadingSubServices(false);
      }
    };
    fetchService();
    fetchSubServices();
  }, [serviceId]);

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await getAdminSubServicesByServiceId(serviceId);
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : (res?.subServices || res?.list || []));
      const activeSubs = list.filter((s: any) => s.deleted !== true && s.isDeleted !== true);
      
      if (activeSubs.length > 0) {
        toast.error(
          <div className="flex flex-col text-left">
            <span className="font-bold text-red-900 text-sm">Cannot Delete Service</span>
            <span className="text-xs text-red-700 font-normal mt-0.5">Please delete all associated sub-services first.</span>
          </div>
        );
        setSaving(false);
        return;
      }
    } catch (error) {
      toast.error('Failed to verify service dependencies. Please try again.');
      setSaving(false);
      return;
    }

    if (!window.confirm('Delete this service? This will soft delete the record.')) {
      setSaving(false);
      return;
    }
    try {
      await api.delete(`/master/service/${serviceId}`);
      toast.success('Service deleted successfully');
      onBack();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete service');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!service) return;
    setSaving(true);
    try {
      const active = !service.active;
      const priceNumber = Number(service.price.toString().replace(/[AED\s,]/gi, '')) || 0;
      await api.put(`/master/service/${serviceId}`, {
        name: service.name,
        price: priceNumber,
        image: service.image,
        description: service.description || service.detailedDescription || service.shortDescription,
        shortDescription: service.shortDescription || service.description,
        detailedDescription: service.detailedDescription || service.description,
        active,
      });
      setService((prev: any) => ({ ...prev, active, status: active ? 'Active' : 'Disabled' }));
      toast.success(`Service ${active ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update service status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-white p-8">Loading service details…</div>;
  }

  if (!service) {
    return <div className="text-white p-8">Service not found</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Services
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleStatusToggle}
            disabled={saving}
            className="px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors text-sm"
          >
            {service.active ? 'Deactivate Service' : 'Activate Service'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="px-4 py-2 bg-red-600 border border-red-500 text-white rounded-lg hover:bg-red-500 transition-colors text-sm"
          >
            Delete Service
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg flex items-start gap-6">
            <img src={service.image} alt={service.name} className="w-32 h-32 rounded-xl border border-slate-700 object-cover" />
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{service.name}</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
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

          <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-red-500" /> Associated Sub-Services
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">{subServices.length}</span>
              </h3>
            </div>
            {loadingSubServices ? (
              <div className="text-slate-400 text-sm py-4 text-center">Loading sub-services...</div>
            ) : subServices.length === 0 ? (
              <div className="text-slate-500 text-sm py-6 text-center bg-slate-900/50 rounded-lg border border-slate-800/80">
                No sub-services found for this service.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {subServices.map((sub: any) => (
                  <div key={sub._id || sub.id} className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {sub.image ? (
                        <img src={sub.image} alt={sub.name} className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs shrink-0">
                          {(sub.name || sub.title || 'S')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">{sub.name || sub.title || 'Untitled'}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          {sub.price !== undefined && <span>AED {sub.price}</span>}
                          {sub.duration && <span>• {sub.duration}</span>}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${sub.active !== false && sub.status !== 'Inactive' && sub.status !== 'Disabled' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                      {sub.active !== false && sub.status !== 'Inactive' && sub.status !== 'Disabled' ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
              {service.cities.map((city: string, idx: number) => (
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
