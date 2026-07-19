import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

export function AddressSection() {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "addresses" });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Addresses</h3>
        <button type="button" onClick={() => append({ label: 'Home', line1: '', city: '', state: '', zip: '' })} className="text-blue-600 flex items-center gap-1 text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 relative">
          <button type="button" onClick={() => remove(index)} className="absolute top-2 right-2 text-red-500"><Trash2 className="w-4 h-4" /></button>
          <input {...register(`addresses.${index}.label`)} placeholder="Label (Home/Office)" className="p-3 rounded-lg border border-slate-200" />
          <input {...register(`addresses.${index}.line1`)} placeholder="Address Line 1" className="p-3 rounded-lg border border-slate-200" />
          <input {...register(`addresses.${index}.city`)} placeholder="City" className="p-3 rounded-lg border border-slate-200" />
          <input {...register(`addresses.${index}.zip`)} placeholder="Postal Code" className="p-3 rounded-lg border border-slate-200" />
        </div>
      ))}
    </div>
  );
}
