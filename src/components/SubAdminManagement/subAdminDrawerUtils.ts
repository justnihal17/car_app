export interface SubAdminDrawerConfig {
  drawerWidthClass: string;
  defaultPermissions: string[];
}

export const getLoggedInAdminName = (): string => {
  try {
    const profile = JSON.parse(sessionStorage.getItem('adminProfile') || '{}');
    if (profile.name) return profile.name;
    if (profile.fullName) return profile.fullName;
    if (profile.firstName) {
      return `${profile.firstName} ${profile.lastName || ''}`.trim();
    }
    if (profile.adminId) return profile.adminId;
  } catch (e) {
    console.error('Failed to parse adminProfile from localStorage', e);
  }
  return 'Super Admin';
};

export const ALL_ACCESS_MODULES = [
  'Dashboard',
  'Users',
  'Service Agents',
  'Services',
  'Categories',
  'Bookings',
  'Payments',
  'Reports',
  'Settings'
];

export const getResponsiveDrawerClass = (): string => {
  return "w-full sm:max-w-xl lg:max-w-xl xl:max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200/80 animate-in slide-in-from-right duration-300";
};
