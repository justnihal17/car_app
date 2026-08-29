import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { clsx } from 'clsx';

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  placement?: 'top' | 'bottom' | 'auto';
  size?: 'sm' | 'md' | 'lg';
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className,
  disabled = false,
  searchable = false,
  placement = 'auto',
  size = 'sm',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [computedPlacement, setComputedPlacement] = useState<'top' | 'bottom'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (placement === 'top') {
        setComputedPlacement('top');
      } else if (placement === 'bottom') {
        setComputedPlacement('bottom');
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < 240 && spaceAbove > spaceBelow) {
          setComputedPlacement('top');
        } else {
          setComputedPlacement('bottom');
        }
      }
    }
  }, [isOpen, placement]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, searchable]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  const sizeClasses = {
    sm: 'h-8 pl-2.5 pr-2.5 text-xs',
    md: 'h-9 pl-3 pr-3 text-xs',
    lg: 'h-10 pl-3.5 pr-3.5 text-sm'
  };

  return (
    <div className={clsx('relative', className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={clsx(
          'w-full flex items-center justify-between text-left border rounded-lg transition-all outline-none font-normal shadow-2xs',
          sizeClasses[size] || sizeClasses.sm,
          disabled ? 'bg-slate-50 cursor-not-allowed opacity-60 text-slate-400' : 'bg-white cursor-pointer',
          isOpen ? 'border-slate-300 ring-1 ring-slate-200' : 'border-slate-200/90 hover:border-slate-300',
          !selectedOption ? 'text-slate-500' : 'text-slate-800'
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={clsx('w-3.5 h-3.5 transition-transform duration-200 text-slate-400 shrink-0 ml-1.5', isOpen && 'rotate-180 text-red-500')}
        />
      </button>

      {isOpen && (
        <div className={clsx(
          "absolute z-[99] w-full min-w-[170px] bg-white border border-slate-200/90 rounded-xl shadow-lg py-1.5 max-h-64 flex flex-col animate-in fade-in zoom-in-95 duration-150 overflow-hidden",
          computedPlacement === 'top' ? "bottom-full mb-1.5 origin-bottom" : "top-full mt-1.5 origin-top"
        )}>
          {searchable && (
            <div className="px-2.5 pb-1.5 mb-1 border-b border-slate-100 sticky top-0 bg-white z-10 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 h-7"
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto custom-scrollbar flex-1 py-0.5 space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={clsx(
                      'w-[calc(100%-8px)] mx-1 text-left px-2.5 py-1.5 rounded-md flex items-center justify-between text-xs transition-colors cursor-pointer',
                      isSelected ? 'bg-red-50 text-red-600 font-semibold' : 'text-slate-700 hover:bg-slate-50/80 font-normal'
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-red-600 shrink-0 ml-1.5" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-3 text-xs text-slate-400 text-center font-normal">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
