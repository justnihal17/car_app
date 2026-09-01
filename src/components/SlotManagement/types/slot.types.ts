export interface SlotSettings {
  globalCapacity: number;
  weeklyOffDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  slotBufferMinutes: number;
  maxAdvanceDays: number;
  active?: boolean;
}

export interface MasterSlot {
  _id?: string;
  id?: string;
  slotCode?: string;
  startTime: string; // "HH:mm" (24-hour, e.g., "08:00")
  endTime: string;   // "HH:mm" (24-hour, e.g., "09:00")
  label: string;     // e.g., "08:00 AM - 09:00 AM"
  useGlobalCapacity: boolean;
  capacity?: number | null;
  effectiveCapacity?: number;
  displayOrder: number;
  active: boolean;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type BlockedDateType = 'HOLIDAY' | 'OFF_DAY' | 'MAINTENANCE' | 'CUSTOM';

export interface BlockedDate {
  _id?: string;
  id?: string;
  date: string; // "YYYY-MM-DD"
  reason: string;
  type: BlockedDateType;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
