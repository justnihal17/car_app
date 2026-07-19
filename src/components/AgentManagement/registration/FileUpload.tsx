import { Upload, X, FileText, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export function FileUpload({ name, label }: { name: string, label: string }) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${file ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-400 bg-slate-50'}`}>
        {file ? (
            <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-blue-600" />
                <span className="text-sm font-medium">{file.name}</span>
                <X className="w-4 h-4 cursor-pointer" onClick={() => setFile(null)} />
            </div>
        ) : (
            <>
                <Upload className="mx-auto w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600">Drag & drop or <span className="text-blue-600 font-medium">browse</span></p>
                <p className="text-xs text-slate-400">PDF, JPG, PNG (Max 5MB)</p>
                <input type="file" className="hidden" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
            </>
        )}
      </div>
    </div>
  );
}
