import { useState } from 'react';
import { X, Plus } from 'lucide-react';

export function SkillChips() {
  const [skills, setSkills] = useState(['Car Wash', 'Oil Change']);
  const [input, setInput] = useState('');

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">Professional Skills</label>
      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[48px] focus-within:ring-2 focus-within:ring-blue-500">
        {skills.map(skill => (
          <span key={skill} className="flex items-center gap-1 bg-white border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-sm shadow-sm">
            {skill} <X className="w-3 h-3 cursor-pointer" onClick={() => setSkills(skills.filter(s => s !== skill))} />
          </span>
        ))}
        <div className='flex items-center gap-1'>
            <Plus className='w-4 h-4 text-slate-400'/>
            <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setSkills([...skills, input]); setInput(''); } }}
            placeholder="Add skill..." 
            className="bg-transparent outline-none flex-1 text-sm"
            />
        </div>
      </div>
    </div>
  );
}
