import React from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { UserRegistrationFormValues } from './UserRegistrationSchema';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus, Copy, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SortableAddressCard({ id, index, form, remove, append }: { id: string, index: number, form: UseFormReturn<UserRegistrationFormValues>, remove: (index: number) => void, append: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const { register, formState: { errors } } = form;

  const handleDuplicate = () => {
    const currentValues = form.getValues(`addresses.${index}`);
    append({ ...currentValues, id: Date.now().toString() });
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative ${isDragging ? 'ring-2 ring-red-500 shadow-xl' : ''}`}>
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab hover:bg-slate-100 p-1 rounded">
            <GripVertical className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500" />
            Address #{index + 1}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleDuplicate} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Duplicate">
            <Copy className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => remove(index)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Address Label</label>
          <select {...register(`addresses.${index}.label`)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:border-red-500 transition-colors">
            <option value="Home">Home</option>
            <option value="Office">Office</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Street</label>
          <input {...register(`addresses.${index}.street`)} placeholder="e.g. Business Bay" className={`w-full p-2.5 bg-slate-50 border ${errors.addresses?.[index]?.street ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-red-500'} rounded-lg text-sm text-slate-900 outline-none transition-colors`} />
          {errors.addresses?.[index]?.street && <p className="text-xs text-red-500">{errors.addresses[index]?.street?.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">City</label>
          <select {...register(`addresses.${index}.city`)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:border-red-500 transition-colors">
            <option value="Dubai">Dubai</option>
            <option value="Abu Dhabi">Abu Dhabi</option>
            <option value="Sharjah">Sharjah</option>
            <option value="Ajman">Ajman</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Country</label>
          <select {...register(`addresses.${index}.country`)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:border-red-500 transition-colors">
            <option value="United Arab Emirates">United Arab Emirates</option>
          </select>
        </div>
        <div className="md:col-span-2 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register(`addresses.${index}.isDefault`)} className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
            <span className="text-sm font-medium text-slate-700">Set as Default Address</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export function AddressSection({ form }: { form: UseFormReturn<UserRegistrationFormValues> }) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'addresses',
    keyName: '_hookFormKey' // override to avoid conflict if using own id
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex(item => item.id === active.id);
      const newIndex = fields.findIndex(item => item.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Address Information</h2>
          <p className="text-sm text-slate-500 mt-1">Addresses ({fields.length})</p>
        </div>
        <button
          type="button"
          onClick={() => append({ id: Date.now().toString(), label: 'Home', street: '', city: 'Dubai', country: 'United Arab Emirates', isDefault: fields.length === 0 })}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      <div className="space-y-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map(f => f.id || f._hookFormKey)} strategy={verticalListSortingStrategy}>
            <AnimatePresence>
              {fields.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                  No address added
                </div>
              ) : (
                fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SortableAddressCard id={field.id!} index={index} form={form} remove={remove} append={append} />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
