import { Settings } from 'lucide-react';

export function SettingsManager() {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center justify-center text-center py-12 max-w-md mx-auto">
        <div className="p-4 bg-red-50 text-red-600 rounded-full mb-4">
          <Settings className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Settings</h2>
        <p className="text-slate-500">
          Settings module is currently under development.
        </p>
      </div>
    </div>
  );
}
