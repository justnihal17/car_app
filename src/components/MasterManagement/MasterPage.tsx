import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, LayoutDashboard, Shield, Wrench, UserCheck, UserX } from 'lucide-react';
import { AnalyticsCard } from '../common/AnalyticsCard';
import { StatusBadge } from '../StatusBadge';
import { SlidePanel } from '../common/SlidePanel';
import api from '../../api/axios';
import toast from 'react-hot-toast';

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
  const [data, setData] = useState<any[]>([]);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>({});
  const [mode, setMode] = useState<'add' | 'edit' | 'view'>('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (isPanelOpen) {
      if (editingItem.image) {
        setPhoto(editingItem.image);
      } else {
        setPhoto(null);
      }
    }
  }, [isPanelOpen, editingItem.image]);

  const fetchData = async () => {
    try {
      const response = await api.get(`/master/${moduleName.toLowerCase()}`);
      if (response.data?.success) {
        const mapped = response.data.data.map((item: any) => ({
          id: item._id,
          name: item.name || item.type || '',
          status: item.active !== false ? 'Active' : 'Inactive',
          ...item
        }));
        setData(mapped);
      }
    } catch (error: any) {
      console.error(`Failed to fetch ${moduleName}:`, error);
      const isLiveModule = ['role', 'state', 'city', 'service', 'skill', 'brand', 'color'].includes(moduleName.toLowerCase());
      if (!isLiveModule) {
        // Fallback for non-live master pages
        setData([
          { id: '1', name: `${moduleName} 1`, status: 'Active' as const },
          { id: '2', name: `${moduleName} 2`, status: 'Inactive' as const },
        ]);
      } else {
        setData([]);
        toast.error(`Failed to fetch ${moduleName} list`);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [moduleName]);

  useEffect(() => {
    if (moduleName.toLowerCase() === 'city') {
      const fetchStatesForDropdown = async () => {
        try {
          const response = await api.get('/master/state');
          if (response.data?.success) {
            setStateOptions(response.data.data.map((s: any) => ({ label: s.name, value: s._id })));
          }
        } catch (e) {
          console.error("Failed to load states for dropdown", e);
        }
      };
      fetchStatesForDropdown();
    }
  }, [moduleName]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
        const itemVal = item.name || item.type || '';
        return itemVal.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === 'All Status' || item.status === statusFilter);
    });
  }, [data, searchTerm, statusFilter]);

  const stats = [
    { title: `Total ${moduleName}s`, value: data.length, icon: LayoutDashboard },
    { title: 'Active', value: data.filter(d => d.status === 'Active').length, icon: Shield },
    { title: 'Inactive', value: data.filter(d => d.status === 'Inactive').length, icon: Wrench },
  ];

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      const newActive = currentStatus !== 'Active';
      const response = await api.put(`/master/${moduleName.toLowerCase()}/${id}`, {
        active: newActive
      });
      if (response.data?.success) {
        toast.success(response.data?.message || `${moduleName} status updated successfully`);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to update status`);
    }
  };

  const handleAdd = () => { setMode('add'); setEditingItem({ status: 'Active' }); setIsPanelOpen(true); };
  
  const handleEdit = (item: any) => { 
    setMode('edit'); 
    let mappedState = item.state;
    if (typeof item.state === 'object' && item.state) {
      mappedState = item.state._id;
    }
    setEditingItem({
      ...item,
      id: item.id,
      state: mappedState
    }); 
    setIsPanelOpen(true); 
  };

  const handleView = async (item: any) => { 
    try {
      const response = await api.get(`/master/${moduleName.toLowerCase()}/${item.id}`);
      if (response.data?.success) {
        const doc = response.data.data;
        let mappedState = doc.state;
        if (typeof doc.state === 'object' && doc.state) {
          mappedState = doc.state._id;
        }
        setEditingItem({
          id: doc._id,
          name: doc.name || doc.type || '',
          status: doc.active !== false ? 'Active' : 'Inactive',
          ...doc,
          state: mappedState
        });
        setMode('view');
        setIsPanelOpen(true);
      }
    } catch (error: any) {
      setMode('view');
      setEditingItem(item);
      setIsPanelOpen(true);
    }
  };
  
  const handleDelete = async (id: string, name: string) => {
    if (moduleName === 'State' && data.some(d => d.name === name)) { // Placeholder: needs actual linked-city check
        alert(`This state has linked cities. Remove them first.`);
        return;
    }
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const response = await api.delete(`/master/${moduleName.toLowerCase()}/${id}`);
        if (response.data?.success) {
          toast.success(response.data?.message || `${moduleName} deleted successfully`);
          fetchData();
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || `Failed to delete ${moduleName}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mainFieldKey = moduleName.toLowerCase() === 'service' ? 'type' : 'name';
    const mainValue = editingItem[mainFieldKey] || editingItem.name || '';
    if (data.some(d => (d.name || d.type) === mainValue && d.id !== editingItem.id)) {
        alert("This name already exists.");
        return;
    }

    try {
      const payload: any = {
        [mainFieldKey]: mainValue
      };
      if (editingItem.status !== undefined) {
        payload.active = editingItem.status === 'Active';
      }
      fields.forEach(f => {
        if (f.name !== 'status' && f.name !== 'name' && f.name !== 'type') {
          payload[f.name] = editingItem[f.name];
        }
      });

      if (mode === 'add') {
        const response = await api.post(`/master/${moduleName.toLowerCase()}`, payload);
        if (response.data?.success) {
          toast.success(response.data?.message || `${moduleName} created successfully`);
          fetchData();
        }
      } else {
        const response = await api.put(`/master/${moduleName.toLowerCase()}/${editingItem.id}`, payload);
        if (response.data?.success) {
          toast.success(response.data?.message || `${moduleName} updated successfully`);
          fetchData();
        }
      }
      setIsPanelOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to save ${moduleName}`);
    }
  };

  const getColWidthClass = (col: string, total: number) => {
    const cLower = col.toLowerCase();
    if (total === 2) {
      return 'w-1/3';
    }
    if (total === 4) {
      if (cLower.includes('name')) return 'w-[35%]';
      if (cLower === 'category') return 'w-[20%]';
      if (cLower === 'price') return 'w-[15%]';
      if (cLower === 'status') return 'w-[15%]';
    }
    if (cLower.includes('name')) {
      return 'w-[50%]';
    }
    if (cLower === 'status') {
      return 'w-[15%]';
    }
    return 'w-[20%]';
  };

  const getColAlignClass = (col: string) => {
    const cLower = col.toLowerCase();
    if (cLower.includes('name')) {
      return 'text-left px-6';
    }
    return 'text-center';
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
        <table className="w-full text-left table-fixed">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              {columns.map(col => (
                <th key={col} className={`px-6 py-5 font-semibold text-slate-700 uppercase tracking-wider text-xs ${getColWidthClass(col, columns.length)} ${getColAlignClass(col)}`}>
                  {col}
                </th>
              ))}
              <th className={`px-6 py-5 font-semibold text-slate-700 uppercase tracking-wider text-xs text-right ${columns.length === 2 ? 'w-1/3' : (columns.length === 4 ? 'w-[15%]' : 'w-[15%]')}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((row, index) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                {columns.map(col => {
                  const cUpper = col.toUpperCase();
                  const widthClass = getColWidthClass(col, columns.length);
                  const alignClass = getColAlignClass(col);
                  if (cUpper === 'ID') {
                    return <td key={col} className={`px-6 py-5 font-medium text-slate-900 ${widthClass} ${alignClass}`}>{row.id}</td>;
                  }
                  if (cUpper === 'S.NO' || cUpper === 'S.NO.') {
                    return <td key={col} className={`px-6 py-5 font-medium text-slate-900 ${widthClass} ${alignClass}`}>{index + 1}</td>;
                  }
                  if (col.toLowerCase().includes('name')) {
                    return <td key={col} className={`px-6 py-5 text-slate-600 ${widthClass} ${alignClass}`}>{row.name}</td>;
                  }
                  if (col.toLowerCase() === 'status') {
                    return (
                      <td key={col} className={`px-6 py-5 ${widthClass} ${alignClass}`}>
                        <div className="inline-block">
                          <StatusBadge status={row.status} />
                        </div>
                      </td>
                    );
                  }
                  const fieldKey = col.toLowerCase().replace(' ', '');
                  let cellValue = row[fieldKey];
                  if (cellValue && typeof cellValue === 'object') {
                    cellValue = cellValue.name || cellValue.type || cellValue.title || JSON.stringify(cellValue);
                  }
                  return <td key={col} className={`px-6 py-5 text-slate-600 ${widthClass} ${alignClass}`}>{cellValue || '-'}</td>;
                })}
                <td className={`px-6 py-5 ${columns.length === 2 ? 'w-1/3' : (columns.length === 4 ? 'w-[15%]' : 'w-[15%]')}`}>
                  <div className="flex gap-3 items-center justify-end">
                    <button onClick={() => handleView(row)} className="text-blue-600 hover:text-blue-800 p-1 transition-colors" title="View Details">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800 p-1 transition-colors" title="Edit Item">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(row.id, row.name)} className="text-red-600 hover:text-red-800 p-1 transition-colors" title="Delete Item">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={`${mode === 'add' ? 'Add' : mode === 'edit' ? 'Edit' : 'View'} ${moduleName}`}>
        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {/* Logo / Image Upload container at the top of the form if fields config has an 'image' field */}
            {fields.some(f => f.name === 'image') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Logo / Image</label>
                <label className={`block w-full border-2 border-dashed border-blue-300 rounded-xl p-8 flex flex-col items-center justify-center bg-blue-50/50 transition-colors ${mode === "view" ? 'cursor-default' : 'cursor-pointer hover:bg-blue-50'}`}>
                  <input 
                    type="file" 
                    disabled={mode === "view"} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setPhoto(URL.createObjectURL(file));
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditingItem(prev => ({ ...prev, image: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm mb-3 overflow-hidden">
                    {photo ? (
                      <img src={photo} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <Plus className="w-8 h-8 text-blue-400" />
                    )}
                  </div>
                  {mode !== "view" && <span className="text-sm font-semibold text-blue-600">Upload Image</span>}
                </label>
              </div>
            )}

            {fields.filter(f => f.name !== 'image').map(f => (
                <div key={f.name}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                    {f.type === 'dropdown' ? (
                        <select 
                            disabled={mode === 'view' || (moduleName === 'State' && f.name === 'country')} 
                            value={editingItem[f.name] || (moduleName === 'State' && f.name === 'country' ? 'UAE' : '')} 
                            onChange={(e) => setEditingItem({...editingItem, [f.name]: e.target.value})} 
                            className={`w-full p-3 border border-slate-300 rounded-lg text-sm bg-white disabled:bg-slate-50 disabled:opacity-75`}
                        >
                            <option value="">Select {f.label}</option>
                            {(f.name === 'state' && moduleName.toLowerCase() === 'city' ? stateOptions : (f.options || [])).map((o: any) => {
                              const isObj = typeof o === 'object';
                              const label = isObj ? o.label : o;
                              const val = isObj ? o.value : o;
                              return <option key={val} value={val}>{label}</option>;
                            })}
                        </select>
                    ) : f.type === 'toggle' ? (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-sm font-medium text-slate-700">{editingItem[f.name] || 'Inactive'}</span>
                          <button 
                            type="button" 
                            disabled={mode === 'view'}
                            onClick={() => setEditingItem({...editingItem, [f.name]: editingItem[f.name] === 'Active' ? 'Inactive' : 'Active'})}
                            className={`w-11 h-6 rounded-full transition-colors relative disabled:opacity-50 ${editingItem[f.name] === 'Active' ? 'bg-blue-600' : 'bg-slate-300'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${editingItem[f.name] === 'Active' ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                    ) : (
                        <input type={f.type || 'text'} disabled={mode === 'view'} required value={editingItem[f.name] || ''} onChange={(e) => setEditingItem({...editingItem, [f.name]: e.target.value})} placeholder={f.label} className="w-full p-3 border border-slate-300 rounded-lg text-sm disabled:bg-slate-50 disabled:opacity-75" />
                    )}
                </div>
            ))}
          </div>
          {mode !== 'view' && (
            <div className="pt-4 border-t border-slate-200 bg-white">
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-colors">
                Save
              </button>
            </div>
          )}
        </form>
      </SlidePanel>
    </div>
  );
}
