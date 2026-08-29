import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { clsx } from 'clsx';

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface CustomMultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  placement?: 'top' | 'bottom' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  allLabel?: string;
}

export function CustomMultiSelect({
  values = [],
  onChange,
  options = [],
  placeholder = 'Select options...',
  className,
  disabled = false,
  searchable = true,
  placement = 'auto',
  size = 'sm',
  allLabel = 'All Selected',
}: CustomMultiSelectProps) {
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
        if (spaceBelow < 250 && spaceAbove > spaceBelow) {
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

  const allSelected = options.length > 0 && values.length === options.length;
  const noneSelected = values.length === 0;

  const handleToggle = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  const handleSelectAll = () => {
    onChange(options.map((o) => o.value));
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  const filteredOptions = searchable
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  const sizeClasses = {
    sm: 'min-h-[32px] py-1 px-3 text-xs',
    md: 'min-h-[36px] py-1 px-3.5 text-xs',
    lg: 'min-h-[40px] py-1.5 px-4 text-sm',
  };

  const renderButtonText = () => {
    if (noneSelected) {
      return <span className="text-slate-400 font-normal">{placeholder}</span>;
    }
    if (allSelected) {
      return (
        <span className="font-semibold text-slate-800">
          {allLabel} ({options.length})
        </span>
      );
    }
    if (values.length <= 2) {
      const labels = values
        .map((v) => {
          const match = options.find((o) => o.value === v || o.label === v);
          if (match) return match.label;
          if (/^[0-9a-fA-F]{24}$/.test(String(v))) {
            return options.length === 0 ? 'Loading...' : '';
          }
          return v;
        })
        .filter(Boolean)
        .join(', ');
      return <span className="font-semibold text-slate-800 truncate">{labels || (options.length === 0 ? 'Loading...' : 'Selected Item')}</span>;
    }
    return (
      <span className="font-semibold text-slate-800">
        {values.length} items selected
      </span>
    );
  };

  return (
    <div className={clsx('relative', className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={clsx(
          'w-full flex items-center justify-between text-left border rounded-lg transition-all outline-none shadow-2xs cursor-pointer',
          sizeClasses[size] || sizeClasses.sm,
          disabled ? 'bg-slate-50 cursor-not-allowed opacity-60 text-slate-400' : 'bg-white',
          isOpen ? 'border-slate-300 ring-1 ring-slate-200' : 'border-slate-200/90 hover:border-slate-300'
        )}
      >
        <div className="flex-1 truncate pr-2">{renderButtonText()}</div>
        <div className="flex items-center gap-1.5 shrink-0">
          {values.length > 0 && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleDeselectAll();
              }}
              className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear selection"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={clsx('w-3.5 h-3.5 transition-transform duration-200 text-slate-400', isOpen && 'rotate-180 text-red-500')}
          />
        </div>
      </button>

      {isOpen && (
        <div
          className={clsx(
            'absolute z-[99] w-full min-w-[220px] bg-white border border-slate-200/90 rounded-xl shadow-lg py-1.5 max-h-64 flex flex-col animate-in fade-in zoom-in-95 duration-150 overflow-hidden',
            computedPlacement === 'top' ? 'bottom-full mb-1.5 origin-bottom' : 'top-full mt-1.5 origin-top'
          )}
        >
          {searchable && (
            <div className="px-2.5 pb-1.5 mb-1 border-b border-slate-100 sticky top-0 bg-white z-10 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-slate-300 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* Dropdown Options List */}
          <div className="overflow-y-auto flex-1 px-1 py-0.5 space-y-0.5 max-h-44 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-center text-xs text-slate-400">
                No items found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = values.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => handleToggle(option.value)}
                    className={clsx(
                      'px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer select-none',
                      isSelected
                        ? 'bg-red-50/50 text-slate-900 font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={clsx(
                          'w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0',
                          isSelected
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'border-slate-300 bg-white'
                        )}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="truncate">{option.label}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
