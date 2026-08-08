import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchLiveOverview } from '../store/orderSlice';
import { Calendar, ChevronDown, X } from 'lucide-react';

function getDateRangeParams(timeRange: string, customDate?: string) {
  const today = new Date();
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (timeRange === 'today') {
    const todayStr = formatDate(today);
    return { startDate: todayStr, endDate: todayStr };
  }
  
  if (timeRange === 'this_week') {
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    return { startDate: formatDate(startOfWeek), endDate: formatDate(today) };
  }

  if (timeRange === 'this_month') {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return { startDate: formatDate(startOfMonth), endDate: formatDate(today) };
  }

  if (timeRange === 'this_year') {
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    return { startDate: formatDate(startOfYear), endDate: formatDate(today) };
  }

  if (timeRange === 'custom' && customDate) {
    return { startDate: customDate, endDate: customDate };
  }

  return {};
}

export function LiveOrderOverview() {
  const dispatch = useDispatch<AppDispatch>();
  const { liveOverview, orders } = useSelector((state: RootState) => state.order);
  const [timeRange, setTimeRange] = useState('today');
  const [selectedDate, setSelectedDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = getDateRangeParams(timeRange, selectedDate);
    dispatch(fetchLiveOverview(params));
  }, [dispatch, timeRange, selectedDate]);

  const handleSelectChange = (val: string) => {
    setTimeRange(val);
    if (val === 'custom') {
      setShowDatePicker(true);
      setTimeout(() => {
        dateInputRef.current?.showPicker?.();
      }, 100);
    } else {
      setShowDatePicker(false);
    }
  };

  const loadedCount = orders.length || 1;

  const stats = liveOverview ? [
    { label: 'Pending', count: liveOverview.pending?.count ?? 0, percentage: liveOverview.pending?.percentage ?? 0, color: 'bg-yellow-400' },
    { label: 'Accepted', count: liveOverview.accepted?.count ?? 0, percentage: liveOverview.accepted?.percentage ?? 0, color: 'bg-blue-400' },
    { label: 'Agent Assigned', count: liveOverview.agentAssigned?.count ?? 0, percentage: liveOverview.agentAssigned?.percentage ?? 0, color: 'bg-red-400' },
    { label: 'On The Way', count: liveOverview.onTheWay?.count ?? 0, percentage: liveOverview.onTheWay?.percentage ?? 0, color: 'bg-purple-400' },
    { label: 'In Progress', count: liveOverview.inProgress?.count ?? 0, percentage: liveOverview.inProgress?.percentage ?? 0, color: 'bg-orange-400' },
    { label: 'Completed', count: liveOverview.completed?.count ?? 0, percentage: liveOverview.completed?.percentage ?? 0, color: 'bg-emerald-400' },
    { label: 'Cancelled', count: liveOverview.cancelled?.count ?? 0, percentage: liveOverview.cancelled?.percentage ?? 0, color: 'bg-red-400' },
  ] : [
    { label: 'Pending', count: orders.filter(o => ['pending', 'created', 'new', 'unassigned'].includes((o.status || '').toLowerCase())).length, percentage: Math.round((orders.filter(o => ['pending', 'created', 'new', 'unassigned'].includes((o.status || '').toLowerCase())).length / loadedCount) * 100) || 0, color: 'bg-yellow-400' },
    { label: 'Accepted', count: orders.filter(o => ['accepted'].includes((o.status || '').toLowerCase())).length, percentage: Math.round((orders.filter(o => ['accepted'].includes((o.status || '').toLowerCase())).length / loadedCount) * 100) || 0, color: 'bg-blue-400' },
    { label: 'Agent Assigned', count: orders.filter(o => ['assigned'].includes((o.status || '').toLowerCase())).length, percentage: Math.round((orders.filter(o => ['assigned'].includes((o.status || '').toLowerCase())).length / loadedCount) * 100) || 0, color: 'bg-red-400' },
    { label: 'On The Way', count: orders.filter(o => ['on the way', 'on_the_way'].includes((o.status || '').toLowerCase())).length, percentage: Math.round((orders.filter(o => ['on the way', 'on_the_way'].includes((o.status || '').toLowerCase())).length / loadedCount) * 100) || 0, color: 'bg-purple-400' },
    { label: 'In Progress', count: orders.filter(o => ['started', 'in progress', 'in_progress', 'arrived'].includes((o.status || '').toLowerCase())).length, percentage: Math.round((orders.filter(o => ['started', 'in progress', 'in_progress', 'arrived'].includes((o.status || '').toLowerCase())).length / loadedCount) * 100) || 0, color: 'bg-orange-400' },
    { label: 'Completed', count: orders.filter(o => ['completed', 'delivered', 'done'].includes((o.status || '').toLowerCase())).length, percentage: Math.round((orders.filter(o => ['completed', 'delivered', 'done'].includes((o.status || '').toLowerCase())).length / loadedCount) * 100) || 0, color: 'bg-emerald-400' },
    { label: 'Cancelled', count: orders.filter(o => ['cancelled', 'canceled', 'refunded', 'rejected'].includes((o.status || '').toLowerCase())).length, percentage: Math.round((orders.filter(o => ['cancelled', 'canceled', 'refunded', 'rejected'].includes((o.status || '').toLowerCase())).length / loadedCount) * 100) || 0, color: 'bg-red-400' },
  ];

  return (
    <div className="bg-white p-4 2xl:p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4 2xl:mb-6">
        <h2 className="text-base 2xl:text-lg font-bold text-slate-900 tracking-tight">Order Overview</h2>
        
        <div className="flex items-center gap-2">
          {showDatePicker && (
            <div className="relative flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs animate-in fade-in zoom-in-95">
              <input 
                ref={dateInputRef}
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer font-sans"
              />
              {selectedDate && (
                <button 
                  onClick={() => setSelectedDate('')} 
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/50"
                  title="Clear date"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          <div className="relative flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 shadow-xs transition-all cursor-pointer group">
            <button 
              type="button"
              onClick={() => {
                setShowDatePicker(prev => !prev);
                if (!showDatePicker) {
                  setTimeout(() => dateInputRef.current?.showPicker?.(), 100);
                }
              }}
              className="text-slate-500 group-hover:text-red-600 transition-colors flex items-center justify-center"
              title="Open Calendar Picker"
            >
              <Calendar className="w-4 h-4" />
            </button>

            <select 
              value={timeRange} 
              onChange={(e) => handleSelectChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer pr-4 appearance-none"
            >
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Date...</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors" />
          </div>
        </div>
      </div>

      <div className="space-y-4 2xl:space-y-5">
        {stats.map((stat, idx) => {
          return (
            <div key={idx}>
              <div className="flex justify-between text-xs 2xl:text-sm mb-1.5">
                <span className="text-slate-600 font-medium">{stat.label}</span>
                <span className="text-slate-900 font-medium">{stat.count} <span className="text-slate-500 font-normal">({stat.percentage}%)</span></span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 2xl:h-2 overflow-hidden">
                <div 
                  className={`h-1.5 2xl:h-2 rounded-full ${stat.color} transition-all duration-1000 ease-out relative`}
                  style={{ width: `${Math.min(100, Math.max(0, stat.percentage))}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
