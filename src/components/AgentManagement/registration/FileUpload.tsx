import React, { useState, useRef } from 'react';
import { Upload, User } from 'lucide-react';
import { SafeImage } from '../../common/SafeImage';
import { ImageCropModal } from '../../common/ImageCropModal';

export function FileUpload({ name, label }: { name: string; label: string }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setRawSelectedFile(selected);
      setRawPreviewUrl(URL.createObjectURL(selected));
      setCropModalOpen(true);
      e.target.value = '';
    }
  };

  const handleCropComplete = (croppedFile: File, croppedPreviewUrl: string) => {
    setPreviewUrl(croppedPreviewUrl);
  };

  return (
    <div className="space-y-2">
      <div 
        onClick={() => fileInputRef.current?.click()} 
        className="border-2 border-dashed border-blue-200 hover:border-red-500 rounded-2xl p-6 flex flex-col items-center justify-center bg-linear-to-b from-red-50/40 via-red-50/10 to-transparent transition-all group shadow-2xs cursor-pointer hover:shadow-md hover:shadow-red-500/5"
      >
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-200/80 shadow-md mb-3 overflow-hidden group-hover:scale-105 transition-all relative">
          {previewUrl ? (
            <SafeImage src={previewUrl} allowBlob={true} className="w-full h-full object-cover" alt="Preview" />
          ) : (
            <User className="w-8 h-8 text-red-500" />
          )}
        </div>
        <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5" /> Upload Image
        </span>
        <span className="text-[11px] text-slate-400 font-medium mt-1">PNG, JPG or WEBP up to 5MB</span>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={rawPreviewUrl}
        file={rawSelectedFile}
        aspectRatio={1}
        isCircular={false}
        onClose={() => {
          setCropModalOpen(false);
          setRawSelectedFile(null);
          setRawPreviewUrl(null);
        }}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
