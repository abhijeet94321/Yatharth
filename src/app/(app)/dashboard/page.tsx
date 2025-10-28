'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { MeditationTimer } from '@/components/dashboard/meditation-timer';
import { DailyStats } from '@/components/dashboard/daily-stats';
import { MeditationChart } from '@/components/dashboard/meditation-chart';
import type { MeditationSession } from '@/lib/types';
import { TodaysSessions } from '@/components/dashboard/todays-sessions';

function DashboardContent() {
    const { user } = useUser();
    const firestore = useFirestore();

    const sessionsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, 'users', user.uid, 'meditationSessions');
    }, [firestore, user]);

    const { data: userSessions } = useCollection<MeditationSession>(sessionsQuery);

    if (!user) {
        return null; // Or a loading state
    }

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <MeditationTimer userId={user.uid} />
            </div>
            <div className="space-y-6">
                <DailyStats sessions={userSessions || []} />
                <TodaysSessions sessions={userSessions || []} userId={user.uid} />
            </div>
            <div className="lg:col-span-3">
                <MeditationChart sessions={userSessions || []} />
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
