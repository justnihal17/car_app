import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Check, Image as ImageIcon, LayoutGrid, Table as TableIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../../api/axios';
import { RescueService } from './types';
import { DeleteConfirmationModal } from '../../../DeleteConfirmationModal';
import { RescueServiceModal } from './modals/RescueServiceModal';
import { ActionMenu } from './ActionMenu';

export function RescueServicesSection() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RescueService | null>(null);
  const [viewLayout, setViewLayout] = useState<'table' | 'grid'>('table');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery<RescueService[]>({
    queryKey: ['rescue-services'],
    queryFn: async () => {
      const res = await api.get('/admin/rescue/service');
      return res.data?.data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/rescue/service/${id}`);
    },
    onSuccess: () => {
      toast.success('Service deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['rescue-services'] });
      setDeleteModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete service');
    }
  });

  const handleEdit = (item: RescueService) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">2. Rescue Services</h3>
          <p className="text-xs text-slate-500 mt-0.5">Manage roadside emergency services and pricing.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Layout Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewLayout('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewLayout === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewLayout === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" /> Add Rescue Service
          </button>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">No rescue services found</p>
          </div>
        ) : viewLayout === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Service Name</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-wider hidden md:table-cell">Duration & Price</th>
                  <th className="px-5 py-3.5 text-center text-[11px] font-extrabold text-slate-500 uppercase tracking-wider w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-900 block">{item.name}</span>
                          <span className="text-xs text-slate-500 block truncate max-w-xs">{item.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle hidden md:table-cell">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-slate-900">{item.price} AED</span>
                        <span className="text-xs font-medium text-slate-500">{item.duration}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle text-center">
                      <ActionMenu 
                        onEdit={() => handleEdit(item)}
                        onDelete={() => handleDelete(item._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <div key={item._id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                <div className="relative h-40 bg-slate-50 overflow-hidden flex items-center justify-center p-3 border-b border-slate-100">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                <div className="p-4 space-y-1.5">
                  <h4 className="text-sm font-extrabold text-slate-900">{item.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{item.price} AED</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-xs font-semibold text-slate-500">{item.duration}</span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 pt-1">{item.description}</p>
                  )}
                  {item.points?.length > 0 && (
                    <ul className="pt-2 space-y-1">
                      {item.points.slice(0, 3).map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-[11px] text-slate-600 font-medium line-clamp-1">{point}</span>
                        </li>
                      ))}
                      {item.points.length > 3 && (
                        <li className="text-[10px] font-bold text-slate-400 pl-5">
                          + {item.points.length - 3} more points
                        </li>
                      )}
                    </ul>
                  )}
                </div>
                <div className="flex items-center justify-end px-4 py-3 bg-slate-50/80 border-t border-slate-100">
                  <ActionMenu 
                    onEdit={() => handleEdit(item)}
                    onDelete={() => handleDelete(item._id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RescueServiceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={editingItem}
      />

      <DeleteConfirmationModal 
        isOpen={deleteModalOpen}
        name="this service"
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate(deletingId!)}
      />
    </div>
  );
}
