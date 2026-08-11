import React from 'react';

interface ServiceCardProps {
  image?: string;
  title: string;
  onClick?: () => void;
  className?: string;
}

export function ServiceCard({ image, title, onClick, className = '' }: ServiceCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`relative w-full max-w-[340px] aspect-square rounded-[16px] overflow-hidden group cursor-pointer border border-slate-800 shadow-xl ${className}`}
    >
      {/* Fallback Background */}
      <div className="absolute inset-0 bg-[#0f1218] -z-20" />

      {/* Blurred background extension for padding/letterboxing */}
      {image && (
        <div 
          className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-60 -z-10"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}

      {/* Main Image Layer: 1:1 contain fit, 100% visible, no crop */}
      {image ? (
        <img 
          src={image} 
          alt={title} 
          className="absolute inset-0 w-full h-full object-contain"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-medium">
          No Image
        </div>
      )}
      
      {/* Dark Overlay Gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90" />
      
      {/* Content Area */}
      <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end">
        <h3 className="text-white font-bold uppercase text-lg sm:text-xl leading-tight mb-3 drop-shadow-md">
          {title}
        </h3>
        
        {/* Red Accent CTA/Highlight */}
        <div className="w-12 h-1.5 bg-[#D32F2F] rounded-full group-hover:w-20 transition-all duration-300 shadow-[0_0_8px_rgba(211,47,47,0.6)]" />
      </div>
    </div>
  );
}
