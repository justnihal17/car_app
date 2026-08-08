import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Crop, Move } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  file: File | null;
  aspectRatio?: number; // e.g. 2.6 for Banner
  isCircular?: boolean; // defaults to true for backwards compatibility
  onClose: () => void;
  onCropComplete: (croppedFile: File, croppedPreviewUrl: string) => void;
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  file,
  aspectRatio = 1,
  isCircular = true,
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Base the maximum dimension of the crop box on 250px
  const maxCropDim = 250;
  const cropBoxWidth = aspectRatio >= 1 ? maxCropDim : maxCropDim * aspectRatio;
  const cropBoxHeight = aspectRatio >= 1 ? maxCropDim / aspectRatio : maxCropDim;
  
  const [baseScale, setBaseScale] = useState(1);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset state when modal opens with a new image
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setBaseScale(1);
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    const initialScale = Math.min(cropBoxWidth / img.naturalWidth, cropBoxHeight / img.naturalHeight) || (maxCropDim / Math.max(img.naturalWidth, img.naturalHeight));
    setBaseScale(initialScale);
  };

  // Handle Drag Image
  const handleMouseDownImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingImage(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingImage) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingImage(false);
  };

  // Touch handlers for mobile
  const handleTouchStartImage = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDraggingImage(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingImage && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDraggingImage(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Crop & Export to Canvas
  const handleApplyCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const baseOutputDim = 800; // Output image base resolution
    
    canvas.width = aspectRatio >= 1 ? baseOutputDim : baseOutputDim * aspectRatio;
    canvas.height = aspectRatio >= 1 ? baseOutputDim / aspectRatio : baseOutputDim;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with white or transparent based on requirement. We use transparent for profile pics.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Center canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const scaleFactorX = canvas.width / cropBoxWidth;
    const scaleFactorY = canvas.height / cropBoxHeight;
    const scaleFactor = Math.min(scaleFactorX, scaleFactorY);
    
    const currentScale = baseScale * zoom * scaleFactor;

    const renderWidth = img.naturalWidth * currentScale;
    const renderHeight = img.naturalHeight * currentScale;

    const posX = position.x * scaleFactor;
    const posY = position.y * scaleFactor;

    ctx.drawImage(
      img,
      posX - renderWidth / 2,
      posY - renderHeight / 2,
      renderWidth,
      renderHeight
    );

    ctx.restore();

    canvas.toBlob((blob) => {
      if (!blob) return;

      const fileName = file ? file.name : 'cropped-image.png';
      const croppedFile = new File([blob], fileName, {
        type: 'image/png',
        lastModified: Date.now(),
      });

      const croppedUrl = URL.createObjectURL(croppedFile);
      onCropComplete(croppedFile, croppedUrl);
      onClose();
    }, 'image/png', 0.95);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Crop className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">Crop Image</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Phone-Style Crop Editor */}
        <div
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="p-6 flex flex-col items-center justify-center bg-slate-950 select-none relative overflow-hidden min-h-[350px]"
        >
          {/* Editor Container (300x300) */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDownImage}
            onTouchStart={handleTouchStartImage}
            className="w-[300px] h-[300px] relative cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-black/40"
          >
            {/* Scaled/Pan Image */}
            <div
              className="absolute transition-transform duration-75"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                className="max-w-none pointer-events-none origin-center"
                onLoad={handleImageLoad}
                style={{
                  width: imageSize.width > 0 ? `${imageSize.width * baseScale}px` : 'auto',
                  height: imageSize.height > 0 ? `${imageSize.height * baseScale}px` : 'auto',
                }}
                crossOrigin="anonymous"
              />
            </div>

            {/* Perfect Crop Box Overlay */}
            <div
              className={`absolute pointer-events-none border-2 border-red-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.75)] transition-all duration-75 ${isCircular ? 'rounded-full' : 'rounded-md'}`}
              style={{
                width: `${cropBoxWidth}px`,
                height: `${cropBoxHeight}px`,
              }}
            >
            </div>
          </div>

          <p className="text-[11px] font-semibold text-slate-400 mt-3 flex items-center gap-1.5">
            <Move className="w-3 h-3 text-red-400" /> Drag image or adjust zoom to fit
          </p>
        </div>

        {/* Controls Section */}
        <div className="p-6 space-y-4 bg-white">
          {/* Zoom & Rotate Bar */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="range"
              min={0.8}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
            <button
              type="button"
              onClick={handleRotate}
              title="Rotate 90°"
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-red-600 hover:border-red-300 transition-all shadow-2xs shrink-0 ml-1"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95 text-xs"
            >
              <Check className="w-4 h-4" /> Apply / Save Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
