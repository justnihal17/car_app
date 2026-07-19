import { useState } from 'react';
import { Database, Filter, Columns, Download, Play, Save, FileText, Plus } from 'lucide-react';

export function CustomReportBuilder() {
  const [selectedDataset, setSelectedDataset] = useState('Orders');
  const [selectedColumns, setSelectedColumns] = useState(['Order ID', 'Customer Name', 'Amount', 'Date']);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Custom Report Builder</h2>
          <p className="text-sm text-slate-400 mt-1">Design and generate custom data exports</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 transition-colors text-sm shadow-sm">
            <Save className="w-4 h-4" /> Save Template
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/20 transition-all text-sm">
            <Play className="w-4 h-4" /> Generate Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Configuration Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" /> 1. Select Dataset
            </h3>
            <div className="space-y-2">
              {['Users', 'Drivers', 'Services', 'Orders', 'Payments', 'Refunds', 'Notifications'].map(dataset => (
                <button
                  key={dataset}
                  onClick={() => setSelectedDataset(dataset)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDataset === dataset 
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {dataset} Data
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Columns className="w-4 h-4 text-blue-400" /> 2. Columns
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {['Order ID', 'Customer Name', 'Driver Name', 'Service Type', 'Amount', 'Tax', 'Discount', 'Date', 'Status', 'City'].map(col => (
                <label key={col} className="flex items-center gap-3 p-2 rounded hover:bg-slate-900 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                    checked={selectedColumns.includes(col)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedColumns([...selectedColumns, col]);
                      else setSelectedColumns(selectedColumns.filter(c => c !== col));
                    }}
                  />
                  <span className="text-sm text-slate-300">{col}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-400" /> 3. Filters
              </h3>
              <button className="text-emerald-400 hover:text-emerald-300 p-1"><Plus className="w-4 h-4"/></button>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                 <div className="text-slate-400 mb-1">Date Range</div>
                 <div className="text-white font-medium">Last 30 Days</div>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                 <div className="text-slate-400 mb-1">Status</div>
                 <div className="text-white font-medium">Completed, Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Preview */}
        <div className="lg:col-span-3 bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" /> Report Preview
            </h3>
            <div className="flex gap-2">
              <button className="p-2 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-2 text-xs font-medium">
                <Download className="w-4 h-4" /> CSV
              </button>
              <button className="p-2 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-2 text-xs font-medium">
                <Download className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar p-0">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
              <thead>
                <tr className="bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  {selectedColumns.map(col => (
                    <th key={col} className="px-5 py-4 font-medium">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-800">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                  <tr key={row} className="hover:bg-slate-800/20 transition-colors">
                    {selectedColumns.map(col => (
                      <td key={col} className="px-5 py-4 text-slate-300">
                        {col === 'Order ID' ? `ORD-902${row}0` : 
                         col === 'Amount' ? `$${45 * row}.00` :
                         col === 'Date' ? `2026-07-12` : 'Sample Data'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 bg-slate-900/30">
            <span>Showing preview of first 8 rows</span>
            <span>Total Estimated Rows: 1,245</span>
          </div>
        </div>
      </div>
    </div>
  );
}
