import React from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { UserRegistrationFormValues } from './UserRegistrationSchema';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus, Copy, Car } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SortableVehicleCard({ id, index, form, remove, append }: { id: string, index: number, form: UseFormReturn<UserRegistrationFormValues>, remove: (index: number) => void, append: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const { register, formState: { errors } } = form;

  const handleDuplicate = () => {
    const currentValues = form.getValues(`vehicles.${index}`);
    append({ ...currentValues, id: Date.now().toString() });
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative ${isDragging ? 'ring-2 ring-blue-500 shadow-xl' : ''}`}>
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab hover:bg-slate-100 p-1 rounded">
            <GripVertical className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-500" />
            Vehicle #{index + 1}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleDuplicate} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Duplicate">
            <Copy className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => remove(index)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Brand</label>
          <select {...register(`vehicles.${index}.brand`)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 transition-colors">
            <option value="">Select Brand</option>
            <option value="Toyota">Toyota</option>
            <option value="Honda">Honda</option>
            <option value="BMW">BMW</option>
            <option value="Mercedes">Mercedes</option>
            <option value="Audi">Audi</option>
            <option value="Nissan">Nissan</option>
            <option value="Tesla">Tesla</option>
          </select>
          {errors.vehicles?.[index]?.brand && <p className="text-xs text-red-500">{errors.vehicles[index]?.brand?.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Model</label>
          <input {...register(`vehicles.${index}.model`)} placeholder="e.g. Camry" className={`w-full p-2.5 bg-slate-50 border ${errors.vehicles?.[index]?.model ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'} rounded-lg text-sm text-slate-900 outline-none transition-colors`} />
          {errors.vehicles?.[index]?.model && <p className="text-xs text-red-500">{errors.vehicles[index]?.model?.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Registration Number</label>
          <input {...register(`vehicles.${index}.registrationNumber`)} placeholder="e.g. D12345" className={`w-full p-2.5 bg-slate-50 border ${errors.vehicles?.[index]?.registrationNumber ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'} rounded-lg text-sm text-slate-900 outline-none transition-colors`} />
          {errors.vehicles?.[index]?.registrationNumber && <p className="text-xs text-red-500">{errors.vehicles[index]?.registrationNumber?.message}</p>}
        </div>
      </div>
    </div>
  );
}

export function VehicleSection({ form }: { form: UseFormReturn<UserRegistrationFormValues> }) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'vehicles',
    keyName: '_hookFormKey'
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
          <h2 className="text-lg font-semibold text-slate-900">Vehicle Information</h2>
          <p className="text-sm text-slate-500 mt-1">Vehicles ({fields.length})</p>
        </div>
        <button
          type="button"
          onClick={() => append({ id: Date.now().toString(), brand: '', model: '', registrationNumber: '' })}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      <div className="space-y-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map(f => f.id || f._hookFormKey)} strategy={verticalListSortingStrategy}>
            <AnimatePresence>
              {fields.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                  No vehicle added
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
                    <SortableVehicleCard id={field.id!} index={index} form={form} remove={remove} append={append} />
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
