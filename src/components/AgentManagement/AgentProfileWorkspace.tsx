import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Car, Mail, Phone, MapPin, Calendar, Shield, Settings, Briefcase, FileText, Star, DollarSign } from 'lucide-react';

const TABS = ['Overview', 'Assigned Jobs', 'Completed Jobs', 'Vehicle Details', 'Documents', 'Attendance', 'Performance', 'Payments', 'Salary', 'GPS Tracking', 'Login History', 'Activity Timeline', 'Support Tickets', 'Notes'];

export function AgentProfileWorkspace({ agentId, onBack }: { agentId: string, onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen w-full">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Agents
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-400" />
        <div className="px-8 pb-8">
          <div className="relative -mt-16 flex items-end gap-6">
            <div className="w-32 h-32 rounded-2xl bg-white p-1 border-4 border-white shadow-lg">
                <div className="w-full h-full bg-slate-200 rounded-xl flex items-center justify-center">
                    <Car className="w-16 h-16 text-slate-400" />
                </div>
            </div>
            <div className="mb-2">
                <h1 className="text-2xl font-bold text-slate-900">Ahmed Mohammed</h1>
                <p className="text-slate-500">{agentId}</p>
            </div>
            <div className="ml-auto flex gap-3 mb-2">
                <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">Edit Agent</button>
                <button className="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100">Suspend</button>
            </div>
          </div>
        </div>
        
        <div className="px-8 border-t border-slate-200 overflow-x-auto">
            <div className="flex gap-8">
                {TABS.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 text-sm font-medium whitespace-nowrap ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>
                        {tab}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Agent Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                    { label: 'Full Name', value: 'Ahmed Mohammed' },
                    { label: 'Email', value: 'ahmed@cafu.com' },
                    { label: 'Phone', value: '+1234567890' },
                    { label: 'Assigned Area', value: 'Downtown' },
                    { label: 'Vehicle', value: 'Van-01' },
                    { label: 'Joining Date', value: 'Jan 15, 2026' },
                    { label: 'Status', value: 'Available' },
                ].map(item => (
                    <div key={item.label}>
                        <p className="text-slate-500">{item.label}</p>
                        <p className="font-medium text-slate-900">{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900">Quick Statistics</h3>
            <div className="flex justify-between text-sm">
                <span className="text-slate-500">Completed Jobs</span>
                <span className="font-bold">142</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-slate-500">Avg Rating</span>
                <span className="font-bold flex items-center gap-1"><Star className="w-4 h-4 text-amber-400"/> 4.8</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-slate-500">This Month Earnings</span>
                <span className="font-bold text-blue-600">$2,450.00</span>
            </div>
        </div>
      </div>
    </div>
  );
}
