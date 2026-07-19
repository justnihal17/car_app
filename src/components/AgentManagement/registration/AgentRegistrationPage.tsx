import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { FormCard } from './FormCard';
import { FileUpload } from './FileUpload';
import { PasswordInput } from './PasswordInput';
import { SkillChips } from './SkillChips';
import { ProfilePreviewCard } from './ProfilePreviewCard';
import { ChevronRight, User, Save, X, RefreshCcw } from 'lucide-react';

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export function AgentRegistrationPage() {
  const methods = useForm({ resolver: zodResolver(schema) });

  return (
    <FormProvider {...methods}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1300px] mx-auto p-8 space-y-8 bg-slate-50 min-h-screen">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <span>Dashboard</span> <ChevronRight className="w-4 h-4" /> <span>Agent Management</span> <ChevronRight className="w-4 h-4" /> <span className="text-blue-600 font-medium">Create Agent</span>
        </div>
        
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Register New Service Agent</h1>
                <p className="text-slate-500 text-lg mt-2">Professional Enterprise Onboarding</p>
            </div>
            <div className="flex gap-3">
                <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 shadow-sm">Cancel</button>
                <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:bg-blue-700">Register Agent</button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-32">
            {/* Left Side: Photo */}
            <div className="lg:col-span-1">
                <FormCard title="Agent Avatar">
                    <FileUpload name="photo" label="Upload Photo" />
                </FormCard>
            </div>

            {/* Right Side: Form */}
            <div className="lg:col-span-2 space-y-8">
                <FormCard title="Basic Information">
                    <div className="grid grid-cols-2 gap-6">
                        <input placeholder="Agent ID" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" disabled />
                        <input placeholder="Employee Code" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" />
                        <input {...methods.register('fullName')} placeholder="Full Name" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl col-span-2" />
                    </div>
                </FormCard>
                
                <FormCard title="Contact Details">
                    <div className="grid grid-cols-2 gap-6">
                        <input {...methods.register('email')} placeholder="Email" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" />
                        <input placeholder="Phone Number" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" />
                    </div>
                </FormCard>

                <FormCard title="Authentication">
                    <PasswordInput name="password" label="Password" />
                </FormCard>

                <FormCard title="Employment">
                    <div className="grid grid-cols-2 gap-6">
                        <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                            <option>Role</option>
                        </select>
                        <input type="date" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" />
                    </div>
                </FormCard>

                <FormCard title="Professional Skills"><SkillChips /></FormCard>
            </div>

            <div className="lg:col-span-1">
                <ProfilePreviewCard />
            </div>
        </div>
        
        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-200 flex justify-end gap-4 shadow-lg z-50">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 rounded-xl"><X className="w-4 h-4"/> Cancel</button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 rounded-xl"><RefreshCcw className="w-4 h-4"/> Reset</button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl"><Save className="w-4 h-4"/> Register Agent</button>
        </div>
      </motion.div>
    </FormProvider>
  );
}
