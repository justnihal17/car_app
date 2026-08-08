import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export function WelcomeSection({ onViewChange }: { onViewChange: (view: string) => void }) {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <section className="flex flex-col justify-center bg-white/80 backdrop-blur-xl p-7 rounded-3xl border border-slate-200/70 shadow-sm relative overflow-hidden min-h-[100px]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight capitalize">Good Morning, {user?.name || 'Admin'} 👋</h1>
      </div>
    </section>
  );
}
