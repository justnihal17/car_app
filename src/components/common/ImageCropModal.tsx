import React, { useState, useRef, useEffect } from 'react';
import { X, Crop as CropIcon, Check } from 'lucide-react';
import ReactCrop, { type Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  file: File | null;
  aspectRatio?: number;
  isCircular?: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File, croppedPreviewUrl: string) => void;
  outputWidth?: number;
  outputHeight?: number;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  file,
  aspectRatio = 1,
  isCircular = false,
  onClose,
  onCropComplete,
  outputWidth,
  outputHeight,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      setCrop(undefined);
      setCompletedCrop(undefined);
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  };

  const handleApplyCrop = () => {
    const img = imgRef.current;
    if (!img || !completedCrop) return;

    const canvas = document.createElement('canvas');
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    
    // Output resolution
    const pixelRatio = window.devicePixelRatio || 1;
    
    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    let canvasWidth = outputWidth || cropWidth;
    let canvasHeight = outputHeight || cropHeight;

    if (!outputWidth && !outputHeight && aspectRatio) {
      const cropAspect = cropWidth / cropHeight;
      if (cropAspect > aspectRatio) {
        // Crop is wider than target aspect, so canvas height needs to be taller
        canvasWidth = cropWidth;
        canvasHeight = cropWidth / aspectRatio;
      } else {
        // Crop is taller than target aspect, so canvas width needs to be wider
        canvasHeight = cropHeight;
        canvasWidth = cropHeight * aspectRatio;
      }
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use output dimensions directly without pixelRatio scaling to ensure exact file size
    ctx.imageSmoothingQuality = 'high';

    // Calculate scaling to contain crop inside canvas
    const containScale = Math.min(canvasWidth / cropWidth, canvasHeight / cropHeight);
    const drawWidth = cropWidth * containScale;
    const drawHeight = cropHeight * containScale;

    // Calculate centered position
    const drawX = (canvasWidth - drawWidth) / 2;
    const drawY = (canvasHeight - drawHeight) / 2;

    const needsPadding = Math.abs(canvasWidth - drawWidth) > 1 || Math.abs(canvasHeight - drawHeight) > 1;

    if (needsPadding) {
      // Draw blurred background
      ctx.filter = 'blur(24px)';
      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        -20, // slight bleed to hide blur edges
        -20,
        canvasWidth + 40,
        canvasHeight + 40
      );
      ctx.filter = 'none';
      
      // Add a slight dark overlay over the blur for better contrast
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    );

    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }

      const fileName = file ? file.name : 'cropped-image.png';
      const croppedFile = new File([blob], fileName, {
        type: 'image/png',
        lastModified: Date.now(),
      });

      const croppedUrl = URL.createObjectURL(croppedFile);
      onCropComplete(croppedFile, croppedUrl);
      onClose();
    }, 'image/png', 1);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2">
            <CropIcon className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">Crop Image</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-950 flex flex-col items-center justify-center p-6 relative min-h-[400px]">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            circularCrop={isCircular}
            className="max-h-[60vh]"
          >
            <img
              ref={imgRef}
              alt="Crop preview"
              src={imageSrc}
              style={{ maxHeight: '60vh', objectFit: 'contain' }}
              onLoad={onImageLoad}
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white shrink-0 border-t border-slate-100">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyCrop}
              disabled={!completedCrop?.width || !completedCrop?.height}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" /> Apply / Save Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
