export function LiveOrderOverview() {
  const stats = [
    { label: 'Pending', count: 142, total: 3219, color: 'bg-yellow-400' },
    { label: 'Accepted', count: 284, total: 3219, color: 'bg-blue-400' },
    { label: 'Driver Assigned', count: 315, total: 3219, color: 'bg-indigo-400' },
    { label: 'On The Way', count: 412, total: 3219, color: 'bg-purple-400' },
    { label: 'In Progress', count: 521, total: 3219, color: 'bg-orange-400' },
    { label: 'Completed', count: 1480, total: 3219, color: 'bg-emerald-400' },
    { label: 'Cancelled', count: 65, total: 3219, color: 'bg-red-400' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Live Order Overview</h2>
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Live Updates
        </span>
      </div>

      <div className="space-y-5">
        {stats.map((stat, idx) => {
          const percentage = Math.round((stat.count / stat.total) * 100);
          return (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-600 font-medium">{stat.label}</span>
                <span className="text-slate-900 font-medium">{stat.count} <span className="text-slate-500 font-normal">({percentage}%)</span></span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full ${stat.color} transition-all duration-1000 ease-out relative`}
                  style={{ width: `${percentage}%` }}
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
