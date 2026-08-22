import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Upload, Loader2, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../../../../api/axios';
import { uploadImage } from '../../../../../services/uploadService';
import { RescueService } from '../types';

interface RescueServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RescueService | null;
}

export function RescueServiceModal({ isOpen, onClose, item }: RescueServiceModalProps) {
  const queryClient = useQueryClient();
  const [uploadingImage, setUploadingImage] = useState(false);

  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<{
    image: string;
    name: string;
    description: string;
    duration: string;
    price: number;
    points: { value: string }[];
  }>({
    defaultValues: {
      image: '',
      name: '',
      description: '',
      duration: '',
      price: 0,
      points: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'points'
  });

  const image = watch('image');

  useEffect(() => {
    if (isOpen) {
      if (item) {
        reset({
          ...item,
          points: (item.points || []).map(p => ({ value: p }))
        });
      } else {
        reset({ image: '', name: '', description: '', duration: '', price: 0, points: [] });
      }
    }
  }, [isOpen, item, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        name: data.name,
        image: data.image,
        description: data.description,
        duration: data.duration,
        price: Number(data.price),
        points: data.points.map((p: any) => p.value).filter(Boolean)
      };

      if (item?._id) {
        await api.patch(`/admin/rescue/service/${item._id}`, payload);
      } else {
        await api.post('/admin/rescue/service', payload);
      }
    },
    onSuccess: () => {
      toast.success(`Service ${item ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['rescue-services'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save service');
    }
  });

  const onSubmit = (data: any) => {
    if (!data.image) {
      toast.error('Image is required');
      return;
    }
    saveMutation.mutate(data);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await uploadImage(file);
      setValue('image', url, { shouldValidate: true });
    } catch (error) {
      toast.error('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {item ? 'Edit Rescue Service' : 'Add Rescue Service'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="rescue-service-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  placeholder="e.g. Battery Change Service"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center">
                    {image ? (
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                  <label className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2">
                    {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    Upload
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Price (AED) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register('price', { required: 'Price is required' })}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Duration <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('duration', { required: 'Duration is required' })}
                  placeholder="e.g. 20-30 Minutes"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                {...register('description', { required: 'Description is required' })}
                placeholder="Detailed explanation of the service..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">Service Points</label>
                <button
                  type="button"
                  onClick={() => append({ value: '' })}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Point
                </button>
              </div>
              
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      {...register(`points.${index}.value` as const)}
                      placeholder={`Point ${index + 1}`}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {fields.length === 0 && (
                  <div className="text-center py-4 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    No points added. Click "Add Point" to list features.
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
            form="rescue-service-form"
            disabled={saveMutation.isPending || uploadingImage}
            className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
          >
            {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Service
          </button>
        </div>
      </div>
    </div>
  );
}
