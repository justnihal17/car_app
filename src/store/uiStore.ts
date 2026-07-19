import { create } from 'zustand';

interface UIState {
  isNotificationOpen: boolean;
  isMessageOpen: boolean;
  isEditProfileOpen: boolean;
  toggleNotification: () => void;
  toggleMessage: () => void;
  toggleEditProfile: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isNotificationOpen: false,
  isMessageOpen: false,
  isEditProfileOpen: false,
  toggleNotification: () => set((state) => ({ isNotificationOpen: !state.isNotificationOpen, isMessageOpen: false })),
  toggleMessage: () => set((state) => ({ isMessageOpen: !state.isMessageOpen, isNotificationOpen: false })),
  toggleEditProfile: () => set((state) => ({ isEditProfileOpen: !state.isEditProfileOpen })),
}));
