import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const revenueData = [
  { name: "Mon", revenue: 4000, orders: 240 },
  { name: "Tue", revenue: 3000, orders: 139 },
  { name: "Wed", revenue: 2000, orders: 980 },
  { name: "Thu", revenue: 2780, orders: 390 },
  { name: "Fri", revenue: 1890, orders: 480 },
  { name: "Sat", revenue: 2390, orders: 380 },
  { name: "Sun", revenue: 3490, orders: 430 },
];

const serviceData = [
  { name: "Wash", value: 400 },
  { name: "Fuel", value: 300 },
  { name: "Tire", value: 300 },
  { name: "Battery", value: 200 },
  { name: "Oil", value: 278 },
  { name: "Detailing", value: 189 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f1218] border border-slate-800 p-3 rounded-xl shadow-xl">
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            className="text-sm flex justify-between gap-4"
            style={{ color: entry.color }}
          >
            <span>{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Revenue Overview
          </h2>
          <select className="bg-slate-800/50 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 outline-none">
            <option>This Week</option>
            <option>Last Week</option>
            <option>This Month</option>
          </select>
        </div>
        <div className="h-62.5 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={revenueData}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1f2937"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#34d399"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Service Distribution
          </h2>
          <button className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
            View All
          </button>
        </div>
        <div className="h-62.5 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={serviceData}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1f2937"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "#1f2937", opacity: 0.4 }}
                content={<CustomTooltip />}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
