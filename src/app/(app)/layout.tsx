'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { AppLayout } from '@/components/layout/app-layout';
import { Loader2 } from 'lucide-react';
import { NotificationPermissionManager } from '@/components/NotificationPermissionManager';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';


function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
      return;
    }

    if (!isUserLoading && !isProfileLoading && user && userProfile) {
        const isProfileComplete = userProfile.dob && userProfile.profession && userProfile.mobileNumber;
        const isOnCompleteProfilePage = pathname === '/complete-profile';

        if (!isProfileComplete && !isOnCompleteProfilePage) {
            router.replace('/complete-profile');
        } else if (isProfileComplete && isOnCompleteProfilePage) {
            router.replace('/dashboard');
        }
    }
  }, [user, isUserLoading, userProfile, isProfileLoading, router, pathname]);

  if (isUserLoading || isProfileLoading || !user || !userProfile) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If profile is incomplete, let the effect handle redirection, don't render children.
  // The complete-profile page will be rendered through its own route.
  if (!(userProfile.dob && userProfile.profession && userProfile.mobileNumber) && pathname !== '/complete-profile') {
    return (
       <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>
    { pathname !== '/complete-profile' && <NotificationPermissionManager /> }
    {children}
  </>;
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // The complete-profile page doesn't need the full AppLayout
  if (pathname === '/complete-profile') {
      return (
          <AuthGuard>
              <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
                  {children}
              </div>
          </AuthGuard>
      )
  }

  return (
    <AuthGuard>
      <AppLayout>{children}</AppLayout>
    </AuthGuard>
  );
}
