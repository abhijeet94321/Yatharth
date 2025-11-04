'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { requestNotificationPermission } from '@/firebase/notifications';

export function NotificationPermissionManager() {
  const { user } = useUser();

  useEffect(() => {
    // Only run on the client, when the user is logged in
    if (typeof window !== 'undefined' && user) {
        // We'll request permission after a short delay to not overwhelm the user on login
        const timeoutId = setTimeout(() => {
            requestNotificationPermission(user.uid);
        }, 5000); // 5-second delay

        return () => clearTimeout(timeoutId);
    }
  }, [user]);

  // This component does not render anything
  return null;
}
