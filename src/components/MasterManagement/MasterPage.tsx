import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Eye, LayoutDashboard, Shield, Wrench } from 'lucide-react';
import { AnalyticsCard } from '../common/AnalyticsCard';
import { StatusBadge } from '../StatusBadge';
import { SlidePanel } from '../common/SlidePanel';

interface FieldConfig {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'dropdown' | 'toggle';
    options?: string[];
}

interface MasterPageProps {
  moduleName: string;
  columns: string[];
  fields: FieldConfig[];
}

export function MasterPage({ moduleName, columns, fields }: MasterPageProps) {
  const [data, setData] = useState([
    { id: '1', name: `${moduleName} 1`, status: 'Active' as const },
    { id: '2', name: `${moduleName} 2`, status: 'Inactive' as const },
  ]);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>({});
  const [mode, setMode] = useState<'add' | 'edit' | 'view'>('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filteredData = useMemo(() => {
    return data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === 'All Status' || item.status === statusFilter)
    );
  }, [data, searchTerm, statusFilter]);

  const stats = [
    { title: `Total ${moduleName}s`, value: data.length, icon: LayoutDashboard },
    { title: 'Active', value: data.filter(d => d.status === 'Active').length, icon: Shield },
    { title: 'Inactive', value: data.filter(d => d.status === 'Inactive').length, icon: Wrench },
  ];

  const handleAdd = () => { setMode('add'); setEditingItem({ status: 'Active' }); setIsPanelOpen(true); };
  const handleEdit = (item: any) => { setMode('edit'); setEditingItem(item); setIsPanelOpen(true); };
  const handleView = (item: any) => { setMode('view'); setEditingItem(item); setIsPanelOpen(true); };
  
  const handleDelete = (id: string, name: string) => {
    if (moduleName === 'State' && data.some(d => d.name === name)) { // Placeholder: needs actual linked-city check
        alert(`This state has linked cities. Remove them first.`);
        return;
    }
    if (confirm(`Are you sure you want to delete ${name}?`)) {
        setData(data.filter(d => d.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.some(d => d.name === editingItem.name && d.id !== editingItem.id)) {
        alert("This name already exists.");
        return;
    }
    if (mode === 'add') {
      setData([...data, { ...editingItem, id: String(data.length + 1) }]);
    } else {
      setData(data.map(d => d.id === editingItem.id ? editingItem : d));
    }
    setIsPanelOpen(false);
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-3xl font-bold text-slate-900 capitalize">{moduleName} Management</h2>
            <p className="text-slate-600 mt-1">Manage all {moduleName.toLowerCase()} configurations.</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all font-medium">
          <Plus className="w-5 h-5" /> Add New {moduleName}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(s => (
          <div key={s.title}>
            <AnalyticsCard title={s.title} value={s.value} icon={s.icon} />
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-200 rounded-xl px-5 py-3 bg-white text-slate-700 font-medium outline-none">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              {columns.map(col => <th key={col} className="px-6 py-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">{col}</th>)}
              <th className="px-6 py-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map(row => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-5 font-medium text-slate-900">{row.id}</td>
                <td className="px-6 py-5 text-slate-600">{row.name}</td>
                <td className="px-6 py-5"><StatusBadge status={row.status} /></td>
                <td className="px-6 py-5 flex gap-2">
                  <button onClick={() => handleView(row)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-5 h-5" /></button>
                  <button onClick={() => handleEdit(row)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete(row.id, row.name)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={`${mode === 'add' ? 'Add' : mode === 'edit' ? 'Edit' : 'View'} ${moduleName}`}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {fields.map(f => (
                <div key={f.name}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                    {f.type === 'dropdown' ? (
                        <select 
                            disabled={mode === 'view' || (moduleName === 'State' && f.name === 'country')} 
                            value={editingItem[f.name] || (moduleName === 'State' && f.name === 'country' ? 'UAE' : '')} 
                            onChange={(e) => setEditingItem({...editingItem, [f.name]: e.target.value})} 
                            className={`w-full p-4 border rounded-xl ${moduleName === 'State' && f.name === 'country' ? 'appearance-none' : ''}`}
                        >
                            {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    ) : f.type === 'toggle' ? (
                        <div className="flex items-center gap-2">
                             <input type="checkbox" disabled={mode === 'view'} checked={editingItem[f.name] === 'Active'} onChange={(e) => setEditingItem({...editingItem, [f.name]: e.target.checked ? 'Active' : 'Inactive'})} />
                             <span>{editingItem[f.name] || 'Inactive'}</span>
                        </div>
                    ) : (
                        <input disabled={mode === 'view'} required value={editingItem[f.name] || ''} onChange={(e) => setEditingItem({...editingItem, [f.name]: e.target.value})} placeholder={f.label} className="w-full p-4 border rounded-xl" />
                    )}
                </div>
            ))}
            {mode !== 'view' && <button type="submit" className="w-full p-4 bg-blue-600 text-white rounded-xl font-bold">Save</button>}
        </form>
      </SlidePanel>
    </div>
  );
}
