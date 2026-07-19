export function NotificationPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed top-16 right-6 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 z-50">
      <h3 className="text-slate-900 font-bold mb-4">Notifications</h3>
      <div className="space-y-4">
        <p className="text-slate-500 text-sm">No new notifications.</p>
      </div>
    </div>
  );
}
