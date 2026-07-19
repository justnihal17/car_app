import { ReactNode } from 'react';

export function FormCard({ title, children }: { title: string, children: ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">{title}</h3>
      {children}
    </div>
  );
}
