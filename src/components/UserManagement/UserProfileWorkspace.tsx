import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Shield, Settings, Trash2, Edit2, AlertCircle } from 'lucide-react';

import { ConfirmationModal } from '../ConfirmationModal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const getFullImageUrl = (url: string | null) => {
  if (!url) return undefined;
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  return `${import.meta.env.VITE_API_URL || 'https://stylein-backend.onrender.com'}${url}`;
};

const TABS = ['Overview', 'Orders', 'Payments', 'Wallet', 'Addresses', 'Activity', 'Security'];

export function UserProfileWorkspace({ userId, onBack }: { userId: string, onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [user, setUser] = useState<any>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/customer/customer/${userId}`);
        const fetchedUser = response.data.data;
        const statusMapStr = localStorage.getItem('customerStatusMap');
        const statusMap = statusMapStr ? JSON.parse(statusMapStr) : {};
        if (statusMap[fetchedUser._id] !== undefined) {
          fetchedUser.active = statusMap[fetchedUser._id];
        }
        setUser(fetchedUser);
      } catch (error) {
        console.error("Failed to fetch customer details", error);
      }
    };
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const confirmBlockToggle = async () => {
    if (!user) return;
    try {
      const newBlockedStatus = !user.blocked;
      const response = await api.put(`/customer/customer/admin/${user._id}`, { blocked: newBlockedStatus });
      toast.success(response.data?.message || `Customer ${newBlockedStatus ? 'blocked' : 'unblocked'} successfully`);
      setUser({ ...user, blocked: newBlockedStatus });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update customer status');
    } finally {
      setIsBlockModalOpen(false);
    }
  };

  if (!user) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen w-full">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-red-600 to-blue-400" />
        <div className="px-8 pb-8">
          <div className="relative -mt-16 flex items-end gap-6">
            <div className="w-32 h-32 rounded-2xl bg-white p-1 border-4 border-white shadow-lg">
                <div className="w-full h-full bg-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                    {(user.image || user.profileUrl || user.imageUrl) ? (
                        <img 
                            src={getFullImageUrl(user.image || user.profileUrl || user.imageUrl)} 
                            alt={user.fullName || 'User'} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                                const nextSibling = (e.currentTarget as HTMLElement).nextElementSibling;
                                if (nextSibling) (nextSibling as HTMLElement).style.display = 'block';
                            }}
                        />
                    ) : null}
                    <User className={`w-16 h-16 text-slate-400 ${(user.image || user.profileUrl || user.imageUrl) ? 'hidden' : ''}`} />
                </div>
            </div>
            <div className="mb-2">
                <h1 className="text-2xl font-bold text-slate-900">{user.fullName || 'Unknown User'}</h1>
                <p className="text-slate-500">{user.customerId || userId}</p>
            </div>
            <div className="ml-auto flex gap-3 mb-2">
                <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">Edit</button>
                <button 
                  onClick={() => setIsBlockModalOpen(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${user.blocked ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                >
                  {user.blocked ? 'Unblock' : 'Suspend'}
                </button>
            </div>
          </div>
        </div>
        
        <div className="px-8 border-t border-slate-200">
            <div className="flex gap-8">
                {TABS.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 text-sm font-medium ${activeTab === tab ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500'}`}>
                        {tab}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                    { label: 'Full Name', value: user.fullName || 'N/A' },
                    { label: 'Email', value: user.email || 'N/A' },
                    { label: 'Phone', value: user.phone || 'N/A' },
                    { label: 'City', value: 'N/A' }, // City not in customer payload currently
                    { label: 'Member Since', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' },
                    { label: 'Status', value: user.active ? 'Active' : (user.blocked ? 'Blocked' : 'Inactive') },
                ].map(item => (
                    <div key={item.label}>
                        <p className="text-slate-500">{item.label}</p>
                        <p className="font-medium text-slate-900">{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900">Quick Stats</h3>
            <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Orders</span>
                <span className="font-bold">12</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-slate-500">Wallet Balance</span>
                <span className="font-bold text-red-600">$450.00</span>
            </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isBlockModalOpen}
        actionType={user.blocked ? "unblock" : "block"}
        name={user.fullName}
        onCancel={() => setIsBlockModalOpen(false)}
        onConfirm={confirmBlockToggle}
      />
    </div>
  );
}
