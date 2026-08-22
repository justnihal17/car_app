import React, { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../../../../api/axios';
import { RescueSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: RescueSettings;
}

export function SettingsModal({ isOpen, onClose, settings }: SettingsModalProps) {
  const queryClient = useQueryClient();

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<{
    description: string;
    points: { value: string }[];
  }>({
    defaultValues: {
      description: '',
      points: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'points'
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        description: settings.description || '',
        points: (settings.getStarted?.points || []).map(p => ({ value: p }))
      });
    }
  }, [isOpen, settings, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        description: data.description,
        getStarted: {
          points: data.points.map((p: any) => p.value).filter(Boolean)
        }
      };
      await api.patch('/admin/rescue/settings', payload);
    },
    onSuccess: () => {
      toast.success('Settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['rescue-settings'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    }
  });

  const onSubmit = (data: any) => {
    saveMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Edit Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Page Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                {...register('description', { required: 'Description is required' })}
                placeholder="Overview description for the rescue page..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
              {errors.description && <p className="text-[10px] text-red-500 mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">Get Started Workflow Steps</label>
                <button
                  type="button"
                  onClick={() => append({ value: '' })}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Step
                </button>
              </div>
              
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0 border border-slate-200">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      {...register(`points.${index}.value` as const, { required: true })}
                      placeholder={`Workflow Step ${index + 1}`}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {fields.length === 0 && (
                  <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    No steps added. Click "Add Step" to list the workflow.
                  </div>
                )}
              </div>
            </div>

          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="settings-form"
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
          >
            {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
