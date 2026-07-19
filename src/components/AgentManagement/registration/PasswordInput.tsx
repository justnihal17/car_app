import { useState } from 'react';
import { Eye, EyeOff, RefreshCw, Copy, Lock } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

export function PasswordInput({ name, label }: { name: string, label: string }) {
  const [show, setShow] = useState(false);
  const { register } = useFormContext();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input 
          type={show ? 'text' : 'password'}
          {...register(name)}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-24 focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute right-2 top-2 flex gap-1">
          <button type="button" onClick={() => setShow(!show)} className="p-1.5 hover:bg-slate-200 rounded-lg">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button type="button" className="p-1.5 hover:bg-slate-200 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
          <button type="button" className="p-1.5 hover:bg-slate-200 rounded-lg"><Copy className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
