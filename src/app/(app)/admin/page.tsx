import { users, meditationSessions } from '@/lib/data';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

// Server component to fetch all data for the admin dashboard
async function getAdminData() {
  // In a real app, this would be a protected database query.
  return {
    allUsers: users,
    allSessions: meditationSessions,
  };
}

export default async function AdminPage() {
    const { allUsers, allSessions } = await getAdminData();
    
    // An additional client-side check for role can be added in a layout or the page itself for extra security
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <AdminDashboard users={allUsers} sessions={allSessions} />
        </div>
    );
}

// You can add this client component for role-based protection
'use client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user?.role !== 'admin') {
            router.replace('/dashboard');
        }
    }, [user, loading, router]);

    if (loading || user?.role !== 'admin') {
        return null; // Or a loading/unauthorized message
    }

    return <>{children}</>;
}

const AdminPageWithGuard = () => (
    <AdminGuard>
        <AdminPage/>
    </AdminGuard>
);
