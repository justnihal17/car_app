import { MoreHorizontal, Search, Filter } from 'lucide-react';

const RECENT_ORDERS = [
  { id: 'ORD-9921', customer: 'Alex Johnson', driver: 'Sam Smith', vehicle: 'Tesla Model 3', service: 'Super Wash', location: 'Downtown', time: '10:24 AM', amount: '$45.00', status: 'Completed', payment: 'Paid' },
  { id: 'ORD-9922', customer: 'Maria Garcia', driver: 'Unassigned', vehicle: 'Honda Civic', service: 'Fuel Delivery', location: 'Westside', time: '10:30 AM', amount: '$60.00', status: 'Pending', payment: 'Unpaid' },
  { id: 'ORD-9923', customer: 'James Wilson', driver: 'Michael Brown', vehicle: 'Ford F-150', service: 'Tire Change', location: 'North Park', time: '10:45 AM', amount: '$120.00', status: 'On The Way', payment: 'Paid' },
  { id: 'ORD-9924', customer: 'Linda Davis', driver: 'Emma Davis', vehicle: 'Toyota Camry', service: 'Battery Jump', location: 'East End', time: '11:05 AM', amount: '$85.00', status: 'In Progress', payment: 'Paid' },
  { id: 'ORD-9925', customer: 'Robert Miller', driver: 'David Wilson', vehicle: 'BMW X5', service: 'Detailing', location: 'South Hill', time: '11:15 AM', amount: '$150.00', status: 'Cancelled', payment: 'Refunded' },
];

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Completed': 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    'Pending': 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    'On The Way': 'bg-purple-400/10 text-purple-400 border-purple-400/20',
    'In Progress': 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    'Cancelled': 'bg-red-400/10 text-red-400 border-red-400/20',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      {status}
    </span>
  );
};

export function RecentOrdersTable() {
  return (
    <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden">
      <div className="p-5 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Recent Orders</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="bg-slate-900 border border-slate-800 text-sm text-white rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-emerald-500/50 w-full sm:w-48 transition-all"
            />
          </div>
          <button className="p-1.5 bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
              <th className="px-5 py-3 font-medium">Order ID</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Driver</th>
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Payment</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-800">
            {RECENT_ORDERS.map((order) => (
              <tr key={order.id} className="hover:bg-slate-800/20 transition-colors group">
                <td className="px-5 py-4 font-medium text-slate-300">{order.id}</td>
                <td className="px-5 py-4 text-white">
                  <div>{order.customer}</div>
                  <div className="text-xs text-slate-500">{order.vehicle}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={order.driver === 'Unassigned' ? 'text-yellow-400/80 text-xs font-medium' : 'text-slate-300'}>
                    {order.driver}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-300">
                  <div>{order.service}</div>
                  <div className="text-xs text-slate-500">{order.time} • {order.location}</div>
                </td>
                <td className="px-5 py-4 font-medium text-slate-300">{order.amount}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium ${order.payment === 'Paid' ? 'text-emerald-400' : order.payment === 'Refunded' ? 'text-gray-400' : 'text-orange-400'}`}>
                    {order.payment}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span>Showing 1 to 5 of 3,219 entries</span>
        <div className="flex gap-1">
          <button className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-50 transition-colors" disabled>Previous</button>
          <button className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-white">1</button>
          <button className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors">2</button>
          <button className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors">3</button>
          <span className="px-2 py-1.5">...</span>
          <button className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
}
