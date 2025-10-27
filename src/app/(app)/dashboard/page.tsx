'use client';

import { useAuth } from '@/lib/auth';
import { meditationSessions as allSessions } from '@/lib/data';
import { MeditationTimer } from '@/components/dashboard/meditation-timer';
import { DailyStats } from '@/components/dashboard/daily-stats';
import { MeditationChart } from '@/components/dashboard/meditation-chart';

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

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <DashboardContent />
        </div>
    );
}
