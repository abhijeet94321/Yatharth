'use client';

import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { MeditationTimer } from '@/components/dashboard/meditation-timer';
import { DailyStats } from '@/components/dashboard/daily-stats';
import { MeditationChart } from '@/components/dashboard/meditation-chart';
import type { MeditationSession, UserProfile } from '@/lib/types';
import { TodaysSessions } from '@/components/dashboard/todays-sessions';
import { RecommendedVideo } from '@/components/dashboard/recommended-video';
import { Loader2 } from 'lucide-react';

function DashboardContent() {
    const { user } = useUser();
    const firestore = useFirestore();

    const sessionsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, 'users', user.uid, 'meditationSessions');
    }, [firestore, user]);

    const { data: userSessions, isLoading: sessionsLoading } = useCollection<MeditationSession>(sessionsQuery);

    const userProfileRef = useMemoFirebase(() => {
      if (!user) return null;
      return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfileRef);

    if (!user || profileLoading || sessionsLoading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {userProfile?.recommendedVideoUrl && (
                <RecommendedVideo videoUrl={userProfile.recommendedVideoUrl} />
            )}
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
