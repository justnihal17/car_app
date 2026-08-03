import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Crop, Move } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  file: File | null;
  onClose: () => void;
  onCropComplete: (croppedFile: File, croppedPreviewUrl: string) => void;
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  file,
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cropBox, setCropBox] = useState({ width: 220, height: 220 }); // Square crop box size in px

  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isResizingBox, setIsResizingBox] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 220, height: 220 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset state when modal opens with a new image
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setCropBox({ width: 220, height: 220 });
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  // Handle Drag Image
  const handleMouseDownImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingImage(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  // Handle Corner Handle Drag (Resize Square Crop Box)
  const handleMouseDownResize = (e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizingBox(corner);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: cropBox.width,
      height: cropBox.height,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingImage) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (isResizingBox) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      const effectiveDeltaX = (isResizingBox === 'tl' || isResizingBox === 'bl') ? -deltaX : deltaX;
      const effectiveDeltaY = (isResizingBox === 'tl' || isResizingBox === 'tr') ? -deltaY : deltaY;

      const newWidth = Math.max(100, Math.min(280, resizeStart.width + effectiveDeltaX));
      const newHeight = Math.max(100, Math.min(280, resizeStart.height + effectiveDeltaY));
      setCropBox({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingImage(false);
    setIsResizingBox(null);
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
    setIsResizingBox(null);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Crop & Export to Canvas
  const handleApplyCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const baseResolution = 800; // max dimension
    const cropRatio = cropBox.width / cropBox.height;
    
    let canvasWidth = baseResolution;
    let canvasHeight = baseResolution;
    
    if (cropRatio > 1) {
      canvasHeight = baseResolution / cropRatio;
    } else {
      canvasWidth = baseResolution * cropRatio;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.save();

    // Center canvas
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const scaleFactor = canvasWidth / cropBox.width;

    const renderWidth = img.naturalWidth * zoom * scaleFactor;
    const renderHeight = img.naturalHeight * zoom * scaleFactor;

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

      const fileName = file ? file.name : 'cropped-profile.png';
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
                className="max-w-none pointer-events-none"
                style={{
                  maxHeight: '320px',
                  objectFit: 'contain',
                }}
                crossOrigin="anonymous"
              />
            </div>

            {/* Adjustable Phone Style Square Crop Box */}
            <div
              className="absolute pointer-events-auto border-2 border-red-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.75)] rounded-xl transition-all duration-75"
              style={{
                width: `${cropBox.width}px`,
                height: `${cropBox.height}px`,
              }}
            >
              {/* 3x3 Phone Crop Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none rounded-lg overflow-hidden">
                <div className="border-r border-b border-white/25" />
                <div className="border-r border-b border-white/25" />
                <div className="border-b border-white/25" />
                <div className="border-r border-b border-white/25" />
                <div className="border-r border-b border-white/25" />
                <div className="border-b border-white/25" />
              </div>

              {/* 4 Phone-Style Corner Crop Handles */}
              {/* Top-Left */}
              <div
                onMouseDown={(e) => handleMouseDownResize(e, 'tl')}
                className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-red-600 rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform z-30 flex items-center justify-center"
              >
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              </div>
              {/* Top-Right */}
              <div
                onMouseDown={(e) => handleMouseDownResize(e, 'tr')}
                className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-red-600 rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform z-30 flex items-center justify-center"
              >
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              </div>
              {/* Bottom-Left */}
              <div
                onMouseDown={(e) => handleMouseDownResize(e, 'bl')}
                className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-red-600 rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform z-30 flex items-center justify-center"
              >
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              </div>
              {/* Bottom-Right */}
              <div
                onMouseDown={(e) => handleMouseDownResize(e, 'br')}
                className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-red-600 rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform z-30 flex items-center justify-center"
              >
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              </div>
            </div>
          </div>

          <p className="text-[11px] font-semibold text-slate-400 mt-3 flex items-center gap-1.5">
            <Move className="w-3 h-3 text-red-400" /> Drag image or corners to crop unwanted space
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

          {/* Preset Buttons for Quick Sizes */}
          <div className="flex items-center justify-between text-xs gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Crop Box Size:</span>
            <div className="flex items-center gap-1.5">
              {[
                { label: 'Small', size: 160 },
                { label: 'Medium', size: 220 },
                { label: 'Large', size: 270 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setCropBox({ width: preset.size, height: preset.size })}
                  className={`px-3 py-1 rounded-lg font-bold border transition-all text-[11px] ${
                    cropBox.width === preset.size
                      ? 'bg-red-50 text-red-600 border-red-200 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
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
              <Check className="w-4 h-4" /> Crop & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
