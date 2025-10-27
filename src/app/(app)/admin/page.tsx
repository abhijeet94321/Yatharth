'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { users as allUsers, meditationSessions as allSessions } from '@/lib/data';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import type { User, MeditationSession } from '@/lib/types';
import { Loader2 } from 'lucide-react';


function AdminPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [adminData, setAdminData] = useState<{users: User[], sessions: MeditationSession[]} | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user?.role !== 'admin') {
            router.replace('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
      // In a real app, this would be a protected API call.
      // We simulate a fetch here.
      if(user?.role === 'admin') {
        setAdminData({
          users: allUsers,
          sessions: allSessions,
        });
        setLoading(false);
      }
    }, [user]);

    if (authLoading || loading || user?.role !== 'admin') {
        return (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            {adminData && <AdminDashboard users={adminData.users} sessions={adminData.sessions} />}
        </div>
    );
}


export default AdminPage;
