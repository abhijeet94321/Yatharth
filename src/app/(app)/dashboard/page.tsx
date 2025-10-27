import { users, meditationSessions } from '@/lib/data';
import { cookies } from 'next/headers';
import { MeditationTimer } from '@/components/dashboard/meditation-timer';
import { DailyStats } from '@/components/dashboard/daily-stats';
import { MeditationChart } from '@/components/dashboard/meditation-chart';

// This is a server component, so we can fetch data directly.
// We're mocking authentication by reading a 'userId' that would be set in a real app.
// The AuthProvider on the client uses localStorage, here we simulate getting it from a secure cookie.
async function getUserData() {
  // In a real app, you'd get the user from a session.
  // We'll mimic this by checking a value our client-side auth might set.
  // For this demo, let's assume `useAuth` on the client has set a cookie or that we can get the user ID.
  // The client side auth uses localStorage, which isn't available on the server.
  // We'll have to rely on the client component to pass the user ID.
  // A better approach in a real app would be http-only cookies.
  
  // As a workaround for this mock setup, we'll hardcode a user.
  // In a real app with server-side sessions, this would be:
  // const session = await getSession(); const userId = session.user.id;
  const mockUserId = 'user-1';
  
  const user = users.find(u => u.id === mockUserId);
  const userSessions = meditationSessions.filter(s => s.userId === mockUserId);

  return { user, userSessions };
}


export default async function DashboardPage() {
    // This server component can fetch data, but for interactivity and auth context, we need client components.
    // So this page will act as a container for client components.
    
    // In a real app, this would be `const {user} = useAuth()`, but that's a client hook.
    // Let's create a small client component to bridge this gap.
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <DashboardContent />
        </div>
    );
}

// Client component to access auth context and pass user ID to children
'use client';
import { useAuth } from '@/lib/auth';
import { meditationSessions as allSessions } from '@/lib/data';

function DashboardContent() {
    const { user } = useAuth();

    if (!user) {
        return null; // Or a loading state
    }
    
    // Filter sessions on the client for the current user
    const userSessions = allSessions.filter(s => s.userId === user.id);

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <MeditationTimer userId={user.id} />
            </div>
            <div className="space-y-6">
                <DailyStats sessions={userSessions} />
            </div>
            <div className="lg:col-span-3">
                <MeditationChart sessions={userSessions} />
            </div>
        </div>
    );
}
