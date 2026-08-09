import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Database, Filter, Columns, Download, Play, Save, FileText, Plus, RefreshCw, AlertTriangle, Info } from 'lucide-react';

export function CustomReportBuilder() {
  const [selectedDataset, setSelectedDataset] = useState('Customers');
  const [selectedColumns, setSelectedColumns] = useState(['Name', 'City', 'Emirate', 'Vehicle Brand']);
  const [loading, setLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const datasets: Record<string, { endpoint: string; columns: string[] }> = {
    'Customers': {
      endpoint: '/admin/reports',
      columns: ['Name', 'City', 'Emirate', 'Vehicle Brand', 'Vehicle Model', 'Fuel Type']
    },
    'Users': {
      endpoint: '/customer/customer?limit=50',
      columns: ['Name', 'Phone', 'Email', 'Role', 'Status', 'CreatedAt']
    },
    'Agents': {
      endpoint: '/agent/agent?limit=50',
      columns: ['Name', 'Phone', 'Email', 'Status', 'DutyStatus', 'City']
    },
    'Orders': {
      endpoint: '/order/admin/orders?limit=50',
      columns: ['Order Number', 'Customer', 'Agent', 'Amount', 'Status', 'Date']
    }
  };

  const fetchDatasetData = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = datasets[selectedDataset] || datasets['Customers'];
      const response = await api.get(config.endpoint);
      const raw = response.data?.data || response.data || {};
      setReportData(raw);
    } catch (err: any) {
      console.error('Failed to load dataset:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch report dataset.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasetData();
  }, [selectedDataset]);

  // Extract preview rows dynamically from API response
  const previewRows = React.useMemo(() => {
    if (!reportData) return [];
    if (selectedDataset === 'Customers') {
      const byCity = reportData.customers?.byCity || [];
      if (Array.isArray(byCity)) {
        return byCity.map((c: any) => ({
          'Name': c.name || c.city || 'Customer Group',
          'City': c.city || c.name || 'N/A',
          'State': c.state || 'N/A',
          'Vehicle Brand': c.brand || 'N/A',
          'Vehicle Model': c.model || 'N/A',
          'Fuel Type': c.fuelType || 'N/A'
        }));
      }
    }

    const list = Array.isArray(reportData) 
      ? reportData 
      : (reportData.customers || reportData.users || reportData.agents || reportData.orders || reportData.list || reportData.data || []);
    
    if (Array.isArray(list)) {
      return list.slice(0, 10).map((item: any, i: number) => ({
        'Name': item.fullName || item.name || item.title || `User #${i+1}`,
        'Phone': item.mobileNumber || item.phone || 'N/A',
        'Email': item.email || 'N/A',
        'Role': item.role || 'USER',
        'Status': item.status || (item.isActive ? 'ACTIVE' : 'INACTIVE'),
        'DutyStatus': item.dutyStatus || item.status || 'OFFLINE',
        'City': item.city?.name || item.city || 'N/A',
        'State': item.state?.name || item.state || 'N/A',
        'Order Number': item.orderNumber || item.orderId || item._id || `ORD-${i+1}`,
        'Customer': item.user?.name || item.customerName || 'N/A',
        'Agent': item.agent?.name || item.agentName || 'Unassigned',
        'Amount': item.totalAmount ? `₹${item.totalAmount}` : '₹0',
        'Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
        'Vehicle Brand': item.brand?.name || item.brand || 'N/A',
        'Vehicle Model': item.model?.name || item.model || 'N/A',
        'Fuel Type': item.fuelType?.name || item.fuelType || 'N/A'
      }));
    }
    return [];
  }, [reportData, selectedDataset]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Custom Report Builder</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Design and generate custom data exports directly from system data</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchDatasetData}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 transition-all text-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />} Generate Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Configuration Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Database className="w-4 h-4 text-red-600" /> 1. Select Dataset
            </h3>
            <div className="space-y-1.5">
              {Object.keys(datasets).map(dataset => (
                <button
                  key={dataset}
                  onClick={() => {
                    setSelectedDataset(dataset);
                    setSelectedColumns(datasets[dataset].columns.slice(0, 4));
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDataset === dataset 
                      ? 'bg-red-50 text-red-600 border border-red-200/80' 
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent font-medium'
                  }`}
                >
                  {dataset} Dataset
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Columns className="w-4 h-4 text-blue-600" /> 2. Select Columns
            </h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
              {(datasets[selectedDataset]?.columns || []).map(col => (
                <label key={col} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors text-xs">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                    checked={selectedColumns.includes(col)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedColumns([...selectedColumns, col]);
                      else setSelectedColumns(selectedColumns.filter(c => c !== col));
                    }}
                  />
                  <span className="font-semibold text-slate-800">{col}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Data Preview */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" /> Report Preview ({selectedDataset})
            </h3>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar p-0">
            {loading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-6 h-6 text-red-600 animate-spin" />
                <p className="text-xs text-slate-500 font-medium">Fetching real API dataset...</p>
              </div>
            ) : previewRows.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-2">
                <Info className="w-8 h-8 text-slate-300" />
                <p className="text-xs text-slate-500 font-medium">No records returned for {selectedDataset}</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-max text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                    {selectedColumns.map(col => (
                      <th key={col} className="px-5 py-3.5 font-bold">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewRows.map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                      {selectedColumns.map(col => (
                        <td key={col} className="px-5 py-3.5 text-slate-800 font-medium">
                          {row[col] ?? 'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span>Showing real API preview of {previewRows.length} records</span>
            <span className="font-bold text-slate-700">Dataset: {selectedDataset}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
