import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../../../../api/axios';
import { uploadImage } from '../../../../../services/uploadService';
import { RescueHeroService } from '../types';

interface HeroServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RescueHeroService | null;
}

export function HeroServiceModal({ isOpen, onClose, item }: HeroServiceModalProps) {
  const queryClient = useQueryClient();
  const [uploadingImage, setUploadingImage] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<RescueHeroService>({
    defaultValues: {
      image: '',
      name: '',
      title: '',
      redline: '',
      description: '',
      order: 0
    }
  });

  const image = watch('image');

  useEffect(() => {
    if (isOpen) {
      if (item) {
        reset(item);
      } else {
        reset({ image: '', name: '', title: '', redline: '', description: '', order: 0 });
      }
    }
  }, [isOpen, item, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: RescueHeroService) => {
      const payload = {
        name: data.name,
        image: data.image,
        title: data.title,
        redline: data.redline,
        description: data.description,
        order: Number(data.order)
      };

      if (item?._id) {
        await api.patch(`/admin/rescue/hero-service/${item._id}`, payload);
      } else {
        await api.post('/admin/rescue/hero-service', payload);
      }
    },
    onSuccess: () => {
      toast.success(`Hero service ${item ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['rescue-hero-services'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save hero service');
    }
  });

  const onSubmit = (data: RescueHeroService) => {
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {item ? 'Edit Hero Service' : 'Add Hero Service'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="hero-service-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hero Image <span className="text-red-500">*</span>
              </label>
              <div className="flex items-start gap-4">
                <div className="w-32 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center">
                  {image ? (
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      {...register('image')}
                      placeholder="Image URL"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <label className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0 flex items-center gap-2">
                      {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      Upload
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                    </label>
                  </div>
                  {errors.image && <p className="text-[10px] text-red-500 mt-1">{errors.image.message}</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                placeholder="e.g. Battery Change Service"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
              {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                placeholder="e.g. Fast Battery Replacement At Your Doorstep"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
              {errors.title && <p className="text-[10px] text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Redline <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('redline', { required: 'Redline is required' })}
                placeholder="e.g. 24/7 Emergency Rescue Service"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
              {errors.redline && <p className="text-[10px] text-red-500 mt-1">{errors.redline.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                {...register('description', { required: 'Description is required' })}
                placeholder="e.g. Our expert rescue team arrives quickly..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
              {errors.description && <p className="text-[10px] text-red-500 mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                {...register('order')}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
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
            form="hero-service-form"
            disabled={saveMutation.isPending || uploadingImage}
            className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
          >
            {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Hero Service
          </button>
        </div>
      </div>
    </div>
  );
}
