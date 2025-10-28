'use client';

import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import type { UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { collection, doc } from 'firebase/firestore';


function AdminPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    
    const userProfileRef = useMemoFirebase(() => {
      if (!user) return null;
      return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: allUsers, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

    useEffect(() => {
        if (!isUserLoading && !isProfileLoading && userProfile && userProfile?.role !== 'admin') {
            router.replace('/dashboard');
        }
    }, [user, userProfile, isUserLoading, isProfileLoading, router]);

    const loading = isUserLoading || isProfileLoading || usersLoading;

    if (loading || userProfile?.role !== 'admin') {
        return (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            {allUsers && <AdminDashboard users={allUsers} sessions={[]} />}
        </div>
    );
}


export default AdminPage;
