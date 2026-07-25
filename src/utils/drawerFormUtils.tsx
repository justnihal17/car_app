import React from 'react';
import '../styles/drawerFormUtils.css';

/**
 * Returns compact drawer container class (464px width with animation)
 */
export const getMasterDrawerClass = (): string => {
  return "drawer-container-compact animate-in slide-in-from-right duration-300";
};

/**
 * Section Active Toggle Component
 */
export interface MasterActiveToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export const MasterActiveToggle: React.FC<MasterActiveToggleProps> = ({
  checked,
  onChange,
  disabled
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-slate-600">Active</span>
      <button 
        type="button" 
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${checked ? 'bg-red-600' : 'bg-slate-300'} ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  );
};

/**
 * Section Heading Component with Red Indicator Badge
 */
export interface MasterSectionHeaderProps {
  title: string;
  badgeColor?: string;
  rightAction?: React.ReactNode;
}

export const MasterSectionHeader: React.FC<MasterSectionHeaderProps> = ({
  title,
  badgeColor = "bg-red-600",
  rightAction
}) => {
  return (
    <div className="flex items-center justify-between pb-1">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-4 ${badgeColor} rounded-full`} />
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{title}</h4>
      </div>
      {rightAction}
    </div>
  );
};
