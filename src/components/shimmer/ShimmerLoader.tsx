import React from 'react';

export interface StatsShimmerProps {
  count?: number;
}

export const StatsShimmer: React.FC<StatsShimmerProps> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="h-26.25 bg-slate-200/70 animate-pulse rounded-2xl p-5 border border-slate-200/50 flex flex-col justify-between"
        >
          <div className="flex justify-between items-center">
            <div className="h-3 w-16 bg-slate-300 rounded" />
            <div className="w-8 h-8 bg-slate-300 rounded-xl" />
          </div>
          <div className="h-6 w-12 bg-slate-300 rounded mt-2" />
        </div>
      ))}
    </>
  );
};

export interface TableShimmerProps {
  rows?: number;
  columns?: number;
}

export const TableShimmer: React.FC<TableShimmerProps> = ({ rows = 5, columns = 4 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="animate-pulse border-b border-slate-100">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <td key={cIdx} className="px-6 py-5">
              <div 
                className={`h-4 bg-slate-200/80 rounded ${
                  cIdx === 0 ? 'w-28' : cIdx === columns - 1 ? 'w-12 ml-auto' : 'w-20 mx-auto'
                }`} 
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};
