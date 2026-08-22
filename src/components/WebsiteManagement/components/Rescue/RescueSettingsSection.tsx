import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Settings, Edit2 } from 'lucide-react';
import api from '../../../../api/axios';
import { RescueSettings } from './types';
import { SettingsModal } from './modals/SettingsModal';

export function RescueSettingsSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: settings = { description: '', getStarted: { points: [] } }, isLoading } = useQuery<RescueSettings>({
    queryKey: ['rescue-settings'],
    queryFn: async () => {
      const res = await api.get('/admin/rescue/settings');
      return res.data?.data || res.data || { description: '', getStarted: { points: [] } };
    }
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">4. Rescue Settings</h3>
          <p className="text-xs text-slate-500 mt-0.5">Manage page description and Get Started workflow.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all"
        >
          <Edit2 className="w-4 h-4" /> Edit Settings
        </button>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-16 bg-slate-100 rounded-xl animate-pulse"></div>
            <div className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Page Description</h4>
              <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {settings.description || <span className="text-slate-400 italic">No description set</span>}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Get Started Workflow</h4>
              <div className="space-y-2">
                {settings.getStarted?.points?.length > 0 ? (
                  settings.getStarted.points.map((point, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-sm text-slate-700 font-medium">{point}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-200">
                    No steps added yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <SettingsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        settings={settings}
      />
    </div>
  );
}
