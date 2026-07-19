import { useUIStore } from '../store/uiStore';

export function EditProfileModal() {
  const { isEditProfileOpen, toggleEditProfile } = useUIStore();
  if (!isEditProfileOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-lg shadow-xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Profile</h2>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toggleEditProfile(); }}>
          <input type="text" placeholder="Full Name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900" />
          <input type="email" placeholder="Email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900" />
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={toggleEditProfile} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
