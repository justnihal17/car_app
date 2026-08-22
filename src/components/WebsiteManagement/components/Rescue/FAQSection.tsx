import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, HelpCircle, LayoutGrid, Table as TableIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../../api/axios';
import { RescueFaq } from './types';
import { DeleteConfirmationModal } from '../../../DeleteConfirmationModal';
import { FAQModal } from './modals/FAQModal';
import { ActionMenu } from './ActionMenu';

export function FAQSection() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RescueFaq | null>(null);
  const [viewLayout, setViewLayout] = useState<'table' | 'grid'>('table');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery<RescueFaq[]>({
    queryKey: ['rescue-faqs'],
    queryFn: async () => {
      const res = await api.get('/admin/rescue/faq');
      return res.data?.data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/rescue/faq/${id}`);
    },
    onSuccess: () => {
      toast.success('FAQ deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['rescue-faqs'] });
      setDeleteModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete FAQ');
    }
  });

  const handleEdit = (item: RescueFaq) => {
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
          <h3 className="text-base font-bold text-slate-900">3. FAQ Management</h3>
          <p className="text-xs text-slate-500 mt-0.5">Manage frequently asked questions.</p>
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
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">No FAQs found</p>
          </div>
        ) : viewLayout === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Question & Answer</th>
                  <th className="px-5 py-3.5 text-center text-[11px] font-extrabold text-slate-500 uppercase tracking-wider w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg shrink-0 mt-0.5">
                          <HelpCircle className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900">{item.questionName}</h4>
                          <p className="text-xs text-slate-500 mt-1 max-w-3xl">{item.questionValue}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top text-center">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {items.map((item) => (
              <div key={item._id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                      <HelpCircle className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900">{item.questionName}</h4>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.questionValue}</p>
                    </div>
                  </div>
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

      <FAQModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={editingItem}
      />

      <DeleteConfirmationModal 
        isOpen={deleteModalOpen}
        name="this FAQ"
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate(deletingId!)}
      />
    </div>
  );
}
