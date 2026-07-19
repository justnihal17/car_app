import React, { useState } from 'react';
import { SlidePanel } from '../../common/SlidePanel';
import { User, Plus, Trash2, MapPin, Car } from 'lucide-react';
import { UserRegistrationFormValues } from './UserRegistrationSchema';

export function UserRegistrationDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [photo, setPhoto] = useState<string | null>(null);
  
  // Basic state to match the required JSON structure
  const [formData, setFormData] = useState<Partial<UserRegistrationFormValues>>({
    fullName: '',
    email: '',
    phone: '',
    active: true,
    notificationEnabled: true,
    addresses: [{ label: 'Home', street: '', city: 'Dubai', country: 'UAE', isDefault: true }],
    vehicles: [{ brand: '', model: '', registrationNumber: '' }]
  });

  const handleRegister = () => {
    console.log('Registering User:', formData);
    onClose();
  };

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...(prev.addresses || []), { label: 'Other', street: '', city: 'Dubai', country: 'UAE', isDefault: false }]
    }));
  };

  const addVehicle = () => {
    setFormData(prev => ({
      ...prev,
      vehicles: [...(prev.vehicles || []), { brand: '', model: '', registrationNumber: '' }]
    }));
  };

  return (
    <SlidePanel isOpen={isOpen} onClose={onClose} title="Register New User">
      <div className="p-6 space-y-6 bg-white overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
        
        {/* Photo Upload mimicking Agent Drawer */}
        <label className="block w-full border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors">
          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setPhoto(URL.createObjectURL(e.target.files[0]));
            }
          }} />
          {photo ? (
            <img src={photo} className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-white shadow-sm" alt="Preview" />
          ) : (
            <div className="w-24 h-24 mx-auto bg-white rounded-full mb-4 flex items-center justify-center border-2 border-slate-100 shadow-sm">
                <User className="w-10 h-10 text-slate-400" />
            </div>
          )}
          <p className="text-sm font-medium text-blue-600 mt-2">Upload Profile Photo</p>
        </label>

        {/* Basic Info */}
        <input 
          type="text" 
          placeholder="Full Name" 
          value={formData.fullName} 
          onChange={e => setFormData({...formData, fullName: e.target.value})}
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-colors" 
        />
        
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="email" 
            placeholder="Email" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-colors" 
          />
          <input 
            type="tel" 
            placeholder="Phone Number" 
            value={formData.phone} 
            onChange={e => setFormData({...formData, phone: e.target.value})}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-colors" 
          />
        </div>

        {/* Addresses Section */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" /> Addresses
            </h3>
            <button onClick={addAddress} className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="space-y-4">
            {formData.addresses?.map((address, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3 relative group">
                <button 
                  onClick={() => setFormData(p => ({ ...p, addresses: p.addresses?.filter((_, i) => i !== idx) }))}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-3 pr-6">
                  <select 
                    value={address.label}
                    onChange={e => {
                      const newArr = [...(formData.addresses || [])];
                      newArr[idx].label = e.target.value as any;
                      setFormData({...formData, addresses: newArr});
                    }}
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Other">Other</option>
                  </select>
                  <input 
                    type="text" placeholder="Street" value={address.street}
                    onChange={e => {
                      const newArr = [...(formData.addresses || [])];
                      newArr[idx].street = e.target.value;
                      setFormData({...formData, addresses: newArr});
                    }}
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicles Section */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <Car className="w-4 h-4 text-slate-400" /> Vehicles
            </h3>
            <button onClick={addVehicle} className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="space-y-4">
            {formData.vehicles?.map((vehicle, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3 relative group">
                <button 
                  onClick={() => setFormData(p => ({ ...p, vehicles: p.vehicles?.filter((_, i) => i !== idx) }))}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-3 pr-6">
                  <select 
                    value={vehicle.brand}
                    onChange={e => {
                      const newArr = [...(formData.vehicles || [])];
                      newArr[idx].brand = e.target.value;
                      setFormData({...formData, vehicles: newArr});
                    }}
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="">Brand</option>
                    <option value="Toyota">Toyota</option>
                    <option value="BMW">BMW</option>
                    <option value="Honda">Honda</option>
                  </select>
                  <input 
                    type="text" placeholder="Model" value={vehicle.model}
                    onChange={e => {
                      const newArr = [...(formData.vehicles || [])];
                      newArr[idx].model = e.target.value;
                      setFormData({...formData, vehicles: newArr});
                    }}
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm"
                  />
                  <input 
                    type="text" placeholder="Reg Number" value={vehicle.registrationNumber}
                    onChange={e => {
                      const newArr = [...(formData.vehicles || [])];
                      newArr[idx].registrationNumber = e.target.value;
                      setFormData({...formData, vehicles: newArr});
                    }}
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm col-span-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-medium text-slate-700">Active Account</span>
            <input 
              type="checkbox" 
              checked={formData.active} 
              onChange={e => setFormData({...formData, active: e.target.checked})}
              className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-medium text-slate-700">Notifications Enabled</span>
            <input 
              type="checkbox" 
              checked={formData.notificationEnabled} 
              onChange={e => setFormData({...formData, notificationEnabled: e.target.checked})}
              className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
            />
          </div>
        </div>

      </div>
      
      {/* Footer sticky action area */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 sticky bottom-0 z-10 flex gap-4">
        <button onClick={handleRegister} className="flex-1 p-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors">
          Register User
        </button>
        <button onClick={onClose} className="flex-1 p-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
          Cancel
        </button>
      </div>
    </SlidePanel>
  );
}
