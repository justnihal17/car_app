import React, { useState, useRef, useEffect } from 'react';
import { X, Crop as CropIcon, Check, Maximize2, Square, RectangleHorizontal, RefreshCw } from 'lucide-react';
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
  aspectRatio,
  isCircular = false,
  onClose,
  onCropComplete,
  outputWidth,
  outputHeight,
}: ImageCropModalProps) {
  const [selectedAspect, setSelectedAspect] = useState<number | undefined>(aspectRatio);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedAspect(aspectRatio);
      setCrop(undefined);
      setCompletedCrop(undefined);
    }
  }, [isOpen, imageSrc, aspectRatio]);

  if (!isOpen || !imageSrc) return null;

  const initCrop = (width: number, height: number, aspect?: number) => {
    if (aspect) {
      const initialPercentCrop = centerAspectCrop(width, height, aspect);
      setCrop(initialPercentCrop);
      
      const pixelCrop: PixelCrop = {
        unit: 'px',
        x: (initialPercentCrop.x / 100) * width,
        y: (initialPercentCrop.y / 100) * height,
        width: (initialPercentCrop.width / 100) * width,
        height: (initialPercentCrop.height / 100) * height,
      };
      setCompletedCrop(pixelCrop);
    } else {
      // Freeform crop: initialize to 90% box
      const initialPercentCrop: Crop = {
        unit: '%',
        x: 5,
        y: 5,
        width: 90,
        height: 90,
      };
      setCrop(initialPercentCrop);
      
      const pixelCrop: PixelCrop = {
        unit: 'px',
        x: width * 0.05,
        y: height * 0.05,
        width: width * 0.9,
        height: height * 0.9,
      };
      setCompletedCrop(pixelCrop);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    initCrop(width, height, selectedAspect);
  };

  const handleAspectChange = (newAspect: number | undefined) => {
    setSelectedAspect(newAspect);
    const img = imgRef.current;
    if (img) {
      initCrop(img.width, img.height, newAspect);
    }
  };

  const handleSelectFullImage = () => {
    setSelectedAspect(undefined);
    const img = imgRef.current;
    if (img) {
      const fullPercentCrop: Crop = {
        unit: '%',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
      setCrop(fullPercentCrop);
      setCompletedCrop({
        unit: 'px',
        x: 0,
        y: 0,
        width: img.width,
        height: img.height,
      });
    }
  };

  const handleApplyCrop = () => {
    const img = imgRef.current;
    if (!img) return;

    // If completedCrop is missing or 0, fallback to full image
    const finalCrop = (completedCrop && completedCrop.width > 0 && completedCrop.height > 0)
      ? completedCrop
      : {
          unit: 'px' as const,
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
        };

    const canvas = document.createElement('canvas');
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    
    const cropX = Math.max(0, finalCrop.x * scaleX);
    const cropY = Math.max(0, finalCrop.y * scaleY);
    const cropWidth = Math.min(img.naturalWidth - cropX, finalCrop.width * scaleX);
    const cropHeight = Math.min(img.naturalHeight - cropY, finalCrop.height * scaleY);

    const canvasWidth = outputWidth || cropWidth;
    const canvasHeight = outputHeight || cropHeight;

    canvas.width = Math.max(1, Math.round(canvasWidth));
    canvas.height = Math.max(1, Math.round(canvasHeight));

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingQuality = 'high';
    ctx.imageSmoothingEnabled = true;

    // Draw exact cropped area
    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }

      const originalName = file ? file.name.replace(/\.[^/.]+$/, "") : 'cropped-image';
      const fileName = `${originalName}-cropped.png`;
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
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <CropIcon className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Crop & Adjust Image</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aspect Ratio Toolbar */}
        {!isCircular && (
          <div className="px-4 sm:px-6 py-2.5 bg-slate-100/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 mr-1 uppercase tracking-wider">Aspect Ratio:</span>
              
              <button
                type="button"
                onClick={() => handleAspectChange(undefined)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedAspect === undefined
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                <Maximize2 className="w-3 h-3" /> Free Crop
              </button>

              <button
                type="button"
                onClick={() => handleAspectChange(1)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedAspect === 1
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                <Square className="w-3 h-3" /> 1:1
              </button>

              <button
                type="button"
                onClick={() => handleAspectChange(16 / 9)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedAspect === 16 / 9
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                <RectangleHorizontal className="w-3 h-3" /> 16:9
              </button>

              <button
                type="button"
                onClick={() => handleAspectChange(4 / 3)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedAspect === 4 / 3
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                4:3
              </button>

              <button
                type="button"
                onClick={() => handleAspectChange(3 / 2)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedAspect === 3 / 2
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                3:2
              </button>
            </div>

            <button
              type="button"
              onClick={handleSelectFullImage}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-slate-200/70 text-slate-700 border border-slate-200 transition-all cursor-pointer flex items-center gap-1"
              title="Reset selection to full image"
            >
              <RefreshCw className="w-3 h-3" /> Full Image
            </button>
          </div>
        )}

        {/* Cropper Canvas Area */}
        <div className="flex-1 overflow-auto bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 relative min-h-[350px]">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={selectedAspect}
            circularCrop={isCircular}
            className="max-h-[58vh]"
          >
            <img
              ref={imgRef}
              alt="Crop preview"
              src={imageSrc}
              style={{ maxHeight: '58vh', objectFit: 'contain' }}
              onLoad={onImageLoad}
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-4 bg-white shrink-0 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500">
            {completedCrop && completedCrop.width > 0 && imgRef.current ? (
              <span>
                Selection: <strong className="text-slate-800">{Math.round(completedCrop.width * (imgRef.current.naturalWidth / imgRef.current.width))} × {Math.round(completedCrop.height * (imgRef.current.naturalHeight / imgRef.current.height))} px</strong>
              </span>
            ) : (
              <span>Drag corners to select custom area</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyCrop}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md shadow-red-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Apply Crop
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
