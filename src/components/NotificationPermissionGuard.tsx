import React, { useState, useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { NotificationPermissionModal } from './NotificationPermissionModal';
import { NotificationDeniedBanner } from './NotificationDeniedBanner';

const DISMISS_CACHE_KEY = 'fcm_permission_dismissed_until';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function NotificationPermissionGuard({ children }: { children?: React.ReactNode }) {
  const { permission, requestPermission } = usePushNotifications();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Disabled auto-popup on load as requested by user
    setIsModalOpen(false);
  }, [permission]);

  const handleEnable = async () => {
    setIsModalOpen(false);
    await requestPermission();
  };

  const handleNotNow = () => {
    setIsModalOpen(false);
    const expireTime = Date.now() + TWENTY_FOUR_HOURS_MS;
    localStorage.setItem(DISMISS_CACHE_KEY, expireTime.toString());
  };

  return (
    <>
      {children}
      <NotificationPermissionModal
        isOpen={isModalOpen}
        onEnable={handleEnable}
        onNotNow={handleNotNow}
      />
    </>
  );
}

export { NotificationDeniedBanner };
