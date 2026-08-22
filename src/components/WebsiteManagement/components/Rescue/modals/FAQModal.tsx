import React, { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../../../../api/axios';
import { RescueFaq } from '../types';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RescueFaq | null;
}

export function FAQModal({ isOpen, onClose, item }: FAQModalProps) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RescueFaq>({
    defaultValues: {
      questionName: '',
      questionValue: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (item) {
        reset(item);
      } else {
        reset({ questionName: '', questionValue: '' });
      }
    }
  }, [isOpen, item, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: RescueFaq) => {
      const payload = {
        questionName: data.questionName,
        questionValue: data.questionValue
      };

      if (item?._id) {
        await api.patch(`/admin/rescue/faq/${item._id}`, payload);
      } else {
        await api.post('/admin/rescue/faq', payload);
      }
    },
    onSuccess: () => {
      toast.success(`FAQ ${item ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['rescue-faqs'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save FAQ');
    }
  });

  const onSubmit = (data: RescueFaq) => {
    saveMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {item ? 'Edit FAQ' : 'Add FAQ'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="faq-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Question <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('questionName', { required: 'Question is required' })}
                placeholder="e.g. How quickly can a rescue team arrive?"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
              {errors.questionName && <p className="text-[10px] text-red-500 mt-1">{errors.questionName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Answer <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                {...register('questionValue', { required: 'Answer is required' })}
                placeholder="e.g. Arrival times vary by location..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
              {errors.questionValue && <p className="text-[10px] text-red-500 mt-1">{errors.questionValue.message}</p>}
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
            form="faq-form"
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
          >
            {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save FAQ
          </button>
        </div>
      </div>
    </div>
  );
}
