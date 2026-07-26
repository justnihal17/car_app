import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Calendar, Clock, MapPin, User, Car, Wrench, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

interface CreateOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateOrderDrawer({ isOpen, onClose, onSuccess }: CreateOrderDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [subServices, setSubServices] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // Form States
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [customVehicle, setCustomVehicle] = useState('');
  
  // Selected Services: Array of { serviceId, subServiceId, price, duration }
  const [selectedServicesList, setSelectedServicesList] = useState<{
    serviceId: string;
    subServiceId?: string;
    name: string;
    price: number;
    duration: number;
  }[]>([]);

  const [currentServiceId, setCurrentServiceId] = useState('');
  const [currentSubServiceId, setCurrentSubServiceId] = useState('');

  // Location
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [googleMapUrl, setGoogleMapUrl] = useState('');

  // Schedule
  const [bookingType, setBookingType] = useState<'Scheduled' | 'Instant'>('Scheduled');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [timeSlot, setTimeSlot] = useState('');

  // Note
  const [customerNote, setCustomerNote] = useState('');

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  const fetchInitialData = async () => {
    setLoadingInitial(true);
    try {
      const [customerRes, serviceRes, subServiceRes] = await Promise.allSettled([
        api.get('/customer/customer'),
        api.get('/master/service'),
        api.get('/master/subservice')
      ]);

      if (customerRes.status === 'fulfilled') {
        const raw = customerRes.value.data?.data || customerRes.value.data || [];
        const customerList = Array.isArray(raw) ? raw : (raw.customers || []);
        setCustomers(customerList);
      }

      if (serviceRes.status === 'fulfilled') {
        const raw = serviceRes.value.data?.data || serviceRes.value.data || [];
        const serviceList = Array.isArray(raw) ? raw : (raw.services || []);
        setServices(serviceList);
      }

      if (subServiceRes.status === 'fulfilled') {
        const raw = subServiceRes.value.data?.data || subServiceRes.value.data || [];
        const subList = Array.isArray(raw) ? raw : (raw.subservices || []);
        setSubServices(subList);
      }
    } catch (e) {
      console.error('Failed to load form metadata', e);
    } finally {
      setLoadingInitial(false);
    }
  };

  const selectedCustomer = useMemo(() => {
    return customers.find(c => (c._id || c.id) === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const customerVehicles = useMemo(() => {
    if (!selectedCustomer) return [];
    if (Array.isArray(selectedCustomer.vehicles)) return selectedCustomer.vehicles;
    if (selectedCustomer.vehicle) return [selectedCustomer.vehicle];
    return [];
  }, [selectedCustomer]);

  const filteredSubServices = useMemo(() => {
    if (!currentServiceId) return [];
    return subServices.filter(s => {
      const sId = s.serviceId || (typeof s.service === 'object' ? s.service?._id || s.service?.id : s.service);
      return String(sId) === String(currentServiceId);
    });
  }, [subServices, currentServiceId]);

  const handleAddService = () => {
    if (!currentServiceId) {
      toast.error('Please select a Service');
      return;
    }

    const serviceObj = services.find(s => (s._id || s.id) === currentServiceId);
    const subServiceObj = subServices.find(s => (s._id || s.id) === currentSubServiceId);

    const serviceName = serviceObj?.name || 'Service';
    const subName = subServiceObj?.name;
    const displayName = subName ? `${serviceName} - ${subName}` : serviceName;

    // Check duplicate
    const isDuplicate = selectedServicesList.some(
      item => item.serviceId === currentServiceId && item.subServiceId === (currentSubServiceId || undefined)
    );

    if (isDuplicate) {
      toast.error('This service combination is already added');
      return;
    }

    const price = Number(subServiceObj?.price || serviceObj?.price || 0);
    const durationStr = String(subServiceObj?.duration || serviceObj?.duration || '30');
    const duration = parseInt(durationStr.replace(/\D/g, '')) || 30;

    setSelectedServicesList(prev => [
      ...prev,
      {
        serviceId: currentServiceId,
        subServiceId: currentSubServiceId || undefined,
        name: displayName,
        price,
        duration
      }
    ]);

    setCurrentServiceId('');
    setCurrentSubServiceId('');
  };

  const handleRemoveService = (index: number) => {
    setSelectedServicesList(prev => prev.filter((_, i) => i !== index));
  };

  const grandTotal = useMemo(() => {
    return selectedServicesList.reduce((sum, item) => sum + item.price, 0);
  }, [selectedServicesList]);

  const totalDuration = useMemo(() => {
    return selectedServicesList.reduce((sum, item) => sum + item.duration, 0);
  }, [selectedServicesList]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedCustomerId) newErrors.customerId = 'Customer is required';
    if (selectedServicesList.length === 0) newErrors.services = 'At least one service is required';
    if (!address.trim()) newErrors.address = 'Pickup address is required';
    if (bookingType === 'Scheduled') {
      if (!bookingDate) newErrors.bookingDate = 'Booking date is required';
      if (!bookingTime) newErrors.bookingTime = 'Booking time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerId: selectedCustomerId,
        customer: selectedCustomerId,
        vehicle: selectedVehicle === 'custom' ? customVehicle : selectedVehicle,
        vehicleDetails: selectedVehicle === 'custom' ? customVehicle : selectedVehicle,
        services: selectedServicesList.map(s => ({
          serviceId: s.serviceId,
          subServiceId: s.subServiceId,
          name: s.name,
          price: s.price,
          duration: s.duration
        })),
        pickupLocation: {
          address,
          latitude: latitude ? Number(latitude) : undefined,
          longitude: longitude ? Number(longitude) : undefined,
          googleMapUrl: googleMapUrl || undefined
        },
        address,
        bookingType,
        scheduledDate: bookingDate,
        scheduledTime: bookingTime,
        timeSlot: timeSlot || `${bookingTime}`,
        customerNote,
        totalDuration,
        grandTotal
      };

      const res = await api.post('/admin/order', payload);
      if (res.data?.success || res.data?.status) {
        toast.success(res.data?.message || 'Order created successfully');
        onSuccess();
        onClose();
      } else {
        toast.success('Order created successfully');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error('Create order error', err);
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create New Order</h2>
            <p className="text-xs text-slate-500 mt-0.5">Fill in order details to schedule service</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        {loadingInitial ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Section 1: Customer */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-red-600" /> Customer Information
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Customer *</label>
                <select 
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    setSelectedVehicle('');
                  }}
                  className={`w-full bg-slate-50 border ${errors.customerId ? 'border-red-500' : 'border-slate-200'} text-slate-900 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-red-500`}
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email} ({c.phone || c.email})
                    </option>
                  ))}
                </select>
                {errors.customerId && <p className="text-xs text-red-600 mt-1">{errors.customerId}</p>}
              </div>
            </div>

            {/* Section 2: Vehicle */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4 text-red-600" /> Vehicle Details
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle</label>
                {customerVehicles.length > 0 ? (
                  <select 
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-red-500"
                  >
                    <option value="">-- Select Saved Vehicle --</option>
                    {customerVehicles.map((v: any, idx: number) => {
                      const name = typeof v === 'object' ? `${v.make || ''} ${v.model || ''} (${v.plateNumber || ''})` : v;
                      return <option key={idx} value={typeof v === 'object' ? v._id || v.id || name : v}>{name}</option>;
                    })}
                    <option value="custom">+ Add Custom Vehicle</option>
                  </select>
                ) : (
                  <input 
                    type="text" 
                    placeholder="e.g., Toyota Camry - White (DXB 1234)" 
                    value={customVehicle}
                    onChange={(e) => setCustomVehicle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-red-500"
                  />
                )}
                {selectedVehicle === 'custom' && (
                  <input 
                    type="text" 
                    placeholder="Enter custom vehicle details..." 
                    value={customVehicle}
                    onChange={(e) => setCustomVehicle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-red-500 mt-2"
                  />
                )}
              </div>
            </div>

            {/* Section 3: Services & Sub-Services */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-red-600" /> Services & Sub-Services *
              </h3>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Service</label>
                    <select 
                      value={currentServiceId}
                      onChange={(e) => {
                        setCurrentServiceId(e.target.value);
                        setCurrentSubServiceId('');
                      }}
                      className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-none focus:border-red-500"
                    >
                      <option value="">-- Choose Service --</option>
                      {services.map((s) => (
                        <option key={s._id || s.id} value={s._id || s.id}>{s.name || s.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Sub Service (Optional)</label>
                    <select 
                      value={currentSubServiceId}
                      onChange={(e) => setCurrentSubServiceId(e.target.value)}
                      disabled={!currentServiceId || filteredSubServices.length === 0}
                      className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-none focus:border-red-500 disabled:opacity-50"
                    >
                      <option value="">-- Choose Sub Service --</option>
                      {filteredSubServices.map((sub) => (
                        <option key={sub._id || sub.id} value={sub._id || sub.id}>
                          {sub.name || sub.title} ({sub.price ? `AED ${sub.price}` : ''})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={handleAddService}
                  className="w-full py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Service to List
                </button>
              </div>

              {/* Selected List */}
              {selectedServicesList.length > 0 ? (
                <div className="space-y-2">
                  {selectedServicesList.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.duration} mins • AED {item.price}</div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveService(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                errors.services && <p className="text-xs text-red-600">{errors.services}</p>
              )}
            </div>

            {/* Section 4: Pickup Location */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" /> Pickup Location *
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address *</label>
                <input 
                  type="text"
                  placeholder="e.g., Villa 12, Street 4, Business Bay, Dubai"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full bg-slate-50 border ${errors.address ? 'border-red-500' : 'border-slate-200'} text-slate-900 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-red-500`}
                />
                {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Latitude</label>
                  <input 
                    type="text" 
                    placeholder="25.2048"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Longitude</label>
                  <input 
                    type="text" 
                    placeholder="55.2708"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Google Maps URL</label>
                <input 
                  type="text" 
                  placeholder="https://maps.google.com/?q=..."
                  value={googleMapUrl}
                  onChange={(e) => setGoogleMapUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-none focus:border-red-500 font-mono text-xs"
                />
              </div>
            </div>

            {/* Section 5: Schedule */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" /> Schedule
              </h3>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setBookingType('Scheduled')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    bookingType === 'Scheduled' ? 'bg-red-50 border-red-600 text-red-600' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Scheduled
                </button>
                <button
                  type="button"
                  onClick={() => setBookingType('Instant')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    bookingType === 'Instant' ? 'bg-red-50 border-red-600 text-red-600' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Instant Booking
                </button>
              </div>

              {bookingType === 'Scheduled' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Booking Date *</label>
                    <input 
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className={`w-full bg-slate-50 border ${errors.bookingDate ? 'border-red-500' : 'border-slate-200'} text-slate-900 text-sm rounded-xl px-3 py-2 outline-none focus:border-red-500`}
                    />
                    {errors.bookingDate && <p className="text-xs text-red-600 mt-1">{errors.bookingDate}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Booking Time *</label>
                    <input 
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className={`w-full bg-slate-50 border ${errors.bookingTime ? 'border-red-500' : 'border-slate-200'} text-slate-900 text-sm rounded-xl px-3 py-2 outline-none focus:border-red-500`}
                    />
                    {errors.bookingTime && <p className="text-xs text-red-600 mt-1">{errors.bookingTime}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Section 6: Note */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Note</label>
              <textarea 
                rows={3}
                placeholder="Special instructions or notes..."
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3 outline-none focus:border-red-500 resize-none"
              ></textarea>
            </div>

            {/* Section 7: Summary */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Summary</h4>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Services:</span>
                <span className="font-bold">{selectedServicesList.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Est. Total Duration:</span>
                <span className="font-bold">{totalDuration} mins</span>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-lg font-bold text-red-500">
                <span>Grand Total:</span>
                <span>AED {grandTotal}</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Order'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
