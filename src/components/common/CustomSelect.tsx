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
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className,
  disabled = false,
  searchable = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className={clsx('relative', className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={clsx(
          'w-full flex items-center justify-between text-left border rounded-xl px-5 py-3.5 transition-all outline-none font-medium',
          disabled ? 'bg-slate-50 cursor-not-allowed opacity-70' : 'bg-white cursor-pointer',
          isOpen ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 hover:border-slate-300',
          !selectedOption && 'text-slate-500'
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={clsx('w-5 h-5 transition-transform duration-200 text-slate-400 shrink-0 ml-2', isOpen && 'rotate-180 text-red-500')}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/50 py-2 max-h-72 flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          {searchable && (
            <div className="px-3 pb-2 mb-1 border-b border-slate-100 sticky top-0 bg-white z-10 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto custom-scrollbar flex-1">
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
                      'w-full text-left px-5 py-2.5 flex items-center justify-between transition-colors',
                      isSelected ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-red-500 shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="px-5 py-4 text-sm text-slate-500 text-center font-medium">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
